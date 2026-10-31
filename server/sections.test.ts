import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitSections, TaleEmitter } from './sections';
import { extractJson, toJudgeResponse, toStoryboard } from './json';
import type { StoryEvent } from '../shared/types';

const REPLY = `[OPENING]
Arre Vikram, back again?
[TITLE]
<The Weaver's Three Sons>
[STORY]
Once in Kashi lived a weaver.

He had three sons.
[QUESTION]
Who deserves the loom?
[WISDOM]
The youngest, because he gave it away.`;

test('splits a complete reply into sections', () => {
  const s = splitSections(REPLY, true);
  assert.equal(s.opening, 'Arre Vikram, back again?');
  assert.equal(s.title, "The Weaver's Three Sons");
  assert.equal(s.story, 'Once in Kashi lived a weaver.\n\nHe had three sons.');
  assert.equal(s.question, 'Who deserves the loom?');
  assert.equal(s.wisdom, 'The youngest, because he gave it away.');
});

test('accepts bold markers and maps [ANSWER] to wisdom', () => {
  const s = splitSections('**[STORY]**\nA tale.\n**[QUESTION]**\nWhy?\n[ANSWER]\nBecause.', true);
  assert.equal(s.story, 'A tale.');
  assert.equal(s.question, 'Why?');
  assert.equal(s.wisdom, 'Because.');
});

test('falls back to the whole text when Gemma forgets the markers', () => {
  assert.equal(splitSections('Just a story.', true).story, 'Just a story.');
});

test('streaming one character at a time never leaks a marker and rebuilds the tale', () => {
  const events: StoryEvent[] = [];
  const emitter = new TaleEmitter((e) => events.push(e));
  for (const ch of REPLY) emitter.push(ch);
  const { tale } = emitter.finish();

  const joined = (type: string) =>
    events.filter((e): e is Extract<StoryEvent, { delta: string }> => e.type === type).map((e) => e.delta).join('');

  assert.equal(joined('opening'), tale.opening);
  assert.equal(joined('story'), tale.story);
  assert.equal(joined('question'), tale.question);
  for (const e of events) {
    if ('delta' in e) assert.doesNotMatch(e.delta, /\[[A-Z]+\]?/);
  }
  assert.deepEqual(events.filter((e) => e.type === 'title'), [{ type: 'title', text: "The Weaver's Three Sons" }]);
  assert.equal(events.some((e) => 'delta' in e && e.delta.includes('youngest')), false, 'wisdom stays hidden');
});

test('single line breaks in the story become paragraph breaks, and streaming stays consistent', () => {
  const reply = '[STORY]\nFirst para.\nSecond para.\n \nThird para.\n[QUESTION]\nWhy?';
  assert.equal(splitSections(reply, true).story, 'First para.\n\nSecond para.\n\nThird para.');
  const events: StoryEvent[] = [];
  const emitter = new TaleEmitter((e) => events.push(e));
  for (const ch of reply) emitter.push(ch);
  const { tale } = emitter.finish();
  const story = events.filter((e): e is Extract<StoryEvent, { delta: string }> => e.type === 'story').map((e) => e.delta).join('');
  assert.equal(story, tale.story);
});

test('toStoryboard keeps only known values, real cast ids and one scene per paragraph', () => {
  const board = toStoryboard(
    {
      cast: [
        { id: 'c1', name: 'Ramu', kind: 'Old Man', color: 'RED' },
        { id: 'c2', name: 'Tiger', kind: 'tiger', color: 'sparkly' },
      ],
      scenes: [
        {
          background: 'jungle',
          time: 'night',
          effect: 'magic',
          caption: 'Ramu meets the tiger',
          actors: [
            { id: 'c1', slot: 'left', action: 'bow', prop: 'staff', says: 'Namaskar' },
            { id: 'c2', slot: 'left', action: 'roar' },
            { id: 'ghost-who-is-not-cast', slot: 'center', action: 'walk' },
          ],
        },
      ],
    },
    3,
  );
  assert.deepEqual(board.cast[0], { id: 'c1', name: 'Ramu', kind: 'old-man', color: 'red' });
  assert.equal(board.cast[1].color, 'yellow', 'unknown colour falls back to a palette colour');
  assert.equal(board.scenes.length, 3, 'padded to one scene per paragraph');
  const [scene] = board.scenes;
  assert.equal(scene.background, 'village', 'unknown background falls back');
  assert.deepEqual(scene.actors.map((a) => a.id), ['c1', 'c2']);
  assert.notEqual(scene.actors[0].slot, scene.actors[1].slot, 'no two actors share a slot');
  assert.equal(scene.actors[1].action, 'idle', 'unknown action falls back');
  assert.equal(scene.actors[1].facing, 'right');
});

