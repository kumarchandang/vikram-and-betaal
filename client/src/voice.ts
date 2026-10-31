import type { Lang } from '../../shared/types';

const MAX_IN_FLIGHT = 2;
// Browser voices are only a fallback, and only when they genuinely speak the language.
const BROWSER_LANGS: Record<Lang, string[]> = { en: ['en-IN', 'en-GB', 'en-US'], odia: ['or-IN'], 'odia-roman': ['en-IN'] };
const PREFERRED = ['Sukant', 'Prabhat', 'Ravi'];

/** Something to do when the voice reaches character `at` of a line, such as changing the scene. */
export interface Mark {
  at: number;
  run: () => void;
}

interface Line {
  text: string;
  audio: Promise<Blob | null>;
  marks: Mark[];
}

declare global {
  interface Window {
    __syncLog?: { text: string; at: number; spokenChar: number; audioTime: number; duration: number }[];
  }
}

/**
 * Betaal's voice. Each line is sent to /api/voice (Gemini speech) as soon as it is queued, and the
 * clips play back in order. Marks fire as playback reaches their place in the text, so the puppet
 * show changes scene at the moment the voice reaches each paragraph.
 */
export class Voice {
  enabled = true;
  lang: Lang = 'en';
  onSpeaking: (speaking: boolean) => void = () => {};
  /** Called once when Gemini speech runs out of quota; `hasFallback` says whether a browser voice takes over. */
  onQuota: (hasFallback: boolean) => void = () => {};

