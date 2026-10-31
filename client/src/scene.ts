const SVG = 'http://www.w3.org/2000/svg';
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* The peepal tree: a gnarled trunk, one long branch for Betaal, and a canopy of heart-shaped leaves. */
export function buildTree(host: HTMLElement): void {
  const rand = mulberry32(7);
  const greens = ['#0c1d1b', '#10282a', '#143231', '#1b3f3c'];
  const moonlit = ['#24504a', '#2d5c55'];
  const clusters: [number, number, number, number, number][] = [
    [190, 236, 120, 78, 80],
    [306, 160, 140, 92, 100],
    [446, 270, 124, 84, 80],
    [258, 300, 112, 58, 46],
    [506, 410, 82, 60, 34],
    [124, 352, 84, 44, 34],
    [384, 214, 104, 70, 56],
  ];
  const leaves: string[] = [];
  for (const [cx, cy, rx, ry, n] of clusters) {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand());
      const x = cx + Math.cos(a) * rx * r;
      const y = cy + Math.sin(a) * ry * r;
      const lit = x < cx - rx * 0.2 && y < cy - ry * 0.1 && rand() > 0.35;
      const fill = lit ? moonlit[Math.floor(rand() * moonlit.length)] : greens[Math.floor(rand() * greens.length)];
      const rot = (rand() - 0.5) * 120;
      const s = 0.55 + rand() * 0.55;
      const flutter = rand() < 0.14 ? ` class="flutter" style="animation-delay:${(-rand() * 4).toFixed(2)}s"` : '';
      leaves.push(
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${s.toFixed(2)})"><use href="#peepal-leaf" fill="${fill}"${flutter}/></g>`,
      );
    }
  }

  host.innerHTML = `
  <svg viewBox="0 0 600 820" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
    <defs>
      <path id="peepal-leaf" d="M0 0 C-6 -1 -11 5 -10 12 C-9 19 -4 24 0 30 L0 38 L0.8 30 C4 24 9 19 10 12 C11 5 6 -1 0 0 Z"/>
    </defs>
    <g fill="#0a1716" stroke="#0a1716" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M228 820 C246 760 258 700 256 640 C254 590 240 548 226 512 C214 482 206 458 204 436 L226 430 C232 456 246 486 262 510 C268 470 270 430 262 392 L286 388 C296 430 298 472 292 512 C312 478 340 446 372 420 L388 436 C352 470 330 506 318 548 C306 596 310 650 326 712 C336 752 352 790 370 820 Z"/>
      <path stroke="none" d="M190 820 C206 806 224 798 246 794 L250 806 C232 810 214 814 200 820 Z M350 800 C372 798 396 804 416 820 L392 820 C380 812 366 808 352 808 Z"/>
      <path fill="none" stroke-width="15" d="M214 448 C176 420 140 404 96 400"/>
      <path fill="none" stroke-width="8" d="M96 400 C76 398 58 402 38 412"/>
      <path fill="none" stroke-width="12" d="M262 400 C250 340 226 290 190 250"/>
      <path fill="none" stroke-width="12" d="M276 392 C284 320 292 260 302 186"/>
      <path fill="none" stroke-width="13" d="M300 500 C340 440 400 380 460 330"/>
      <path fill="none" stroke-width="9" d="M330 560 C380 540 430 522 500 520"/>
      <path fill="none" stroke-width="5" d="M190 250 C170 230 160 214 150 196 M302 186 C300 160 310 136 324 116 M460 330 C480 300 486 280 490 256 M150 404 C140 384 132 370 126 352"/>
    </g>
    <circle id="hang-anchor" cx="92" cy="402" r="2" fill="none"/>
    <g class="canopy">${leaves.join('')}</g>
  </svg>`;
}

function shikhara(x: number, base: number, h: number, w: number): string {
  const top = base - h;
  return `M${x - w / 2} ${base} C${x - w / 2} ${base - h * 0.62} ${x - w * 0.2} ${top + h * 0.06} ${x} ${top}
    C${x + w * 0.2} ${top + h * 0.06} ${x + w / 2} ${base - h * 0.62} ${x + w / 2} ${base} Z
    M${x - w * 0.2} ${top + 2} a${w * 0.2} ${w * 0.07} 0 1 0 ${w * 0.4} 0 a${w * 0.2} ${w * 0.07} 0 1 0 ${-w * 0.4} 0 Z
    M${x - 1.4} ${top - w * 0.06} L${x - 1.4} ${top - w * 0.42} L${x + w * 0.22} ${top - w * 0.33} L${x + 1.4} ${top - w * 0.26} L${x + 1.4} ${top - w * 0.06} Z`;
}

