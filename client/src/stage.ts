import type { Action, CastMember, Effect, Scene, Slot, Storyboard } from '../../shared/puppets';
import type { Verdict } from '../../shared/types';
import { backgroundSvg, propSvg, puppet } from './puppets';
import { reducedMotion } from './scene';

const SLOT_X: Record<Slot, number> = { left: 16, 'left-center': 33, center: 50, 'right-center': 67, right: 84 };
const ENTER_WALKING: Action[] = ['walk', 'run'];
const FX_MARK: Partial<Record<Action, string>> = { angry: '!', fear: '!', think: '?', sleep: 'z z z', faint: '✦ ✦', celebrate: '✦', pray: '✦' };

interface Actor {
  el: HTMLElement;
  flip: HTMLElement;
  bubble: HTMLElement;
  mark: HTMLElement;
  member: CastMember;
}

/**
 * A pattachitra-style puppet theatre. Gemma's storyboard says who is on stage, where, and doing what;
 * this class draws them and animates the changes from one scene to the next.
 */
export class StoryStage {
  private canvas: HTMLElement;
  private bgHost: HTMLElement;
  private fxHost: HTMLElement;
  private actorsHost: HTMLElement;
  private titleCardEl: HTMLElement;
  private caption: HTMLElement;
  private dots: HTMLElement;
  private cast: CastMember[] = [];
  private scenes: (Scene | undefined)[] = [];
  private actors = new Map<string, Actor>();
  private currentBg = '';
  private index = -1;
  private timers: number[] = [];
  private autoTimer = 0;
  onPick: (index: number) => void = () => {};

  constructor(private root: HTMLElement) {
    root.innerHTML = `
      <div class="pc-frame">
        <div class="pc-canvas" data-time="day">
          <div class="pc-bg"></div>
          <div class="pc-tint"></div>
          <div class="pc-actors"></div>
          <div class="pc-fx"></div>
          <div class="pc-title"></div>
          <p class="pc-caption"></p>
        </div>
      </div>
      <div class="pc-dots" role="group" aria-label="Scenes"></div>`;
    this.canvas = root.querySelector('.pc-canvas')!;
    this.bgHost = root.querySelector('.pc-bg')!;
    this.fxHost = root.querySelector('.pc-fx')!;
    this.actorsHost = root.querySelector('.pc-actors')!;
    this.titleCardEl = root.querySelector('.pc-title')!;
    this.caption = root.querySelector('.pc-caption')!;
    this.dots = root.querySelector('.pc-dots')!;
  }

  get loaded(): boolean {
    return this.scenes.some(Boolean);
  }

  get current(): number {
    return this.index;
  }

  /** Whether paragraph i (or an earlier one) has a scene to show yet. */
  has(i: number): boolean {
    return this.sceneFor(i) !== undefined;
  }

  reset(): void {
    this.stopAutoplay();
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.cast = [];
    this.scenes = [];
    this.index = -1;
    this.currentBg = '';
    this.actors.clear();
    this.actorsHost.innerHTML = '';
    this.bgHost.innerHTML = '';
    this.fxHost.innerHTML = '';
    this.fxHost.dataset.effect = 'none';
    this.caption.textContent = '';
    this.dots.innerHTML = '';
    this.titleCardEl.hidden = true;
  }

  /** Shown from the moment the title arrives until Gemma's storyboard is ready. */
  titleCard(title: string, note: string): void {
    this.titleCardEl.hidden = false;
    this.titleCardEl.innerHTML = '';
    const h = document.createElement('p');
    h.className = 'pc-title-text';
    h.textContent = title;
    const n = document.createElement('p');
    n.className = 'pc-title-note';
    n.textContent = note;
    this.titleCardEl.append(h, n);
    this.setBackground('cremation-ground');
    this.canvas.dataset.time = 'night';
  }

