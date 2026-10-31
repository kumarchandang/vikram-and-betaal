import {
  LANGS,
  type AskRequest,
  type AskTurn,
  type FinaleRequest,
  type JudgeRequest,
  type Lang,
  type LedgerEntry,
  type ScenesRequest,
  type Seed,
  type StoryRequest,
  type Tale,
  type Verdict,
} from '../shared/types';

export class BadRequest extends Error {}

type Obj = Record<string, unknown>;

function obj(v: unknown, field: string): Obj {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new BadRequest(`"${field}" must be an object`);
  return v as Obj;
}

function str(v: unknown, field: string, max: number): string {
  if (typeof v !== 'string' || !v.trim()) throw new BadRequest(`"${field}" must be a non-empty string`);
  return v.trim().slice(0, max);
}

function int(v: unknown, field: string, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new BadRequest(`"${field}" must be a whole number from ${min} to ${max}`);
  return n;
}

function lang(v: unknown): Lang {
  if (!LANGS.includes(v as Lang)) throw new BadRequest(`"lang" must be one of ${LANGS.join(', ')}`);
  return v as Lang;
}

/** The player's chosen name: letters in any script, spaces, dots, hyphens and apostrophes only. */
function name(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[^\p{L}\p{M}\s.'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 32);
}

function list<T>(v: unknown, field: string, max: number, each: (item: unknown) => T): T[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new BadRequest(`"${field}" must be a list`);
  return v.slice(-max).map(each);
}

const VERDICTS: Verdict[] = ['wise', 'partial', 'foolish', 'silent'];

function ledger(v: unknown): LedgerEntry[] {
  return list(v, 'ledger', 25, (item) => {
    const o = obj(item, 'ledger entry');
    const verdict = VERDICTS.includes(o.verdict as Verdict) ? (o.verdict as Verdict) : 'partial';
    return {
      title: str(o.title, 'ledger title', 120),
      answer: o.answer === null ? null : str(o.answer, 'ledger answer', 600),
      verdict,
      points: int(o.points, 'ledger points', 0, 10),
    };
  });
}

function asks(v: unknown): AskTurn[] {
  return list(v, 'asks', 3, (item) => {
    const o = obj(item, 'ask');
    return { q: str(o.q, 'ask question', 240), a: str(o.a, 'ask reply', 800) };
  });
}

function tale(v: unknown): Tale {
  const o = obj(v, 'tale');
  return {
    opening: typeof o.opening === 'string' ? o.opening.slice(0, 600) : '',
    title: str(o.title, 'tale title', 120),
    story: str(o.story, 'tale story', 4000),
    question: str(o.question, 'tale question', 800),
    wisdom: str(o.wisdom, 'tale wisdom', 800),
  };
}

function seed(v: unknown): Seed {
  const o = obj(v, 'seed');
  return {
    setting: int(o.setting, 'seed.setting', 0, 99),
    dilemma: int(o.dilemma, 'seed.dilemma', 0, 99),
    twist: int(o.twist, 'seed.twist', 0, 99),
    mood: int(o.mood, 'seed.mood', 0, 99),
    device: int(o.device, 'seed.device', 0, 99),
  };
}

export function parseStoryRequest(body: unknown): StoryRequest {
  const o = obj(body, 'body');
  return {
    lang: lang(o.lang),
    name: name(o.name),
    round: int(o.round, 'round', 1, 25),
    total: int(o.total, 'total', 1, 25),
    ledger: ledger(o.ledger),
    usedSeeds: list(o.usedSeeds, 'usedSeeds', 25, seed),
  };
}

export function parseJudgeRequest(body: unknown): JudgeRequest {
  const o = obj(body, 'body');
  return {
    lang: lang(o.lang),
    name: name(o.name),
    tale: tale(o.tale),
    answer: o.answer === null ? null : str(o.answer, 'answer', 600),
    asks: asks(o.asks),
    ledger: ledger(o.ledger),
  };
}

export function parseAskRequest(body: unknown): AskRequest {
  const o = obj(body, 'body');
  return {
    lang: lang(o.lang),
    name: name(o.name),
    tale: tale(o.tale),
    question: str(o.question, 'question', 240),
    asks: asks(o.asks),
  };
}

export function parseFinaleRequest(body: unknown): FinaleRequest {
  const o = obj(body, 'body');
  if (o.outcome !== 'won' && o.outcome !== 'burst') throw new BadRequest('"outcome" must be "won" or "burst"');
  return { lang: lang(o.lang), name: name(o.name), ledger: ledger(o.ledger), outcome: o.outcome };
}

export function parseScenesRequest(body: unknown): ScenesRequest {
  const o = obj(body, 'body');
  return { lang: lang(o.lang), name: name(o.name), title: str(o.title, 'title', 120), story: str(o.story, 'story', 4000) };
}

export function parseVoiceRequest(body: unknown): { lang: Lang; text: string } {
  const o = obj(body, 'body');
  return { lang: lang(o.lang), text: str(o.text, 'text', 1500) };
}