function chhatri(x: number, base: number, w: number): string {
  const h = w * 0.9;
  return `M${x - w / 2} ${base - h * 0.5} h${w} v-${w * 0.08} h-${w} Z
    M${x - w * 0.42} ${base - h * 0.58} Q${x} ${base - h * 1.25} ${x + w * 0.42} ${base - h * 0.58} Z
    M${x - w * 0.44} ${base} h${w * 0.1} v-${h * 0.5} h-${w * 0.1} Z M${x + w * 0.34} ${base} h${w * 0.1} v-${h * 0.5} h-${w * 0.1} Z`;
}

/* Ujjain on the horizon: temple spires, chhatris and ghats, then the near ground of the cremation ground. */
export function buildSkyline(host: HTMLElement): void {
  const far = [
    'M0 330 C120 300 220 312 320 300 C420 290 520 306 640 296 C800 284 980 300 1120 290 C1280 280 1440 300 1600 292 L1600 400 L0 400 Z',
    shikhara(520, 300, 210, 92),
    shikhara(410, 304, 118, 58),
    shikhara(640, 300, 140, 66),
    shikhara(1240, 292, 96, 50),
    chhatri(860, 302, 46),
    chhatri(980, 300, 38),
    chhatri(1390, 296, 42),
    'M700 300 h60 v-34 h-60 Z M1060 296 h78 v-26 h-78 Z M240 306 h70 v-30 h-70 Z M1460 296 h50 v-40 h-50 Z',
  ].join(' ');
  const near =
    'M0 352 C200 338 380 350 600 344 C820 338 1040 352 1260 346 C1400 342 1500 348 1600 344 L1600 400 L0 400 Z';
  const stones = [130, 330, 1080, 1180, 1500]
    .map((x, i) => `M${x} 352 q8 -${16 + i * 3} 16 0 Z`)
    .join(' ');
  host.innerHTML = `
  <svg viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path d="${far}" fill="#141e4a"/>
    <path d="M0 322 L1600 318" stroke="#2b3a72" stroke-width="1" opacity=".6"/>
    <path d="${near}" fill="#0a1230"/>
    <path d="${stones}" fill="#0d1838"/>
  </svg>`;
}

export function buildPyre(host: HTMLElement): void {
  host.innerHTML = `
  <div class="pyre-glow"></div>
  <svg class="pyre-fire" viewBox="0 0 120 120" aria-hidden="true">
    <path class="flame flame-back" d="M60 18 C78 44 86 66 80 86 C76 100 44 100 40 86 C34 66 44 44 60 18 Z" fill="#c73a2c"/>
    <path class="flame flame-mid" d="M60 36 C74 56 78 72 74 88 C70 98 50 98 46 88 C42 72 48 56 60 36 Z" fill="#f2913d"/>
    <path class="flame flame-core" d="M60 58 C68 70 70 80 67 90 C64 96 56 96 53 90 C50 80 52 70 60 58 Z" fill="#f5d27a"/>
    <g stroke="#2a160e" stroke-width="7" stroke-linecap="round">
      <path d="M28 98 L92 90"/><path d="M30 90 L94 100"/><path d="M38 106 L84 104"/>
    </g>
  </svg>`;
}