  /**
   * The opening, shown the moment a tale begins: the king walking through the cremation ground
   * with Betaal cackling beside him, while the tale is still being written.
   */
  frame(king: string, laugh: string, caption = ''): void {
    this.index = -1;
    const cast: CastMember[] = [
      { id: '__king', name: king, kind: 'king', color: 'red' },
      { id: '__betaal', name: 'Betaal', kind: 'ghost', color: 'white' },
    ];
    this.show(
      {
        background: 'cremation-ground',
        time: 'night',
        effect: 'fog',
        caption,
        actors: [
          { id: '__king', slot: 'left-center', action: 'walk', facing: 'right', prop: 'sword', says: '' },
          { id: '__betaal', slot: 'right-center', action: 'talk', facing: 'left', prop: 'none', says: laugh },
        ],
      },
      cast,
    );
  }

  setCast(cast: CastMember[]): void {
    this.cast = cast;
  }

  /** Scenes arrive one at a time, each just before its paragraph is written. */
  setScene(i: number, scene: Scene): void {
    this.scenes[i] = scene;
    this.renderDots();
  }

  load(board: Storyboard): void {
    this.cast = board.cast;
    this.scenes = [...board.scenes];
    this.renderDots();
  }

  play(i: number): void {
    const scene = this.sceneFor(i);
    if (!scene) return;
    this.index = i;
    this.show(scene, this.cast);
    [...this.dots.children].forEach((d, k) => d.classList.toggle('is-current', k === i));
  }

  private sceneFor(i: number): Scene | undefined {
    for (let k = Math.min(i, this.scenes.length - 1); k >= 0; k--) if (this.scenes[k]) return this.scenes[k];
    return undefined;
  }

  private show(scene: Scene, cast: CastMember[]): void {
    this.titleCardEl.hidden = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.setBackground(scene.background);
    this.canvas.dataset.time = scene.background === 'cremation-ground' ? 'night' : scene.time;
    this.setEffect(scene.effect);
    this.setActors(scene, cast);
    this.caption.textContent = scene.caption;
    this.caption.classList.remove('is-new');
    void this.caption.offsetWidth;
    this.caption.classList.add('is-new');
    [...this.dots.children].forEach((d) => d.classList.remove('is-current'));
  }

  private renderDots(): void {
    this.dots.innerHTML = '';
    for (let i = 0; i < this.scenes.length; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pc-dot';
      b.classList.toggle('is-current', i === this.index);
      b.setAttribute('aria-label', `Show scene ${i + 1}`);
      b.addEventListener('click', () => {
        this.stopAutoplay();
        this.onPick(i);
      });
      this.dots.append(b);
    }
  }

  /** The riddle: everyone on stage stops and wonders. */
  riddle(): void {
    for (const a of this.actors.values()) this.act(a, 'think');
    this.hideBubbles();
    this.setEffect('none');
    const q = document.createElement('span');
    q.className = 'pc-riddle';
    q.textContent = '?';
    this.fxHost.append(q);
  }

  /** The cast reacts to the king's answer. */
  react(verdict: Verdict): void {
    const action: Action = verdict === 'wise' ? 'celebrate' : verdict === 'partial' ? 'think' : verdict === 'foolish' ? 'laugh' : 'angry';
    this.fxHost.querySelector('.pc-riddle')?.remove();
    for (const a of this.actors.values()) this.act(a, action);
    if (verdict === 'wise') this.setEffect('magic');
  }

  /** Without a voice to follow, scenes advance by reading time, starting at scene `from`. */
  autoplay(from: number, durations: number[], done: () => void): void {
    this.stopAutoplay();
    const step = (k: number) => {
      if (k >= durations.length) return done();
      this.onPick(from + k);
      this.autoTimer = window.setTimeout(() => step(k + 1), durations[k]);
    };
    step(0);
  }

  stopAutoplay(): void {
    clearTimeout(this.autoTimer);
  }

  private setBackground(bg: Scene['background']): void {
    if (bg === this.currentBg) return;
    this.currentBg = bg;
    const layer = document.createElement('div');
    layer.className = 'pc-bg-layer';
    layer.innerHTML = backgroundSvg(bg);
    this.bgHost.append(layer);
    const old = [...this.bgHost.children].slice(0, -1);
    requestAnimationFrame(() => layer.classList.add('is-in'));
    window.setTimeout(() => old.forEach((o) => o.remove()), 900);
  }

