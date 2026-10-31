/**
 * Reveals streamed text at a steady, speech-like pace instead of in network-sized lumps.
 * Parts are revealed in order: part 1 starts only after part 0 is fully shown.
 */
export class Reveal {
  private targets: string[];
  private shown = 0;
  private raf = 0;
  private last = 0;

  constructor(
    parts: number,
    private render: (visible: string[]) => void,
    private onIdle: () => void,
  ) {
    this.targets = Array(parts).fill('');
  }

  set(part: number, text: string): void {
    this.targets[part] = text;
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  get idle(): boolean {
    return this.shown >= this.total;
  }

  flush(): void {
    this.shown = this.total;
    this.paint();
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private get total(): number {
    return this.targets.reduce((n, t) => n + t.length, 0);
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    const backlog = this.total - this.shown;
    const speed = Math.max(48, backlog / 1.4);
    this.shown = Math.min(this.total, this.shown + Math.max(1, Math.round(speed * dt)));
    this.paint();
    if (this.shown < this.total) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.raf = 0;
      this.onIdle();
    }
  };

  private paint(): void {
    let left = this.shown;
    this.render(
      this.targets.map((t) => {
        const n = Math.max(0, Math.min(t.length, left));
        left -= t.length;
        return t.slice(0, n);
      }),
    );
  }
}
