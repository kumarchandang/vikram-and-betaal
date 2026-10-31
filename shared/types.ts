import type { CastMember, Scene, Storyboard } from './puppets';

export type Lang = 'en' | 'odia' | 'odia-roman';
export const LANGS: readonly Lang[] = ['en', 'odia', 'odia-roman'];

export type Verdict = 'wise' | 'partial' | 'foolish' | 'silent';

/** One finished tale, as remembered by Betaal for the rest of the night. */
export interface LedgerEntry {
  title: string;
  answer: string | null;
  verdict: Verdict;
  points: number;
}

export interface Tale {
  opening: string;
  title: string;
  story: string;
  question: string;
  /** Betaal's own answer. Kept hidden from the player until they answer. */
  wisdom: string;
}

/** Indexes into the server's ingredient pools, so a night never repeats them. */
export interface Seed {
  setting: number;
  dilemma: number;
  twist: number;
  mood: number;
  device: number;
}

export interface AskTurn {
  q: string;
  a: string;
}

/** Every request carries the language and the name Betaal should call the player by. */
interface Personal {
  lang: Lang;
  /** Empty means the player is simply King Vikram. */
  name: string;
}

export interface StoryRequest extends Personal {
  round: number;
  total: number;
  ledger: LedgerEntry[];
  usedSeeds: Seed[];
}

export type StoryEvent =
  | { type: 'meta'; seed: Seed }
  | { type: 'opening' | 'story' | 'question'; delta: string }
  | { type: 'title'; text: string }
  // The puppet show is written alongside the tale: the cast first, then each scene just before its paragraph.
  | { type: 'cast'; cast: CastMember[] }
  | { type: 'scene'; index: number; scene: Scene }
  | { type: 'done'; tale: Tale; board: Storyboard | null }
  // `retry`: the tale was cut short (Google's filter sometimes blocks a harmless tale); a new tale usually works.
  | { type: 'error'; message: string; retry?: boolean };

export interface JudgeRequest extends Personal {
  tale: Tale;
  answer: string | null;
  asks: AskTurn[];
  ledger: LedgerEntry[];
}

export interface JudgeResponse {
  verdict: Verdict;
  points: number;
  reply: string;
  wisdom: string;
}

export interface AskRequest extends Personal {
  tale: Tale;
  question: string;
  asks: AskTurn[];
}

export interface AskResponse {
  reply: string;
}

export interface ScenesRequest extends Personal {
  title: string;
  story: string;
}

export interface FinaleRequest extends Personal {
  ledger: LedgerEntry[];
  outcome: 'won' | 'burst';
}

export interface FinaleResponse {
  title: string;
  trait: string;
  farewell: string;
}