  private setEffect(effect: Effect): void {
    this.fxHost.innerHTML = '';
    this.fxHost.dataset.effect = effect;
    if (effect === 'magic' || effect === 'glow') {
      for (let k = 0; k < (effect === 'magic' ? 14 : 0); k++) {
        const s = document.createElement('span');
        s.className = 'pc-spark';
        s.textContent = '✦';
        s.style.left = `${8 + Math.random() * 84}%`;
        s.style.top = `${8 + Math.random() * 60}%`;
        s.style.animationDelay = `${(-Math.random() * 2).toFixed(2)}s`;
        this.fxHost.append(s);
      }
    }
  }

  private setActors(scene: Scene, cast: CastMember[]): void {
    const present = new Set(scene.actors.map((a) => a.id));
    for (const [id, a] of this.actors) {
      if (present.has(id)) continue;
      a.el.classList.add('is-leaving');
      this.actors.delete(id);
      window.setTimeout(() => a.el.remove(), 500);
    }

    scene.actors.forEach((sa, order) => {
      const member = cast.find((c) => c.id === sa.id);
      if (!member) return;
      let a = this.actors.get(sa.id);
      // Gemma may reuse an id like "c1" for a different character in the next tale.
      if (a && (a.member.kind !== member.kind || a.member.color !== member.color)) {
        a.el.remove();
        this.actors.delete(sa.id);
        a = undefined;
      }
      const isNew = !a;
      if (!a) {
        a = this.createActor(member);
        this.actors.set(sa.id, a);
      }
      const x = SLOT_X[sa.slot];
      a.el.dataset.facing = sa.facing;
      a.el.dataset.side = x < 40 ? 'left' : x > 60 ? 'right' : 'center';
      const propHost = a.el.querySelector('.p-prop');
      if (propHost) propHost.innerHTML = propSvg(sa.prop);

      if (isNew && ENTER_WALKING.includes(sa.action) && !reducedMotion) {
        // Walkers come in from the side they are walking from.
        a.el.style.transition = 'none';
        a.el.style.left = sa.facing === 'right' ? '-14%' : '114%';
        void a.el.offsetWidth;
        a.el.style.transition = '';
        this.act(a, sa.action);
        requestAnimationFrame(() => (a!.el.style.left = `${x}%`));
        this.timers.push(window.setTimeout(() => this.act(a!, sa.says ? 'talk' : 'idle'), 1700));
      } else {
        a.el.style.left = `${x}%`;
        if (isNew) a.el.classList.add('is-entering');
        this.act(a, sa.action);
      }

      a.bubble.hidden = true;
      if (sa.says) {
        a.bubble.textContent = sa.says;
        this.timers.push(window.setTimeout(() => (a!.bubble.hidden = false), 700 + order * 1100));
        this.timers.push(window.setTimeout(() => (a!.bubble.hidden = true), 700 + order * 1100 + 5200));
      }
    });
  }

  private createActor(member: CastMember): Actor {
    const p = puppet(member.kind, member.color);
    const el = document.createElement('div');
    el.className = 'pc-actor';
    el.dataset.kind = member.kind;
    if (p.flying) el.dataset.flying = '';
    el.style.height = `${p.height}%`;
    el.style.aspectRatio = `${p.w} / ${p.h}`;
    el.title = member.name;
    el.innerHTML = `<div class="pc-flip">${p.svg}</div><span class="pc-mark"></span><p class="pc-bubble" hidden></p>`;
    this.actorsHost.append(el);
    return {
      el,
      flip: el.querySelector('.pc-flip')!,
      bubble: el.querySelector('.pc-bubble')!,
      mark: el.querySelector('.pc-mark')!,
      member,
    };
  }

  private act(a: Actor, action: Action): void {
    a.el.dataset.action = action;
    a.mark.textContent = FX_MARK[action] ?? '';
  }

  private hideBubbles(): void {
    for (const a of this.actors.values()) a.bubble.hidden = true;
  }
}
