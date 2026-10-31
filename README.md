# Vikram and Betaal (ବିକ୍ରମ ଓ ବେତାଳ)

Carry the ghost. Hear his tale. Answer his riddle, or lose your head.

Every night King Vikram cuts the ghost Betaal down from a tree in the cremation ground and carries him away. Every night Betaal tells a tale that ends in a moral riddle. Answer, and the ghost escapes back to his tree. Know the answer and stay silent, and your head bursts into a thousand pieces.

This game brings that old story to life with an open model. Every tale, every judgement and every taunt is written live, so no two nights are the same. Betaal speaks English, Odia (ଓଡ଼ିଆ) and Odia in English letters, calls you by your own name, and remembers what you said earlier in the night.

## How it uses Gemma

All of Betaal's words come from **Gemma 4 (`gemma-4-26b-a4b-it`)**, called through the Gemini API:

| What Betaal does | How Gemma is used |
| --- | --- |
| Tells a new tale | Streamed in tagged sections (`[OPENING] [TITLE] [STORY] [QUESTION] [WISDOM]`), parsed on the server as it arrives, so the tale appears within a couple of seconds. Each night draws a fresh mix of setting, dilemma, twist, mood and storytelling device, so tales don't repeat. Odia tales are set in Odisha: Puri, Konark, Chilika, Sambalpur, Bali Jatra and more. |
| Hides his own answer | The `[WISDOM]` section is never shown until you answer. |
| Judges your answer | Gemma reads your reasoning (not keywords) and returns JSON: verdict, points, an in-character reaction that quotes you, and the answer he had in mind. |
| Answers your questions | You can question Betaal twice per tale; he hints but never gives the answer away. |
| Directs a puppet show of the tale | While it writes the tale, Gemma also directs it: a `[CAST]` line picks puppets for the characters (king, sage, thief, tiger, elephant and more), and a one-line `@scene` direction before each paragraph says where they stand, what they do, what they say in speech bubbles, plus the background, time of day and effect. The server parses these out of the stream, so each scene reaches the browser before its paragraph does. The browser performs it as an animated 2D cartoon painted like an Odisha pattachitra. |
| Names you at dawn | A title like "Chandan the Merciful", based on how you judged all night. |

Gemma's system instructions keep Betaal in character, and your text is passed in as quoted data, so "ignore your instructions" just gets you mocked.

Betaal's voice comes from Gemini speech (`gemini-3.8-flash-tts`, falling back to `gemini-3.8-flash-lite-tts`). Each paragraph is voiced as soon as Gemma finishes writing it, in a slow, gravelly, amused ghost voice, in Odia or English.

The free tier allows only about 10 speech requests per day per model, which is two or three tales. When that runs out, the server stops asking until Google's reset time, and the game uses the browser's own voice, but only if it really speaks the language (Microsoft Edge has a natural Odia voice). Otherwise Betaal stays silent instead of reading Odia badly, and the puppet show keeps the pace of the tale. To get Gemini's voice all night, turn on billing for your AI Studio project; speech costs a few cents per tale.

The puppet show needs no images or extra models. It has a fixed library of 28 hand-drawn puppets (16 people from kings to thieves, a god and a ghost, and 11 animals), 16 props and 10 painted backgrounds, all SVG drawn in code (`client/src/puppets.ts`) and animated with CSS, so a scene appears the instant Gemma names it.

**How sound and pictures stay together.** The show opens at once with the king and Betaal in the cremation ground. After that, Betaal's voice drives it: paragraphs go to the speech model in a few grouped requests (about four per tale, to stretch the free quota), and each carries marks for where its paragraphs and the riddle begin. As a clip plays, its position in the audio tells the stage how far into the text the voice is, and the scene changes at that moment. If there is no voice (switched off, or out of quota with no browser voice for the language), the scenes follow the text as it is written instead.

## Run it

You need Node.js 20 or later and a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env      # then put your key in .env
npm run dev               # game at http://localhost:5173
```

Or build once and serve everything from one port:

```bash
npm start                 # http://localhost:8787
```

| Setting in `.env` | Default | What it does |
| --- | --- | --- |
| `GEMINI_API_KEY` | (required) | Your Gemini API key. It stays on the server and never reaches the browser. |
| `GEMMA_MODEL` | `gemma-4-26b-a4b-it` | Use `gemma-4-31b-it` for the larger dense model. |
| `TTS_MODELS` | `gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts` | Speech models, tried in order. |
| `TTS_VOICE` | `Algenib` | Gemini prebuilt voice (gravelly). |
| `PORT` | `8787` | API server port. |

## Tests

```bash
npm test         # stream parser and JSON handling
npm run typecheck
```

## Project layout

- `server/`: Express API. `prompts.ts` holds Betaal's character and story ingredients, `sections.ts` parses the streamed tale, `voice.ts` makes his voice.
- `client/`: The game (Vite and TypeScript, no framework). The scene (peepal tree, Puri/Ujjain skyline, pyre, embers) is drawn in SVG and canvas; the night sounds are synthesised with Web Audio. `stage.ts` and `puppets.ts` are the pattachitra puppet theatre.
- `shared/`: Types shared by both, including the puppet show's vocabulary (`puppets.ts`).

## License

MIT