test('cast and @scene lines stream out before their paragraph and never leak into the tale', () => {
  const reply = `[OPENING]
Ha!
[TITLE]
The Weaver
[CAST]
[{"id":"c1","name":"Sita","kind":"woman","color":"red"},{"id":"c2","name":"Tiger","kind":"tiger","color":"orange"}]
[STORY]
@scene {"bg":"village","time":"day","fx":"none","cap":"Sita weaves","actors":[{"id":"c1","slot":"left","act":"talk","face":"right","prop":"shuttle","says":"Hello"}]}
Sita sat at her loom.
@scene {"bg":"forest","time":"night","fx":"fog","cap":"The tiger","actors":[{"id":"c2","slot":"right","act":"angry","face":"left"},{"id":"c1","slot":"left","act":"fear"}]}
A tiger came.
[QUESTION]
Who wins?
[WISDOM]
Kindness.`;
  const events: StoryEvent[] = [];
  const emitter = new TaleEmitter((e) => events.push(e));
  for (const ch of reply) emitter.push(ch);
  const { tale, board } = emitter.finish();

  assert.equal(tale.story, 'Sita sat at her loom.\n\nA tiger came.');
  const types = events.map((e) => e.type);
  assert.ok(types.indexOf('cast') < types.indexOf('scene'), 'cast arrives before the first scene');
  const scenes = events.filter((e): e is Extract<StoryEvent, { type: 'scene' }> => e.type === 'scene');
  assert.deepEqual(scenes.map((e) => e.index), [0, 1]);
  assert.equal(scenes[1].scene.background, 'forest');
  assert.equal(scenes[1].scene.actors[0].action, 'angry');
  // Scene 2 is sent before any text of paragraph 2.
  const sceneAt = events.indexOf(scenes[1]);
  const secondParagraphStarts = events.findIndex((e) => e.type === 'story' && e.delta.includes('\n\n'));
  assert.ok(secondParagraphStarts > 0 && sceneAt < secondParagraphStarts);
  for (const e of events) if ('delta' in e) assert.doesNotMatch(e.delta, /@scene|"bg"/);
  assert.equal(board?.scenes.length, 2);
  assert.equal(board?.cast[1].kind, 'tiger');
});

test('a scene broken over several lines is dropped without leaking JSON into the tale', () => {
  const reply = '[CAST]\n[{"id":"c1","name":"A","kind":"king","color":"red"}]\n[STORY]\n@scene {\n"bg": "palace",\n}\nThe king spoke.\n[QUESTION]\nWhy?';
  const s = splitSections(reply, true);
  assert.equal(s.story, 'The king spoke.');
});

test('extractJson unwraps arrays and code fences', () => {
  assert.deepEqual(extractJson('[{"a":1}]'), { a: 1 });
  assert.deepEqual(extractJson('```json\n{"a":2}\n```'), { a: 2 });
  assert.deepEqual(extractJson('Here you go: {"a":3} hope it helps'), { a: 3 });
  assert.throws(() => extractJson('no json here'));
});

test('toJudgeResponse clamps points and forces silence to score zero', () => {
  const r = toJudgeResponse({ verdict: 'WISE', points: 14, reply: 'Ha!', wisdom: 'W' }, false);
  assert.deepEqual(r, { verdict: 'wise', points: 10, reply: 'Ha!', wisdom: 'W' });
  const s = toJudgeResponse({ verdict: 'wise', points: 9, reply: 'Coward!', wisdom: 'W' }, true);
  assert.equal(s.verdict, 'silent');
  assert.equal(s.points, 0);
  assert.equal(toJudgeResponse({ verdict: 'meh', points: 3, reply: 'x', wisdom: 'y' }, false).verdict, 'partial');
});
