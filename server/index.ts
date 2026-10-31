import 'dotenv/config';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import type { AskResponse, StoryEvent } from '../shared/types';
import { describeError, generateJson, generateText, MODEL, streamText, ThinkingLevel } from './gemma';
import { paragraphsOf } from '../shared/puppets';
import { toFinaleResponse, toJudgeResponse, toStoryboard } from './json';
import { askPrompt, finalePrompt, judgePrompt, pickSeed, scenesPrompt, storyPrompt, systemPrompt } from './prompts';
import { TaleEmitter } from './sections';
import {
  BadRequest,
  parseAskRequest,
  parseFinaleRequest,
  parseJudgeRequest,
  parseScenesRequest,
  parseStoryRequest,
  parseVoiceRequest,
} from './validate';
import { speak, SpeechQuotaError } from './voice';

const app = express();
app.use(express.json({ limit: '64kb' }));

function fail(res: Response, e: unknown): void {
  if (e instanceof BadRequest) {
    res.status(400).json({ error: e.message });
    return;
  }
  const { status, message } = describeError(e);
  console.error('[gemma]', e);
  res.status(status).json({ error: message });
}

// The tale streams as server-sent events so Betaal starts speaking within a second or two.
app.post('/api/story', async (req: Request, res: Response) => {
  let body;
  try {
    body = parseStoryRequest(req.body);
  } catch (e) {
    return fail(res, e);
  }

  const abort = new AbortController();
  res.on('close', () => abort.abort());
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = (e: StoryEvent) => res.write(`data: ${JSON.stringify(e)}\n\n`);

  const seed = pickSeed(body.usedSeeds, body.lang);
  send({ type: 'meta', seed });
  try {
    const emitter = new TaleEmitter(send);
    const stream = streamText(storyPrompt(body, seed), {
      system: systemPrompt(body.lang, body.name),
      temperature: 1,
      thinking: ThinkingLevel.MINIMAL,
      signal: abort.signal,
    });
    for await (const delta of stream) emitter.push(delta);
    const { tale, board } = emitter.finish();
    if (!tale.story || !tale.question) {
      console.warn(`[gemma] incomplete tale (${emitter.raw.length} chars), ending with:\n${emitter.raw.slice(-300)}`);
      send({ type: 'error', message: 'The tale was cut short. Ask Betaal for another.', retry: true });
    } else {
      send({ type: 'done', tale, board });
    }
  } catch (e) {
    if (!abort.signal.aborted) {
      console.error('[gemma]', e);
      send({ type: 'error', message: describeError(e).message });
    }
  }
  res.end();
});

app.post('/api/judge', async (req, res) => {
  try {
    const body = parseJudgeRequest(req.body);
    const silent = body.answer === null;
    const verdict = await generateJson(
      judgePrompt(body),
      { system: systemPrompt(body.lang, body.name), temperature: 0.7 },
      (v) => toJudgeResponse(v, silent),
    );
    res.json(verdict);
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/ask', async (req, res) => {
  try {
    const body = parseAskRequest(req.body);
    const reply = await generateText(askPrompt(body), { system: systemPrompt(body.lang, body.name), temperature: 0.9 });
    if (!reply) throw new Error('Betaal said nothing');
    res.json({ reply } satisfies AskResponse);
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/finale', async (req, res) => {
  try {
    const body = parseFinaleRequest(req.body);
    const finale = await generateJson(
      finalePrompt(body),
      { system: systemPrompt(body.lang, body.name), temperature: 1 },
      toFinaleResponse,
    );
    res.json(finale);
  } catch (e) {
    fail(res, e);
  }
});

// Gemma reads the finished tale and directs the puppet show: cast, and one scene per paragraph.
app.post('/api/scenes', async (req, res) => {
  try {
    const body = parseScenesRequest(req.body);
    const count = paragraphsOf(body.story).length;
    const board = await generateJson(
      scenesPrompt(body),
      { system: 'You are a precise storyboard director for a children\'s 2D cartoon. Reply with JSON only.', temperature: 0.6 },
      (v) => toStoryboard(v, count),
    );
    res.json(board);
  } catch (e) {
    fail(res, e);
  }
});

// Betaal's spoken voice, one paragraph at a time.
app.post('/api/voice', async (req, res) => {
  try {
    const body = parseVoiceRequest(req.body);
    const speech = await speak(body.lang, body.text);
    res.type(speech.mime).set('Cache-Control', 'private, max-age=3600').send(speech.data);
  } catch (e) {
    if (e instanceof SpeechQuotaError) {
      res.status(429).set('Retry-After', String(e.retryAfter)).json({ error: e.message });
      return;
    }
    fail(res, e);
  }
});

// After `npm run build`, the same server also serves the game itself.
const dist = fileURLToPath(new URL('../dist', import.meta.url));
if (existsSync(dist)) app.use(express.static(dist));

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Betaal is listening on http://localhost:${port} (model: ${MODEL})`);
});
