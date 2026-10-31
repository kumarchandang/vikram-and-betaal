/* Night sounds made on the fly with Web Audio: wind, a low drone, owls and the crackle of the pyre. */
export type Sfx = 'whoosh' | 'crack' | 'chime' | 'burst';

export class NightSound {
  private ctx?: AudioContext;
  private master?: GainNode;
  private noise?: AudioBuffer;
  private timers: number[] = [];
  enabled = true;

  start(): void {
    if (!this.enabled) return;
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    void ctx.resume();
    this.master!.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
    this.schedule();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    // Browsers only allow audio after a click, so switching on before the night begins just records the choice.
    if (on) {
      if (this.ctx) this.start();
      return;
    }
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  sfx(kind: Sfx): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    if (kind === 'whoosh') {
      const src = this.noiseSource();
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(260, t);
      bp.frequency.exponentialRampToValueAtTime(2200, t + 0.5);
      bp.frequency.exponentialRampToValueAtTime(400, t + 1.1);
      const g = this.env(t, 0.35, 0.15, 1.1);
      src.connect(bp).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + 1.2);
    } else if (kind === 'crack' || kind === 'burst') {
      const src = this.noiseSource();
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = kind === 'burst' ? 600 : 1800;
      const g = this.env(t, kind === 'burst' ? 0.9 : 0.6, 0.005, kind === 'burst' ? 0.9 : 0.25);
      src.connect(hp).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + 1);
      const thud = ctx.createOscillator();
      thud.frequency.setValueAtTime(kind === 'burst' ? 120 : 90, t);
      thud.frequency.exponentialRampToValueAtTime(40, t + 0.4);
      const tg = this.env(t, 0.5, 0.005, 0.45);
      thud.connect(tg).connect(this.master);
      thud.start(t);
      thud.stop(t + 0.5);
    } else if (kind === 'chime') {
      [523.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const g = this.env(t + i * 0.09, 0.12, 0.01, 1.8);
        o.connect(g).connect(this.master!);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 2);
      });
    }
  }

  private build(): void {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    // Wind: looping noise through a slowly wandering band-pass filter.
    const wind = this.noiseSource(true);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 480;
    bp.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 260;
    lfo.connect(lfoDepth).connect(bp.frequency);
    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    wind.connect(bp).connect(windGain).connect(this.master);
    wind.start();
    lfo.start();

    // Drone: a low tanpura-like fifth, barely there.
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.018;
    for (const f of [55, 82.41, 110.3]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    }
    lp.connect(droneGain).connect(this.master);
  }

  private schedule(): void {
    if (this.timers.length) return;
    const owl = () => {
      this.hoot();
      this.timers[0] = window.setTimeout(owl, 14000 + Math.random() * 20000);
    };
    const crackle = () => {
      this.pop();
      this.timers[1] = window.setTimeout(crackle, 120 + Math.random() * 700);
    };
    this.timers[0] = window.setTimeout(owl, 5000);
    this.timers[1] = window.setTimeout(crackle, 300);
  }

  private hoot(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    [0, 0.55, 0.8].forEach((d, i) => {
      const o = this.ctx!.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(i === 0 ? 410 : 380, t + d);
      o.frequency.linearRampToValueAtTime(i === 0 ? 380 : 350, t + d + 0.35);
      const g = this.env(t + d, 0.05, 0.06, i === 0 ? 0.45 : 0.3);
      o.connect(g).connect(this.master!);
      o.start(t + d);
      o.stop(t + d + 0.6);
    });
  }

  private pop(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const src = this.noiseSource();
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2500 + Math.random() * 2500;
    const g = this.env(t, 0.02 + Math.random() * 0.04, 0.002, 0.04);
    src.connect(hp).connect(g).connect(this.master);
    src.start(t, Math.random());
    src.stop(t + 0.06);
  }

  private noiseSource(loop = false): AudioBufferSourceNode {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise!;
    src.loop = loop;
    return src;
  }

  private env(t: number, peak: number, attack: number, decay: number): GainNode {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }
}
