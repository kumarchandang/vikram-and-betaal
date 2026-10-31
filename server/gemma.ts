import { GoogleGenAI, ThinkingLevel, type GenerateContentConfig, type GenerateContentResponse } from '@google/genai';
import { extractJson } from './json';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is missing. Add it to .env (see .env.example).');

export const MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
export const ai = new GoogleGenAI({ apiKey });

// Extra keys from other accounts (GEMINI_API_KEY_2, _3, ...) add their own free speech quota.
export const speechClients = [apiKey, ...Object.keys(process.env).filter((k) => /^GEMINI_API_KEY_\d+$/.test(k)).sort().map((k) => process.env[k]!)]
  .filter(Boolean)
  .map((key) => new GoogleGenAI({ apiKey: key }));

export interface CallOptions {
  system: string;
  temperature?: number;
  // Gemma 4 only switches thinking on or off; LOW and MEDIUM are rejected by the API.
  thinking?: ThinkingLevel.MINIMAL | ThinkingLevel.HIGH;
  json?: boolean;
  signal?: AbortSignal;
}

function config(o: CallOptions): GenerateContentConfig {
  return {
    systemInstruction: o.system,
    temperature: o.temperature ?? 1,
    maxOutputTokens: 4096,
    thinkingConfig: { thinkingLevel: o.thinking ?? ThinkingLevel.MINIMAL },
    ...(o.json ? { responseMimeType: 'application/json' } : {}),
    ...(o.signal ? { abortSignal: o.signal } : {}),
  };
}

// Gemma 4 returns its reasoning as "thought" parts; only the rest is Betaal speaking.
function visibleText(r: GenerateContentResponse): string {
  const parts = r.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
}

// Google's API sometimes answers 500 or 503 for a moment under load; one quiet retry hides most of them.
const isTransient = (e: unknown) => [500, 503].includes((e as { status?: number })?.status ?? 0);
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function* streamText(prompt: string, o: CallOptions): AsyncGenerator<string> {
  for (let attempt = 0; ; attempt++) {
    let streamed = false;
    try {
      const stream = await ai.models.generateContentStream({ model: MODEL, contents: prompt, config: config(o) });
      let finish: string | undefined;
      for await (const chunk of stream) {
        finish = chunk.candidates?.[0]?.finishReason ?? finish;
        const t = visibleText(chunk);
        if (t) {
          streamed = true;
          yield t;
        }
      }
      if (finish && finish !== 'STOP') console.warn(`[gemma] stream ended with finishReason ${finish}`);
      return;
    } catch (e) {
      // Once text has reached the player, a retry would repeat it, so only retry a clean failure.
      if (streamed || attempt > 0 || !isTransient(e) || o.signal?.aborted) throw e;
      await pause(1500);
    }
  }
}

export async function generateText(prompt: string, o: CallOptions): Promise<string> {
  try {
    const r = await ai.models.generateContent({ model: MODEL, contents: prompt, config: config(o) });
    return visibleText(r).trim();
  } catch (e) {
    if (!isTransient(e)) throw e;
    await pause(1500);
    const r = await ai.models.generateContent({ model: MODEL, contents: prompt, config: config(o) });
    return visibleText(r).trim();
  }
}

/** Asks for JSON and validates it, retrying once if Gemma's reply doesn't parse. */
export async function generateJson<T>(prompt: string, o: CallOptions, parse: (v: unknown) => T): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return parse(extractJson(await generateText(prompt, { ...o, json: true })));
    } catch (e) {
      if (typeof (e as { status?: unknown }).status === 'number') throw e; // API errors are not worth a retry
      lastError = e;
    }
  }
  throw lastError;
}

export function describeError(e: unknown): { status: number; message: string } {
  const status = (e as { status?: number })?.status;
  if (status === 429) return { status: 429, message: "Gemma's rate limit was reached. Wait a minute, then try again." };
  if (status === 401 || status === 403) {
    return { status: 502, message: 'The Gemini API rejected the key. Check GEMINI_API_KEY in .env.' };
  }
  if (isTransient(e)) return { status: 503, message: 'Google is busy right now and Gemma did not answer. Try again in a moment.' };
  const detail = e instanceof Error ? e.message.replace(/\s+/g, ' ').slice(0, 120) : 'unknown error';
  return { status: 502, message: `Gemma could not answer (${detail}). Try again.` };
}

export { ThinkingLevel };
