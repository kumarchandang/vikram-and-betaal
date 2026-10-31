import { createHash } from 'node:crypto';
import type { Lang } from '../shared/types';
import { speechClients } from './gemma';
import { voicePrompt } from './prompts';

// Gemma writes the words; Gemini's speech models give Betaal a human voice, including in Odia.
// If the first model is busy or out of quota, the next one takes over.
const MODELS = (process.env.TTS_MODELS || 'gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts').split(',').map((m) => m.trim());
const VOICE = process.env.TTS_VOICE || 'Algenib';

export interface Speech {
  mime: string;
  data: Buffer;
}

const cache = new Map<string, Speech>();

/** All speech models are out of quota; `retryAfter` is how many seconds until the first one is back. */
export class SpeechQuotaError extends Error {
  readonly status = 429;
  constructor(readonly retryAfter: number) {
    super(`Speech quota used up; it resets in ${Math.ceil(retryAfter / 60)} minutes`);
  }
}

// The free tier allows only a handful of speech requests per day, so once Google says a model is
// out of quota we stop asking it until the time Google gives, instead of failing on every paragraph.
const blockedUntil = new Map<string, number>();

function retryDelaySeconds(e: unknown): number {
  const m = /"retryDelay"\s*:\s*"(\d+)/.exec(e instanceof Error ? e.message : String(e));
  return m ? Number(m[1]) : 60;
}

export async function speak(lang: Lang, text: string): Promise<Speech> {
  const key = createHash('sha1').update(`${lang}\n${text}`).digest('hex');
  const hit = cache.get(key);
  if (hit) return hit;

  let lastError: unknown;
  const routes = speechClients.flatMap((client, k) => MODELS.map((model) => ({ client, model, id: `${k}:${model}` })));
  for (const { client, model, id } of routes) {
    if ((blockedUntil.get(id) ?? 0) > Date.now()) continue;
    try {
      const r = await client.models.generateContent({
        model,
        contents: voicePrompt(lang, text),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      });
      const part = r.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!part?.inlineData?.data) throw new Error(`${model} returned no audio`);
      const speech = toPlayable(part.inlineData.mimeType ?? 'audio/wav', Buffer.from(part.inlineData.data, 'base64'));
      cache.set(key, speech);
      if (cache.size > 80) cache.delete(cache.keys().next().value!);
      return speech;
    } catch (e) {
      lastError = e;
      if ((e as { status?: number }).status === 429) blockedUntil.set(id, Date.now() + retryDelaySeconds(e) * 1000);
    }
  }
  const waits = routes.map((r) => (blockedUntil.get(r.id) ?? 0) - Date.now());
  if (waits.every((w) => w > 0)) throw new SpeechQuotaError(Math.ceil(Math.min(...waits) / 1000));
  throw lastError;
}

/** Some speech models return raw 16-bit PCM; browsers need a WAV header to play it. */
function toPlayable(mime: string, data: Buffer): Speech {
  if (!/audio\/(l16|pcm)/i.test(mime)) return { mime, data };
  const rate = Number(/rate=(\d+)/.exec(mime)?.[1] ?? 24000);
  const channels = Number(/channels=(\d+)/.exec(mime)?.[1] ?? 1);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * channels * 2, 28);
  header.writeUInt16LE(channels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return { mime: 'audio/wav', data: Buffer.concat([header, data]) };
}