/* Stars and pyre embers share one canvas behind everything. */
export function startSky(canvas: HTMLCanvasElement, pyre: HTMLElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rand = mulberry32(42);
  const stars = Array.from({ length: 150 }, () => ({
    x: rand(),
    y: Math.pow(rand(), 1.4) * 0.7,
    r: 0.4 + rand() * 1.1,
    phase: rand() * Math.PI * 2,
    speed: 0.4 + rand() * 1.4,
  }));
  type Ember = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number };
  let embers: Ember[] = [];
  let w = 0;
  let h = 0;
  let origin = { x: 0, y: 0 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = pyre.getBoundingClientRect();
    origin = { x: r.left + r.width / 2, y: r.top + r.height * 0.55 };
    if (reducedMotion) draw(0, 0);
  };

  const draw = (t: number, dt: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = reducedMotion ? 0.7 : 0.45 + Math.sin(t * s.speed + s.phase) * 0.35;
      ctx.fillStyle = `rgba(237, 230, 211, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (reducedMotion) return;
    if (Math.random() < dt * 16) {
      embers.push({
        x: origin.x + (Math.random() - 0.5) * 26,
        y: origin.y,
        vx: (Math.random() - 0.5) * 14,
        vy: -(34 + Math.random() * 46),
        life: 2.2 + Math.random() * 2.4,
        age: 0,
        size: 0.8 + Math.random() * 1.6,
      });
    }
    embers = embers.filter((e) => (e.age += dt) < e.life);
    for (const e of embers) {
      e.x += (e.vx + Math.sin(e.age * 3 + e.size) * 10) * dt;
      e.y += e.vy * dt;
      const fade = 1 - e.age / e.life;
      ctx.fillStyle = `rgba(242, ${Math.round(145 + 60 * fade)}, 61, ${(fade * 0.9).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * (0.6 + fade * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  window.addEventListener('resize', resize);
  resize();
  if (reducedMotion) return;
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!document.hidden) draw(now / 1000, dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* Betaal himself. Upright the shroud trails below his head; hanging, the whole figure turns over. */
const BETAAL_SVG = `
<svg class="betaal-svg" viewBox="0 0 160 240" aria-hidden="true">
  <defs>
    <linearGradient id="b-shroud" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9e4d6" stop-opacity=".95"/>
      <stop offset=".55" stop-color="#aab6d8" stop-opacity=".5"/>
      <stop offset="1" stop-color="#aab6d8" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="b-face" cx=".42" cy=".38" r=".75">
      <stop offset="0" stop-color="#f6f1e4"/><stop offset="1" stop-color="#c3c7d6"/>
    </radialGradient>
    <filter id="b-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="b-aura" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <ellipse cx="80" cy="96" rx="58" ry="84" fill="#9fb4ff" opacity=".2" filter="url(#b-aura)"/>
  <path class="b-shroud" d="M40 92 C30 140 42 178 58 204 C64 216 70 226 80 237 C88 224 96 214 104 200 C120 176 132 140 120 92 Z" fill="url(#b-shroud)"/>
  <path class="b-hair" fill="#4d5574" d="M80 16 C54 14 34 30 32 56 C30 76 28 98 22 120 L34 110 L36 130 L45 113 L50 132 L57 112 L103 112 L110 132 L115 113 L124 130 L126 110 L138 120 C132 98 130 76 128 56 C126 30 106 14 80 16 Z"/>
  <path d="M40 60 C38 80 36 98 32 112 M120 60 C122 80 124 98 128 112" stroke="#6b7394" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g class="b-arms" stroke="#d6d3c8" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M50 114 C56 130 70 138 90 132"/>
    <path d="M110 114 C104 130 90 138 70 132"/>
  </g>
  <circle cx="91" cy="131" r="3.6" fill="#d6d3c8"/>
  <circle cx="69" cy="131" r="3.6" fill="#d6d3c8"/>
  <ellipse cx="80" cy="70" rx="40" ry="46" fill="url(#b-face)"/>
  <path d="M52 84 C56 92 60 96 64 98 M108 84 C104 92 100 96 96 98" stroke="#a9adbf" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <g class="b-brows" stroke="#2a2f4f" stroke-width="3.2" stroke-linecap="round" fill="none">
    <path class="b-brow-l" d="M55 52 Q64 46 73 51"/>
    <path class="b-brow-r" d="M87 51 Q96 46 105 52"/>
  </g>
  <g class="b-eyes">
    <ellipse cx="65" cy="66" rx="10" ry="11" fill="#1b1f3b"/>
    <ellipse cx="95" cy="66" rx="10" ry="11" fill="#1b1f3b"/>
    <g class="b-pupils" filter="url(#b-glow)">
      <circle cx="66" cy="67" r="3.6" fill="#f2913d"/>
      <circle cx="96" cy="67" r="3.6" fill="#f2913d"/>
    </g>
  </g>
  <path d="M79 76 L75 87 L83 87" stroke="#9a9db0" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g class="b-mouth b-mouth-smirk"><path d="M64 98 Q80 106 97 94" stroke="#2a2f4f" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <g class="b-mouth b-mouth-talk"><ellipse cx="80" cy="99" rx="9" ry="6.5" fill="#1b1f3b"/></g>
  <g class="b-mouth b-mouth-laugh"><path d="M60 92 Q80 122 100 92 Z" fill="#1b1f3b"/><path d="M64 94 L96 94" stroke="#f3eee0" stroke-width="3"/></g>
  <g class="b-mouth b-mouth-frown"><path d="M64 105 Q80 93 96 105" stroke="#2a2f4f" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <g class="b-mouth b-mouth-o"><ellipse cx="80" cy="100" rx="4.5" ry="5.5" fill="#1b1f3b"/></g>
</svg>`;

export type Place = 'tree' | 'shoulder';
export type Mood = 'idle' | 'talk' | 'laugh' | 'angry' | 'think' | 'smug';

export class Betaal {
  private place: Place = 'tree';
  private body: HTMLElement;

  constructor(
    private el: HTMLButtonElement,
    private treeAnchor: () => DOMRect | null,
    private shoulderAnchor: () => DOMRect | null,
  ) {
    el.innerHTML = `<span class="betaal-body">${BETAAL_SVG}</span>`;
    this.body = el.querySelector('.betaal-body')!;
    window.addEventListener('resize', () => this.relayout());
    window.addEventListener('pointermove', (e) => this.look(e.clientX, e.clientY));
    this.relayout();
  }

  get at(): Place {
    return this.place;
  }

  setMood(mood: Mood): void {
    this.el.dataset.mood = mood;
  }

  relayout(): void {
    const t = this.target(this.place);
    if (t) this.el.style.transform = t;
  }

  /** Flies Betaal between the tree and Vikram's shoulder along a looping arc. */
  async moveTo(place: Place, animate = true): Promise<void> {
    const from = this.el.style.transform;
    this.place = place;
    this.el.dataset.place = place;
    const to = this.target(place);
    if (!to) return;
    if (!animate || reducedMotion || !from) {
      this.el.style.transform = to;
      return;
    }
    const a = this.el.getBoundingClientRect();
    const b = this.coords(place)!;
    const midX = (a.left + b.x) / 2;
    const midY = Math.min(a.top, b.y) - 90;
    this.el.classList.add('is-flying');
    const anim = this.el.animate(
      [
        { transform: from },
        { transform: `translate(${midX}px, ${midY}px) rotate(90deg) scale(1.15)`, offset: 0.5 },
        { transform: to },
      ],
      { duration: 1100, easing: 'cubic-bezier(.45,0,.25,1)' },
    );
    this.el.style.transform = to;
    await anim.finished.catch(() => undefined);
    this.el.classList.remove('is-flying');
  }

  private coords(place: Place): { x: number; y: number; rot: number } | null {
    const w = this.el.offsetWidth;
    const h = this.el.offsetHeight;
    if (place === 'tree') {
      const r = this.treeAnchor();
      if (!r) return null;
      // Turned over, the tip of his shroud (the bottom of the box) hangs from the branch.
      return { x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - 6, rot: 180 };
    }
    const r = this.shoulderAnchor();
    if (!r || !r.width) return null;
    return { x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2, rot: 0 };
  }

  private target(place: Place): string | null {
    const c = this.coords(place);
    return c ? `translate(${c.x}px, ${c.y}px) rotate(${c.rot}deg)` : null;
  }

  // His eyes follow the pointer, which makes him feel watchful and alive.
  private look(px: number, py: number): void {
    const r = this.el.getBoundingClientRect();
    const dx = px - (r.left + r.width / 2);
    const dy = py - (r.top + r.height * 0.3);
    const len = Math.hypot(dx, dy) || 1;
    const flip = this.place === 'tree' ? -1 : 1;
    this.body.style.setProperty('--px', `${((dx / len) * 2.8 * flip).toFixed(2)}px`);
    this.body.style.setProperty('--py', `${((dy / len) * 2.8 * flip).toFixed(2)}px`);
  }
}
