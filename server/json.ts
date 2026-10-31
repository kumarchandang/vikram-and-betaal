import {
  ACTIONS,
  BACKGROUNDS,
  COLORS,
  EFFECTS,
  KINDS,
  PROPS,
  SLOTS,
  TIMES,
  type CastMember,
  type Scene,
  type SceneActor,
  type Slot,
  type Storyboard,
} from '../shared/puppets';
import type { FinaleResponse, JudgeResponse, Verdict } from '../shared/types';

/** Parses the first JSON value in a model reply, tolerating code fences and text around it. */
export function parseJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    const start = t.search(/[[{]/);
    const end = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(t.slice(start, end + 1));
      } catch {
        // fall through to the error below
      }
    }
  }
  throw new Error('Gemma did not reply with JSON');
}

/** Like parseJson, but an array reply counts as its first item (Gemma sometimes wraps objects in one). */
export function extractJson(text: string): unknown {
  const v = parseJson(text);
  return Array.isArray(v) ? v[0] : v;
}

function text(v: unknown, field: string): string {
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Gemma's reply is missing "${field}"`);
  return v.trim();
}

const VERDICTS: Verdict[] = ['wise', 'partial', 'foolish'];

export function toJudgeResponse(v: unknown, silent: boolean): JudgeResponse {
  const o = (v ?? {}) as Record<string, unknown>;
  const raw = String(o.verdict ?? '').toLowerCase().trim() as Verdict;
  const verdict: Verdict = silent ? 'silent' : VERDICTS.includes(raw) ? raw : 'partial';
  const points = silent ? 0 : Math.max(0, Math.min(10, Math.round(Number(o.points) || 0)));
  return { verdict, points, reply: text(o.reply, 'reply'), wisdom: text(o.wisdom, 'wisdom') };
}

function oneOf<T extends string>(allowed: readonly T[], v: unknown, fallback: T): T {
  const s = String(v ?? '').toLowerCase().trim().replace(/[\s_]+/g, '-');
  return allowed.includes(s as T) ? (s as T) : fallback;
}

function short(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

type Raw = Record<string, unknown>;

/** The cast, from a JSON array or an object with a "cast" array. Unknown kinds become a plain man. */
export function toCast(v: unknown): CastMember[] {
  const list = Array.isArray(v) ? v : Array.isArray((v as Raw)?.cast) ? ((v as Raw).cast as unknown[]) : [];
  const cast = list.slice(0, 5).map((c, i) => {
    const m = (c ?? {}) as Raw;
    return {
      id: short(m.id, 12) || `c${i + 1}`,
      name: short(m.name, 40),
      kind: oneOf(KINDS, m.kind, 'man'),
      color: oneOf(COLORS, m.color, COLORS[i % COLORS.length]),
    };
  });
  if (!cast.length) throw new Error("Gemma's cast is empty");
  return cast;
}

/**
 * One scene the stage can always draw: known values only, real cast ids, and no two actors in
 * the same slot. Accepts the short keys used in the story stream (bg, fx, cap, act, face) too.
 */
export function toScene(v: unknown, cast: CastMember[]): Scene {
  const s = (v ?? {}) as Raw;
  const ids = new Set(cast.map((c) => c.id));
  const taken = new Set<Slot>();
  const actors: SceneActor[] = [];
  for (const a of Array.isArray(s.actors) ? s.actors : []) {
    const m = (a ?? {}) as Raw;
    const id = short(m.id, 12);
    if (!ids.has(id) || actors.some((x) => x.id === id) || actors.length >= 4) continue;
    let slot = oneOf(SLOTS, m.slot, 'center');
    if (taken.has(slot)) slot = SLOTS.find((x) => !taken.has(x))!;
    taken.add(slot);
    const face = m.facing ?? m.face;
    const facing = face === 'left' || face === 'right' ? face : slot.startsWith('right') ? 'left' : 'right';
    actors.push({
      id,
      slot,
      facing,
      action: oneOf(ACTIONS, m.action ?? m.act, 'idle'),
      prop: oneOf(PROPS, m.prop, 'none'),
      says: short(m.says, 48),
    });
  }
  if (!actors.length) actors.push({ id: cast[0].id, slot: 'center', facing: 'right', action: 'idle', prop: 'none', says: '' });
  return {
    background: oneOf(BACKGROUNDS, s.background ?? s.bg, 'village'),
    time: oneOf(TIMES, s.time, 'day'),
    effect: oneOf(EFFECTS, s.effect ?? s.fx, 'none'),
    caption: short(s.caption ?? s.cap, 70),
    actors,
  };
}

/** Pads or trims scenes to exactly one per paragraph, reusing the nearest earlier scene for gaps. */
export function alignScenes(scenes: (Scene | undefined)[], paragraphCount: number): Scene[] {
  const first = scenes.find(Boolean);
  if (!first) return [];
  const out: Scene[] = [];
  let last = first;
  for (let i = 0; i < paragraphCount; i++) {
    last = scenes[i] ?? last;
    out.push(last);
  }
  return out;
}

/** A whole storyboard from the separate /api/scenes call. */
export function toStoryboard(v: unknown, paragraphCount: number): Storyboard {
  const o = (v ?? {}) as Raw;
  const cast = toCast(o.cast);
  const rawScenes = Array.isArray(o.scenes) ? o.scenes : [];
  if (!rawScenes.length) throw new Error("Gemma's storyboard has no scenes");
  return { cast, scenes: alignScenes(rawScenes.map((s) => toScene(s, cast)), paragraphCount) };
}

export function toFinaleResponse(v: unknown): FinaleResponse {
  const o = (v ?? {}) as Record<string, unknown>;
  return { title: text(o.title, 'title'), trait: text(o.trait, 'trait'), farewell: text(o.farewell, 'farewell') };
}
