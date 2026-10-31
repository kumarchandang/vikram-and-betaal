import { paragraphsOf, type Storyboard } from '../../shared/puppets';
import type {
  AskResponse,
  AskTurn,
  FinaleResponse,
  JudgeResponse,
  Lang,
  LedgerEntry,
  Seed,
  Tale,
  Verdict,
} from '../../shared/types';
import { postJson, streamStory } from './api';
import { NightSound } from './audio';
import { Deck, FIRST_TREE_LINE, JUDGING_LINES, LAUGH, PAINTING_NOTE, SILENT_LINE, TELLING_LINES, TREE_LINES } from './copy';
import { Reveal } from './reveal';
import { Betaal, buildPyre, buildSkyline, buildTree, reducedMotion, startSky, type Mood } from './scene';
import { StoryStage } from './stage';
import './stage.css';
import { Voice, type Mark } from './voice';

const TALES_PER_NIGHT = 5;
// Paragraphs after the first are grouped into voice requests of about this many characters.
const VOICE_CHUNK = 600;
const MAX_CRACKS = 3;
const MAX_ASKS = 2;

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

/* Scene */

buildSkyline($('skyline'));
buildTree($('tree'));
buildPyre($('pyre'));
startSky($<HTMLCanvasElement>('sky'), $('pyre'));

const betaal = new Betaal(
  $<HTMLButtonElement>('betaal'),
  () => document.getElementById('hang-anchor')?.getBoundingClientRect() ?? null,
  () => ($('folio').hidden ? null : $('shoulder').getBoundingClientRect()),
);

const sound = new NightSound();
const voice = new Voice();
const deck = new Deck();
const stage = new StoryStage($('story-stage'));
// The paragraph currently shown on stage (and highlighted in the text).
let liveParagraph = -1;
voice.onSpeaking = (speaking) => $('betaal').classList.toggle('is-speaking', speaking);

/* Settings, remembered per browser */

interface Settings {
  lang: Lang;
  name: string;
  sound: boolean;
  voice: boolean;
}

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem('vab-settings') ?? '{}') as Partial<Settings>;
    return {
      lang: saved.lang === 'odia' || saved.lang === 'odia-roman' ? saved.lang : 'en',
      name: typeof saved.name === 'string' ? saved.name.slice(0, 32) : '',
      sound: saved.sound ?? true,
      voice: saved.voice ?? true,
    };
  } catch {
    return { lang: 'en', name: '', sound: true, voice: true };
  }
}

const settings = loadSettings();

function saveSettings(): void {
  try {
    localStorage.setItem('vab-settings', JSON.stringify(settings));
  } catch {
    // Private windows may block storage; the game works without it.
  }
}

function applySettings(): void {
  sound.setEnabled(settings.sound);
  voice.enabled = settings.voice;
  voice.lang = settings.lang;
  if (!voice.enabled) voice.reset();
  $('hud-sound').setAttribute('aria-pressed', String(settings.sound));
  $('hud-voice').setAttribute('aria-pressed', String(settings.voice));
  $<HTMLInputElement>('opt-sound').checked = settings.sound;
  $<HTMLInputElement>('opt-voice').checked = settings.voice;
  $<HTMLInputElement>('opt-name').value = settings.name;
  $<HTMLTextAreaElement>('answer').placeholder = `Speak, ${settings.name || 'Raja'}. Give your answer and your reason.`;
  document.documentElement.lang = { en: 'en', odia: 'or', 'odia-roman': 'or-Latn' }[settings.lang];
  saveSettings();
}

/** The fields every request to Betaal carries. */
function who(): { lang: Lang; name: string } {
  return { lang: settings.lang, name: settings.name };
}

