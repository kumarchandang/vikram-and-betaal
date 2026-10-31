/* The puppet show's vocabulary. Gemma picks only from these, the stage knows how to draw every one. */

export const KINDS = [
  'king', 'queen', 'prince', 'princess', 'man', 'woman', 'boy', 'girl', 'old-man', 'old-woman',
  'sage', 'merchant', 'soldier', 'thief', 'priest', 'god', 'ghost',
  'tiger', 'elephant', 'jackal', 'dog', 'cow', 'horse', 'monkey', 'deer', 'parrot', 'crow', 'snake',
] as const;

export const COLORS = ['red', 'yellow', 'green', 'blue', 'orange', 'white', 'purple', 'pink', 'black', 'brown'] as const;

export const BACKGROUNDS = [
  'palace', 'village', 'forest', 'river', 'sea', 'temple', 'market', 'desert', 'mountain', 'cremation-ground',
] as const;

export const TIMES = ['day', 'dusk', 'night'] as const;

export const EFFECTS = ['none', 'magic', 'rain', 'fire', 'lightning', 'fog', 'glow'] as const;

export const SLOTS = ['left', 'left-center', 'center', 'right-center', 'right'] as const;

export const ACTIONS = [
  'idle', 'walk', 'run', 'talk', 'bow', 'pray', 'cry', 'laugh', 'angry', 'fear',
  'fight', 'give', 'point', 'dance', 'sleep', 'faint', 'think', 'celebrate',
] as const;

export const PROPS = [
  'none', 'coin', 'treasure', 'sword', 'flute', 'lamp', 'book', 'pot', 'flower', 'fruit',
  'basket', 'staff', 'crown', 'ring', 'net', 'shuttle',
] as const;

export type Kind = (typeof KINDS)[number];
export type PuppetColor = (typeof COLORS)[number];
export type Background = (typeof BACKGROUNDS)[number];
export type Time = (typeof TIMES)[number];
export type Effect = (typeof EFFECTS)[number];
export type Slot = (typeof SLOTS)[number];
export type Action = (typeof ACTIONS)[number];
export type Prop = (typeof PROPS)[number];

export interface CastMember {
  id: string;
  name: string;
  kind: Kind;
  color: PuppetColor;
}

export interface SceneActor {
  id: string;
  slot: Slot;
  action: Action;
  facing: 'left' | 'right';
  prop: Prop;
  says: string;
}

export interface Scene {
  background: Background;
  time: Time;
  effect: Effect;
  caption: string;
  actors: SceneActor[];
}

export interface Storyboard {
  cast: CastMember[];
  scenes: Scene[];
}

/** The story is split into paragraphs the same way everywhere: by blank lines. */
export function paragraphsOf(story: string): string[] {
  return story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