  private queue: Line[] = [];
  private playing = false;
  private generation = 0;
  private inFlight = 0;
  private waiting: (() => void)[] = [];
  private geminiPausedUntil = 0;
  private player = new Audio();
  private stopCurrent: (() => void) | null = null;
  private browserVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if ('speechSynthesis' in window) {
      const load = () => (this.browserVoices = speechSynthesis.getVoices());
      load();
      speechSynthesis.addEventListener('voiceschanged', load);
    }
  }

  /** Whether Betaal can actually be heard right now, through Gemini or a real browser voice. */
  get canSpeak(): boolean {
    return this.enabled && (Date.now() >= this.geminiPausedUntil || this.browserVoice() !== undefined);
  }

  say(text: string, marks: Mark[] = []): void {
    if (!this.enabled) return;
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) {
      marks.forEach((m) => m.run());
      return;
    }
    const sorted = [...marks].sort((a, b) => a.at - b.at);
    this.queue.push({ text: clean, audio: this.fetchAudio(clean, this.generation), marks: sorted });
    void this.pump();
  }

  reset(): void {
    this.generation++;
    this.queue = [];
    this.playing = false;
    this.player.pause();
    this.stopCurrent?.();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.onSpeaking(false);
  }

  private async fetchAudio(text: string, gen: number): Promise<Blob | null> {
    if (Date.now() < this.geminiPausedUntil) return null;
    if (this.inFlight >= MAX_IN_FLIGHT) await new Promise<void>((r) => this.waiting.push(r));
    if (gen !== this.generation) return this.release(null);
    this.inFlight++;
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang: this.lang, text }),
      });
      if (res.status === 429) {
        const wasPaused = Date.now() < this.geminiPausedUntil;
        this.geminiPausedUntil = Date.now() + (Number(res.headers.get('Retry-After')) || 60) * 1000;
        if (!wasPaused) this.onQuota(this.browserVoice() !== undefined);
      }
      return this.release(res.ok ? await res.blob() : null);
    } catch {
      return this.release(null);
    }
  }

  private release<T>(value: T): T {
    this.inFlight = Math.max(0, this.inFlight - 1);
    this.waiting.shift()?.();
    return value;
  }

  private async pump(): Promise<void> {
    if (this.playing) return;
    const line = this.queue.shift();
    if (!line) {
      this.onSpeaking(false);
      return;
    }
    const gen = this.generation;
    this.playing = true;
    const clip = await line.audio;
    if (gen !== this.generation) return;
    await (clip ? this.play(clip, line) : this.speakWithBrowser(line));
    if (gen !== this.generation) return;
    this.playing = false;
    void this.pump();
  }

  /** Fires the line's marks as playback passes them; returns a function taking the spoken character position. */
  private marker(line: Line, audioTime: () => [number, number]): (spokenChar: number) => void {
    let next = 0;
    return (spokenChar: number) => {
      while (next < line.marks.length && line.marks[next].at <= spokenChar) {
        const m = line.marks[next++];
        if (window.__syncLog) {
          const [t, d] = audioTime();
          window.__syncLog.push({ text: line.text.slice(m.at, m.at + 24), at: m.at, spokenChar: Math.round(spokenChar), audioTime: +t.toFixed(2), duration: +d.toFixed(2) });
        }
        m.run();
      }
    };
  }

  private play(clip: Blob, line: Line): Promise<void> {
    this.onSpeaking(true);
    const fire = this.marker(line, () => [this.player.currentTime, this.player.duration || 0]);
    return new Promise((resolve) => {
      const url = URL.createObjectURL(clip);
      let raf = 0;
      const finish = (reachedEnd: boolean) => {
        cancelAnimationFrame(raf);
        this.stopCurrent = null;
        URL.revokeObjectURL(url);
        if (reachedEnd) fire(Infinity);
        this.onSpeaking(false);
        resolve();
      };
      // Speech runs at a near-steady pace, so the share of the clip played tells us how far into the text the voice is.
      const tick = () => {
        const d = this.player.duration;
        if (d && Number.isFinite(d)) fire((this.player.currentTime / d) * line.text.length);
        raf = requestAnimationFrame(tick);
      };
      this.stopCurrent = () => finish(false);
      this.player.src = url;
      this.player.onended = () => finish(true);
      this.player.onerror = () => finish(true);
      fire(0);
      this.player
        .play()
        .then(() => (raf = requestAnimationFrame(tick)))
        .catch(() => finish(true));
    });
  }

  private speakWithBrowser(line: Line): Promise<void> {
    const voice = this.browserVoice();
    const start = performance.now();
    // Without any voice, take as long as reading aloud would, so the scenes keep the tale's pace.
    const silentMs = Math.min(40_000, line.text.length * 65);
    const fire = this.marker(line, () => [(performance.now() - start) / 1000, voice ? 0 : silentMs / 1000]);
    fire(0);
    if (!voice) {
      return new Promise((resolve) => {
        const t = window.setInterval(() => {
          const elapsed = performance.now() - start;
          fire((elapsed / silentMs) * line.text.length);
          if (elapsed >= silentMs) finish(true);
        }, 200);
        const finish = (reachedEnd: boolean) => {
          clearInterval(t);
          this.stopCurrent = null;
          if (reachedEnd) fire(Infinity);
          resolve();
        };
        this.stopCurrent = () => finish(false);
      });
    }
    this.onSpeaking(true);
    return new Promise((resolve) => {
      const finish = (reachedEnd: boolean) => {
        this.stopCurrent = null;
        if (reachedEnd) fire(Infinity);
        this.onSpeaking(false);
        resolve();
      };
      const u = new SpeechSynthesisUtterance(line.text);
      u.voice = voice;
      u.lang = voice.lang;
      u.pitch = 0.65;
      u.rate = 0.95;
      u.onboundary = (e) => fire(e.charIndex);
      u.onend = () => finish(true);
      u.onerror = () => finish(true);
      this.stopCurrent = () => finish(false);
      speechSynthesis.speak(u);
    });
  }

  private browserVoice(): SpeechSynthesisVoice | undefined {
    for (const tag of BROWSER_LANGS[this.lang]) {
      const matches = this.browserVoices.filter((v) => v.lang.replace('_', '-').toLowerCase() === tag.toLowerCase());
      if (matches.length) return matches.find((v) => PREFERRED.some((n) => v.name.includes(n))) ?? matches[0];
    }
    return undefined;
  }
}
