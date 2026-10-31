import { paragraphsOf, type CastMember, type Scene, type Storyboard } from '../shared/puppets';
import type { StoryEvent, Tale } from '../shared/types';
import { alignScenes, parseJson, toCast, toScene } from './json';

export type SectionName = keyof Tale | 'cast';

/** A stage direction written inside the story, just before the paragraph it stages. */
export interface SceneLine {
  paragraph: number;
  raw: string;
  complete: boolean;
}

export type Sections = Tale & { cast: string; scenes: SceneLine[]; current: SectionName | null };

const ALIAS: Record<string, SectionName> = {
  opening: 'opening',
  title: 'title',
  cast: 'cast',
  characters: 'cast',
  story: 'story',
  tale: 'story',
  question: 'question',
  riddle: 'question',
  wisdom: 'wisdom',
  answer: 'wisdom',
  moral: 'wisdom',
};

// A marker sits alone on its line, e.g. "[STORY]" or "**[STORY]**".
const MARKER = /^[ \t]*[*#_]*[ \t]*\[([a-z]+)\][ \t]*[*_]*[ \t]*:?[ \t]*$/i;
// The unfinished last line of a stream that may still turn into a marker.
const PARTIAL_MARKER = /^[ \t]*[*#_]*[ \t]*\[[a-z]*\]?[ \t]*[*_]*[ \t]*$/i;
// Lines inside the story that are puppet-show directions, never tale text: "@scene {...}", or the
// stray pieces of one if Gemma ever breaks its JSON over several lines.
const DIRECTION = /^\s*@/;
const JSON_FRAGMENT = /^\s*([{}\[\]]|"\w+"\s*:)/;

/**
 * Splits Gemma's tagged reply into sections. While streaming (final = false)
 * a half-written marker on the last line is held back so it never leaks
 * into the story text.
 */
export function splitSections(buffer: string, final: boolean): Sections {
  let text = buffer.replace(/\r\n?/g, '\n');
  if (!final) {
    const lastNl = text.lastIndexOf('\n');
    if (PARTIAL_MARKER.test(text.slice(lastNl + 1))) text = text.slice(0, lastNl + 1);
  }

  const out = { opening: '', title: '', cast: '', story: '', question: '', wisdom: '' };
  const scenes: SceneLine[] = [];
  let paragraphs = 0;
  let current: SectionName | null = null;
  let sawMarker = false;
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const m = MARKER.exec(line);
    const name = m ? ALIAS[m[1].toLowerCase()] : undefined;
    if (name) {
      sawMarker = true;
      current = name;
      if (out[current]) out[current] += '\n\n';
      return;
    }
    if (current === 'story') {
      if (DIRECTION.test(line)) {
        scenes.push({ paragraph: paragraphs, raw: line.replace(/^\s*@\s*scene\s*:?/i, ''), complete: final || i < lines.length - 1 });
        return;
      }
      if (JSON_FRAGMENT.test(line)) return;
      if (line.trim()) paragraphs++;
    }
    if (current) out[current] += line + '\n';
  });

  if (final && !sawMarker) out.story = text;

  const tale = {} as Tale & { cast: string };
  for (const key of Object.keys(out) as SectionName[]) tale[key] = clean(out[key], key);
  return { ...tale, scenes, current };
}

function clean(s: string, key: SectionName): string {
  // Gemma sometimes copies the <placeholder> brackets from the format spec.
  let t = s.trim().replace(/^<+/, '').replace(/>+$/, '').trim();
  if (key === 'title') t = t.replace(/^["'“”‘’*#\s]+|["'“”‘’*\s]+$/g, '');
  // Every line break in the tale is a paragraph break, so text, voice and scenes all split it the same way.
  if (key === 'story') t = t.replace(/[ \t]*\n\s*/g, '\n\n');
  return t;
}

/** Turns a growing buffer into ordered events for the browser: text deltas, the cast, and scenes. */
export class TaleEmitter {
  private buf = '';
  private sent = { opening: '', story: '', question: '' };
  private titleSent = false;
  private castSent = false;
  private cast: CastMember[] = [];
  private scenes: (Scene | undefined)[] = [];

  constructor(private send: (e: StoryEvent) => void) {}

  /** Gemma's raw reply so far, for diagnosing a tale that came back incomplete. */
  get raw(): string {
    return this.buf;
  }

  push(delta: string): void {
    this.buf += delta;
    this.emit(splitSections(this.buf, false), false);
  }

  finish(): { tale: Tale; board: Storyboard | null } {
    const s = splitSections(this.buf, true);
    this.emit(s, true);
    const tale: Tale = { opening: s.opening, title: s.title, story: s.story, question: s.question, wisdom: s.wisdom };
    const scenes = alignScenes(this.scenes, paragraphsOf(tale.story).length);
    return { tale, board: this.cast.length && scenes.length ? { cast: this.cast, scenes } : null };
  }

  private emit(s: Sections, final: boolean): void {
    this.delta('opening', s.opening);
    const pastTitle = s.current !== null && s.current !== 'title' && s.current !== 'opening';
    if (!this.titleSent && s.title && (final || pastTitle)) {
      this.titleSent = true;
      this.send({ type: 'title', text: s.title });
    }
    if (!this.castSent && s.cast && (final || (pastTitle && s.current !== 'cast'))) {
      this.castSent = true;
      try {
        this.cast = toCast(parseJson(s.cast));
        this.send({ type: 'cast', cast: this.cast });
      } catch {
        // No usable cast: the browser falls back to asking for a separate storyboard.
      }
    }
    // Each scene goes out before the text of its paragraph, so the stage is ready first.
    for (const line of s.scenes) {
      if (!line.complete || !this.cast.length || line.paragraph in this.scenes) continue;
      try {
        const scene = toScene(parseJson(line.raw), this.cast);
        this.scenes[line.paragraph] = scene;
        this.send({ type: 'scene', index: line.paragraph, scene });
      } catch {
        this.scenes[line.paragraph] = undefined;
      }
    }
    this.delta('story', s.story);
    this.delta('question', s.question);
  }

  private delta(key: 'opening' | 'story' | 'question', text: string): void {
    const prev = this.sent[key];
    if (text.length > prev.length && text.startsWith(prev)) {
      this.send({ type: key, delta: text.slice(prev.length) });
      this.sent[key] = text;
    }
  }
}