for (const input of document.querySelectorAll<HTMLInputElement>('input[name="lang"]')) {
  input.checked = input.value === settings.lang;
  input.addEventListener('change', () => {
    settings.lang = input.value as Lang;
    applySettings();
  });
}
$<HTMLInputElement>('opt-sound').addEventListener('change', (e) => {
  settings.sound = (e.target as HTMLInputElement).checked;
  saveSettings();
});
$<HTMLInputElement>('opt-voice').addEventListener('change', (e) => {
  settings.voice = (e.target as HTMLInputElement).checked;
  saveSettings();
});
$('hud-sound').addEventListener('click', () => {
  settings.sound = !settings.sound;
  applySettings();
});
$('hud-voice').addEventListener('click', () => {
  settings.voice = !settings.voice;
  applySettings();
});
$<HTMLInputElement>('opt-name').addEventListener('change', (e) => {
  settings.name = (e.target as HTMLInputElement).value.replace(/[^\p{L}\p{M}\s.'-]/gu, '').trim().slice(0, 32);
  applySettings();
});

/* Game state */

type Phase = 'title' | 'tree' | 'telling' | 'answering' | 'judging' | 'verdict' | 'ending';

interface Night {
  told: number;
  cracks: number;
  score: number;
  ledger: LedgerEntry[];
  usedSeeds: Seed[];
  tale: Tale | null;
  asks: AskTurn[];
}

let phase: Phase = 'title';
let night: Night = freshNight();
let storyAbort: AbortController | null = null;
let reveal: Reveal | null = null;

function freshNight(): Night {
  return { told: 0, cracks: 0, score: 0, ledger: [], usedSeeds: [], tale: null, asks: [] };
}

function mood(m: Mood): void {
  betaal.setMood(m);
}

/* HUD */

const DIYA = `<svg class="diya" viewBox="0 0 28 28" aria-hidden="true">
  <path class="flame-d" d="M14 3 C17 8 17.5 12 14 15 C10.5 12 11 8 14 3 Z"/>
  <path class="bowl" d="M2 16 Q14 28 26 16 Q20 18.5 14 18.5 Q8 18.5 2 16 Z M23 16.5 L27 14.5 L25 17.5 Z"/>
</svg>`;

function renderHud(): void {
  const diyas = $('diyas');
  diyas.innerHTML = '';
  for (let i = 0; i < TALES_PER_NIGHT; i++) {
    const wrap = document.createElement('span');
    wrap.innerHTML = DIYA;
    const svg = wrap.firstElementChild!;
    if (i < night.told) svg.classList.add('lit');
    if (i === night.told && phase !== 'ending') svg.classList.add('current');
    diyas.append(svg);
  }
  diyas.setAttribute('aria-label', `Tales heard: ${night.told} of ${TALES_PER_NIGHT}`);
  const crown = $('crown-wrap');
  crown.dataset.cracks = String(Math.min(night.cracks, MAX_CRACKS));
  crown.setAttribute('aria-label', `Crown cracks: ${night.cracks} of ${MAX_CRACKS}`);
}

function pulse(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

/* Panels */

function show(panel: 'title-card' | 'tree-card' | 'folio' | 'end-card'): void {
  for (const id of ['title-card', 'tree-card', 'folio', 'end-card']) $(id).hidden = id !== panel;
  $('hud').hidden = panel === 'title-card';
  $<HTMLButtonElement>('betaal').disabled = panel !== 'tree-card';
  // The puppet show plays beside the folio while a tale is being told.
  $('story-stage').hidden = panel !== 'folio';
  document.body.classList.toggle('has-stage', panel === 'folio');
  if (panel !== 'folio') stage.stopAutoplay();
  if (betaal.at === 'shoulder') betaal.relayout();
}

/** Shows paragraph `i` on stage and marks it in the text. */
function setLive(i: number): void {
  liveParagraph = i;
  [...$('tale').children].forEach((p, k) => p.classList.toggle('is-live', k === i));
  if (stage.has(i)) stage.play(i);
}

stage.onPick = setLive;

// Who drives the puppet show: Betaal's voice when he can be heard, otherwise the text as it is written.
let followWriting = false;
let riddleShown = false;

const voiceLive = () => settings.voice && voice.canSpeak;

/** Without a voice, step through the remaining scenes at reading pace, then show the riddle. */
function playRestByReading(): void {
  const paras = paragraphsOf(night.tale?.story ?? '');
  const from = Math.max(0, liveParagraph);
  const durations = paras.slice(from).map((p) => Math.max(6000, p.length * 55));
  stage.autoplay(from, durations, () => {
    riddleShown = true;
    stage.riddle();
  });
}

let noteTimer = 0;
voice.onQuota = (hasFallback) => {
  const note = $('hud-note');
  note.textContent = hasFallback
    ? "Betaal's Gemini voice has used today's free quota, so your browser's voice reads for him."
    : settings.lang === 'odia'
      ? "Betaal's Gemini voice has used today's free quota. Open the game in Microsoft Edge to hear his Odia voice."
      : "Betaal's Gemini voice has used today's free quota, so he is silent. The tale and pictures go on.";
  clearTimeout(noteTimer);
  noteTimer = window.setTimeout(() => (note.textContent = ''), 15000);
  if (!hasFallback && phase === 'telling') {
    // Nothing will be heard, so the pictures follow the text instead of a silent voice.
    voice.reset();
    followWriting = true;
    if (reveal?.idle && night.tale) playRestByReading();
  }
};

/** Only used when Gemma's tale arrived without stage directions. */
async function loadScenes(title: string, story: string, abort: AbortController): Promise<void> {
  try {
    const board = await postJson<Storyboard>('/api/scenes', { ...who(), title, story });
    if (abort.signal.aborted || !['telling', 'answering', 'judging', 'verdict'].includes(phase)) return;
    stage.load(board);
    $('tale').classList.add('is-clickable');
    if (liveParagraph >= 0) stage.play(liveParagraph);
  } catch {
    if (!abort.signal.aborted) stage.titleCard(title, PAINTING_NOTE.failed[settings.lang]);
  }
}

function setStatus(text: string, error = false): void {
  const el = $('status');
  el.textContent = text;
  el.classList.toggle('is-error', error);
}

function setActions(...buttons: { label: string; primary?: boolean; onClick: () => void }[]): void {
  const box = $('folio-actions');
  box.innerHTML = '';
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${b.primary ? 'btn-primary' : 'btn-ghost'}`;
    btn.textContent = b.label;
    btn.addEventListener('click', b.onClick);
    box.append(btn);
  }
  if (buttons[0]?.primary) (box.firstElementChild as HTMLElement).focus({ preventScroll: true });
}

function appendLine(who: 'Vikram' | 'Betaal', text: string): void {
  const p = document.createElement('p');
  p.className = `line ${who.toLowerCase()}`;
  const name = document.createElement('span');
  name.className = 'who';
  name.textContent = who === 'Vikram' ? 'You' : 'Betaal';
  p.append(name, document.createTextNode(text));
  $('dialogue').append(p);
  scrollFolio(true);
}

function scrollFolio(force = false): void {
  const s = $('folio-scroll');
  const nearBottom = s.scrollHeight - s.scrollTop - s.clientHeight < 140;
  if (force || nearBottom) s.scrollTo({ top: s.scrollHeight, behavior: force && !reducedMotion ? 'smooth' : 'auto' });
}

function clearFolio(): void {
  for (const id of ['status', 'opening', 'tale-title', 'tale', 'riddle', 'dialogue', 'folio-actions']) $(id).textContent = '';
  $('answer-form').hidden = true;
  $('verdict').hidden = true;
  $('ask-box').hidden = true;
  $<HTMLTextAreaElement>('answer').value = '';
  $('folio-scroll').scrollTop = 0;
}

function renderTale([opening, title, story, question]: string[]): void {
  $('opening').textContent = opening;
  $('tale-title').textContent = title;
  const tale = $('tale');
  tale.replaceChildren(
    ...paragraphsOf(story).map((para, i) => {
      const p = document.createElement('p');
      p.textContent = para;
      if (i === liveParagraph) p.classList.add('is-live');
      return p;
    }),
  );
  $('riddle').textContent = question;
  scrollFolio();
  // With no voice to follow, the stage acts out whichever paragraph is being written.
  if (followWriting) {
    const writing = tale.children.length - 1;
    if (writing >= 0 && writing !== liveParagraph) setLive(writing);
    if (question && !riddleShown) {
      riddleShown = true;
      stage.riddle();
    }
  }
}

/* The night, step by step */

function beginNight(): void {
  night = freshNight();
  applySettings();
  sound.start();
  goToTree();
}

function goToTree(): void {
  phase = 'tree';
  voice.reset();
  reveal?.stop();
  show('tree-card');
  renderHud();
  $('tale-count').textContent = `Tale ${night.told + 1} of ${TALES_PER_NIGHT}`;
  $('tree-line').textContent = night.told === 0 ? FIRST_TREE_LINE[settings.lang] : deck.draw(TREE_LINES[settings.lang]);
  if (betaal.at !== 'tree') void betaal.moveTo('tree', false);
  mood('idle');
  $('lift').focus({ preventScroll: true });
}

function liftBetaal(): void {
  if (phase === 'tree') void tellTale();
}

class CutShort extends Error {}

async function tellTale(attempt = 0): Promise<void> {
  phase = 'telling';
  show('folio');
  clearFolio();
  setStatus(deck.draw(TELLING_LINES[settings.lang]));
  renderHud();
  voice.reset();
  night.tale = null;
  night.asks = [];

  const texts = ['', '', '', ''];
  let gotScenes = false;
  let narrated = 0;
  let questionQueued = false;

  /**
   * Queues finished paragraphs for Betaal's voice, each with a mark that switches the stage to its
   * scene the moment the voice reaches it. The first paragraph goes alone (led by the title) so the
   * tale starts quickly; later ones are grouped to spend fewer of the day's speech requests.
   */
  const narrate = (final: boolean) => {
    if (followWriting) return;
    const paras = paragraphsOf(texts[2]);
    const complete = final ? paras.length : Math.max(0, paras.length - 1);
    while (narrated < complete) {
      let chunk = narrated === 0 && texts[1] ? `${texts[1]}. ` : '';
      const marks: Mark[] = [];
      let k = narrated;
      do {
        const paragraph = k;
        marks.push({ at: chunk.length, run: () => setLive(paragraph) });
        chunk += `${paras[k]} `;
        k++;
      } while (narrated > 0 && k < complete && chunk.length < VOICE_CHUNK);
      if (!final && narrated > 0 && chunk.length < VOICE_CHUNK) break;
      if (final && k === paras.length) {
        marks.push({ at: chunk.length, run: () => stage.riddle() });
        chunk += texts[3];
        questionQueued = true;
      }
      narrated = k;
      voice.say(chunk, marks);
    }
    if (final && !questionQueued) {
      questionQueued = true;
      voice.say(texts[3], [{ at: 0, run: () => stage.riddle() }]);
    }
  };

  liveParagraph = -1;
  riddleShown = false;
  followWriting = !voiceLive();
  stage.reset();
  // The show starts at once: the king and Betaal in the cremation ground while the tale is written.
  stage.frame(settings.name || 'Vikram', LAUGH[settings.lang]);
  $('tale').classList.remove('is-clickable');
  // The tale is requested while Betaal is still flying to your shoulder.
  if (betaal.at !== 'shoulder') {
    sound.sfx('whoosh');
    mood('laugh');
    void betaal.moveTo('shoulder').then(() => {
      if (!texts.some(Boolean)) mood('think');
    });
  } else {
    mood('think');
  }

  let finished = false;
  const ready = () => {
    if (finished && reveal === r && r.idle && phase === 'telling') enterAnswering();
  };
  reveal?.stop();
  const r = new Reveal(4, renderTale, ready);
  reveal = r;
  setActions({
    label: 'Show the whole tale',
    onClick: () => {
      r.flush();
      ready();
    },
  });

  storyAbort?.abort();
  const abort = new AbortController();
  storyAbort = abort;
  try {
    await streamStory(
      {
        ...who(),
        round: night.told + 1,
        total: TALES_PER_NIGHT,
        ledger: night.ledger,
        usedSeeds: night.usedSeeds,
      },
      (e) => {
        switch (e.type) {
          case 'meta':
            night.usedSeeds.push(e.seed);
            break;
          case 'opening':
          case 'story':
          case 'question': {
            const i = e.type === 'opening' ? 0 : e.type === 'story' ? 2 : 3;
            if (!texts.some(Boolean)) {
              setStatus('');
              mood('talk');
            }
            texts[i] += e.delta;
            r.set(i, texts[i]);
            if (e.type === 'story') narrate(false);
            break;
          }
          case 'title':
            texts[1] = e.text;
            r.set(1, e.text);
            stage.frame(settings.name || 'Vikram', LAUGH[settings.lang], e.text);
            // The opening is complete: Betaal starts talking while the frame scene plays.
            if (!followWriting) voice.say(texts[0]);
            break;
          case 'cast':
            stage.setCast(e.cast);
            break;
          case 'scene':
            // Scenes arrive just before their paragraph; show one at once if the voice or text is already there.
            gotScenes = true;
            stage.setScene(e.index, e.scene);
            $('tale').classList.add('is-clickable');
            if (e.index <= liveParagraph) stage.play(liveParagraph);
            break;
          case 'done':
            night.tale = e.tale;
            if (e.board) stage.load(e.board);
            else if (!gotScenes) void loadScenes(e.tale.title, e.tale.story, abort);
            narrate(true);
            break;
          case 'error':
            throw e.retry ? new CutShort(e.message) : new Error(e.message);
        }
      },
      abort.signal,
    );
    if (!night.tale) throw new Error('The tale stopped before the riddle. Try again.');
    finished = true;
    ready();
  } catch (err) {
    if (abort.signal.aborted) return;
    r.stop();
    // A tale cut short is retried quietly with fresh ingredients (the failed seed is already marked as used).
    if (err instanceof CutShort && attempt < 2) {
      void tellTale(attempt + 1);
      return;
    }
    mood('angry');
    setStatus(`Betaal lost his thread: ${(err as Error).message}`, true);
    setActions({ label: 'Ask him to start again', primary: true, onClick: () => void tellTale() });
  }
}

function enterAnswering(): void {
  phase = 'answering';
  setActions();
  mood('smug');
  $('answer-form').hidden = false;
  updateAskButton();
  scrollFolio(true);
  $('answer').focus({ preventScroll: true });
}

function updateAskButton(): void {
  const left = MAX_ASKS - night.asks.length;
  const btn = $<HTMLButtonElement>('ask-toggle');
  btn.textContent = left > 0 ? `Ask Betaal a question (${left} left)` : 'No more questions';
  btn.disabled = left <= 0;
  if (left <= 0) $('ask-box').hidden = true;
}

async function askBetaal(): Promise<void> {
  const input = $<HTMLInputElement>('ask-input');
  const q = input.value.trim();
  if (!q || !night.tale || night.asks.length >= MAX_ASKS || phase !== 'answering') return;
  const send = $<HTMLButtonElement>('ask-send');
  send.disabled = true;
  input.disabled = true;
  appendLine('Vikram', q);
  mood('think');
  try {
    const { reply } = await postJson<AskResponse>('/api/ask', { ...who(), tale: night.tale, question: q, asks: night.asks });
    night.asks.push({ q, a: reply });
    appendLine('Betaal', reply);
    voice.reset();
    voice.say(reply);
    mood('smug');
    input.value = '';
  } catch (err) {
    $('dialogue').lastElementChild?.remove();
    setStatus((err as Error).message, true);
    mood('smug');
  } finally {
    send.disabled = false;
    input.disabled = false;
    updateAskButton();
    if (!$('ask-box').hidden) input.focus({ preventScroll: true });
  }
}

async function judge(answer: string | null): Promise<void> {
  if (phase !== 'answering' || !night.tale) return;
  if (answer !== null && !answer.trim()) {
    pulse($('answer-form'), 'shake');
    $('answer').focus();
    return;
  }
  phase = 'judging';
  voice.reset();
  setStatus('');
  $('answer-form').hidden = true;
  appendLine('Vikram', answer !== null ? answer.trim() : SILENT_LINE[settings.lang]);
  const thinking = document.createElement('p');
  thinking.className = 'status';
  thinking.textContent = deck.draw(JUDGING_LINES[settings.lang]);
  $('dialogue').append(thinking);
  scrollFolio(true);
  mood('think');

  try {
    const v = await postJson<JudgeResponse>('/api/judge', {
      ...who(),
      tale: night.tale,
      answer: answer === null ? null : answer.trim(),
      asks: night.asks,
      ledger: night.ledger,
    });
    thinking.remove();
    showVerdict(v, answer === null ? null : answer.trim());
  } catch (err) {
    thinking.remove();
    $('dialogue').lastElementChild?.remove();
    phase = 'answering';
    $('answer-form').hidden = false;
    setStatus((err as Error).message, true);
    mood('smug');
  }
}

const VERDICT_HEAD: Record<Verdict, (points: number) => string> = {
  wise: (p) => `A wise answer. +${p} wisdom`,
  partial: (p) => `Half right. +${p} wisdom`,
  foolish: () => 'A foolish answer. Your crown cracks.',
  silent: () => 'You stayed silent. Your crown cracks.',
};

const VERDICT_MOOD: Record<Verdict, Mood> = { wise: 'laugh', partial: 'smug', foolish: 'laugh', silent: 'angry' };

function showVerdict(v: JudgeResponse, answer: string | null): void {
  phase = 'verdict';
  const tale = night.tale!;
  night.ledger.push({ title: tale.title, answer, verdict: v.verdict, points: v.points });
  night.score += v.points;
  night.told++;
  const cracked = v.verdict === 'foolish' || v.verdict === 'silent';
  if (cracked) night.cracks++;

  const box = $('verdict');
  box.dataset.verdict = v.verdict;
  $('verdict-head').textContent = VERDICT_HEAD[v.verdict](v.points);
  $('verdict-reply').textContent = v.reply;
  $('wisdom').textContent = v.wisdom;
  box.hidden = false;
  scrollFolio(true);
  mood(VERDICT_MOOD[v.verdict]);
  stage.react(v.verdict);
  voice.say(v.reply);
  renderHud();

  const over: 'won' | 'burst' | null = night.cracks >= MAX_CRACKS ? 'burst' : night.told >= TALES_PER_NIGHT ? 'won' : null;

  if (cracked) {
    sound.sfx('crack');
    pulse($('crown-wrap'), 'hit');
  } else {
    sound.sfx('chime');
  }
  if (over === 'burst') {
    window.setTimeout(() => {
      sound.sfx('burst');
      pulse($('flash'), 'on');
      pulse($('stage'), 'quake');
      $('crown-wrap').classList.add('burst');
    }, 700);
  }

  // Speaking breaks Vikram's vow of silence, so Betaal escapes back to his tree.
  if (v.verdict !== 'silent') {
    window.setTimeout(async () => {
      if (phase !== 'verdict') return;
      sound.sfx('whoosh');
      await betaal.moveTo('tree');
      mood('idle');
    }, 1800);
  }

  if (over) {
    setActions({ label: 'See how the night ends', primary: true, onClick: () => void endNight(over) });
  } else if (v.verdict === 'silent') {
    setActions({ label: 'Keep walking', primary: true, onClick: () => void tellTale() });
  } else {
    setActions({ label: 'Walk back to the peepal tree', primary: true, onClick: goToTree });
  }
}

async function endNight(outcome: 'won' | 'burst'): Promise<void> {
  phase = 'ending';
  voice.reset();
  show('end-card');
  renderHud();
  if (betaal.at !== 'tree') void betaal.moveTo('tree');
  mood(outcome === 'won' ? 'smug' : 'laugh');

  $('end-outcome').textContent =
    outcome === 'won'
      ? `Dawn breaks over Ujjain. You heard all ${TALES_PER_NIGHT} tales and kept your head.`
      : 'Crack! Your head bursts into a thousand pieces. This being a legend, you wake at dawn with nothing worse than a headache.';
  const ledger = $('ledger');
  ledger.innerHTML = '';
  for (const e of night.ledger) {
    const li = document.createElement('li');
    const title = document.createElement('span');
    title.className = 'l-title';
    title.textContent = e.title;
    const said = document.createElement('span');
    said.className = 'l-answer';
    said.textContent = e.answer ? `“${e.answer.length > 90 ? e.answer.slice(0, 90) + '…' : e.answer}”` : 'You stayed silent.';
    const verdict = document.createElement('span');
    verdict.className = 'l-verdict';
    verdict.dataset.verdict = e.verdict;
    verdict.textContent = { wise: `Wise +${e.points}`, partial: `Half right +${e.points}`, foolish: 'Foolish', silent: 'Silent' }[e.verdict];
    li.append(title, verdict, said);
    ledger.append(li);
  }
  $('end-score').textContent = `Wisdom: ${night.score} of ${night.told * 10}`;
  $('end-name').hidden = true;
  $('copy').hidden = true;
  await loadFinale(outcome);
}

async function loadFinale(outcome: 'won' | 'burst'): Promise<void> {
  const status = $('end-outcome');
  const base = status.textContent;
  status.textContent = `${base} Betaal is choosing a name for you…`;
  try {
    const f = await postJson<FinaleResponse>('/api/finale', { ...who(), ledger: night.ledger, outcome });
    status.textContent = base;
    $('end-title').textContent = f.title;
    $('end-trait').textContent = f.trait;
    $('end-farewell').textContent = f.farewell;
    $('end-name').hidden = false;
    $('copy').hidden = false;
    $('copy').dataset.title = f.title;
    voice.say(`${f.title}. ${f.farewell}`);
    sound.sfx('chime');
  } catch (err) {
    status.textContent = `${base} Betaal could not name you: ${(err as Error).message}`;
  }
}

async function copyTitle(): Promise<void> {
  const btn = $('copy');
  const text = `Betaal named me "${btn.dataset.title}" after ${night.told} tales in Vikram and Betaal (wisdom ${night.score} of ${night.told * 10}). ${location.origin}`;
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied';
  } catch {
    btn.textContent = 'Copy failed. Select the title instead.';
  }
  window.setTimeout(() => (btn.textContent = 'Copy your title'), 2200);
}

/* Wiring */

$('begin').addEventListener('click', beginNight);
$('lift').addEventListener('click', liftBetaal);
$('betaal').addEventListener('click', liftBetaal);
window.addEventListener('load', () => betaal.relayout());
$('answer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  void judge($<HTMLTextAreaElement>('answer').value);
});
$('answer').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    void judge($<HTMLTextAreaElement>('answer').value);
  }
});
$('silent').addEventListener('click', () => void judge(null));
$('tale').addEventListener('click', (e) => {
  const p = (e.target as HTMLElement).closest('#tale > p');
  if (!p || !stage.loaded) return;
  stage.stopAutoplay();
  setLive([...$('tale').children].indexOf(p));
});
$('ask-toggle').addEventListener('click', () => {
  const box = $('ask-box');
  box.hidden = !box.hidden;
  $('ask-toggle').setAttribute('aria-expanded', String(!box.hidden));
  if (!box.hidden) $('ask-input').focus();
});
$('ask-send').addEventListener('click', () => void askBetaal());
$('ask-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    void askBetaal();
  }
});
$('again').addEventListener('click', () => {
  $('crown-wrap').classList.remove('burst');
  beginNight();
});
$('copy').addEventListener('click', () => void copyTitle());

applySettings();
show('title-card');
mood('idle');
