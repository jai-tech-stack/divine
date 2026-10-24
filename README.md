# Divine Life — தெய்வீக வாழ்வு

Tamil-first spiritual companion (Expo SDK 58 · React Native · TypeScript).

## What works now

| Screen | What it does |
|---|---|
| முகப்பு (Home) | Live animated preview of today's story, Japa and Dhyanam shortcuts |
| கதை (Story player) | 10 cinematic scenes: parallax painted layers, slow camera zoom/pan, god-rays, particles (embers, petals, sparks, stars), lightning/tremor/bloom, cross-fades. Tamil narration via the device's Tamil voice, subtitles synced to the voice (timed text when no voice). Tap left = back · centre = pause · right = next |
| கற்றல் (after the story) | சுலோகம் (Devanagari + Tamil script, spoken) → பொருள் (word-by-word) → ஞானம் (4 notes) → செயல் (reflection + one voluntary practice that opens Dhyanam with 5 min) → கேள் (AI companion) |
| பகவத் கீதை (`/gita`) | All 700 verses free, no locks (plus 13.0, Arjuna's question found in some editions). Own "சுவடி + உரையாடல்" design: home with the Krishna–Arjuna upadesam painting and a camera that follows the speaker, feelings → verse, 18 temple steps; each chapter as a dialogue thread (Krishna / Arjuna / Sanjaya bubbles with scene notes); each verse as a palm leaf (Tamil script / Sanskrit, chant-along line highlight), சொல் மாலை word beads, three lamps (பொருள் / விளக்கம் / வாழ்வில்), சிந்திக்க, இன்றைய செயல் commitment, ask the AI about this verse only. Own Tamil notes for every verse of all 18 chapters in `src/content/gita/notes/`. `tools/gita_fix.py` cleans speaker labels and line breaks in the verse data |
| மந்திரங்கள் (`/mantras`) | 24 mantras/shlokas across 10 deities + common prayers. Today's mantra, deity circles, favourites. Reader: Tamil meaning under every line by default, Tamil/Sanskrit, font size, background, when to chant, chant-along with repeat 1/3/11/21 and counter, "ஜப மாலை" opens Japa with that mantra |
| ஞான நூலகம் (`/library`) | நான்கு யோகங்கள், மூன்று குணங்கள், பதினெண் சித்தர்கள், பன்னிரு ஆழ்வார்கள், சைவ நால்வர் — expandable cards, listen, links into Gita verses and practices |
| ஜப மாலை | 108 beads light up, current bead pulses, ripple + bell + haptic per count, gong and burst at 108, auto-count, 4 mantras, volume |
| தியானம் | Lotus and rings breathe with the pattern (4-4-6 default), phase prompts with seconds, 5/10/15/20 min, looping tambura (Sa-Pa), gong at the end |

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go (SDK 58) on your phone
npx expo start --web    # or in the browser
```

For Tamil narration on Android: Settings → System → Languages → Text-to-speech → install Tamil (Google). On iPhone: Settings → Accessibility → Spoken Content → Voices → Tamil.

## The AI companion (free tiers only)

The app never holds provider keys. `supabase/functions/wisdom` tries **Gemini → Groq → OpenRouter (free model)** and returns the first answer. Only the current question and story context are sent; old chats are never forwarded between providers.

```bash
supabase secrets set GEMINI_API_KEY=... GROQ_API_KEY=... OPENROUTER_API_KEY=...
supabase functions deploy wisdom
cp .env.example .env    # fill EXPO_PUBLIC_WISDOM_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Without it, the three suggested questions return prepared answers (labelled as such).

## Adding cinematic artwork

Each scene in `src/content/stories/prithu.ts` has an `imagePrompt`. Generate a 9:16 image with your image tool, save it under `assets/stories/prithu/`, and add `image: require('@/assets/stories/prithu/naimisha.jpg')` to that scene. The player gives that painting the same slow camera move, with particles and effects on top. Scenes without an image keep the drawn backdrop.

## Adding the next story

Copy `src/content/stories/prithu.ts`, change the scenes (pick any of the 10 backdrops or add art), verse, wisdom, reflection and practice, and add it to `src/content/index.ts`.

## Content sources

- Story: retold in our own words from அ.ச. ஞானசம்பந்தன், ஞா. மீரா — *பதினெண் புராணங்கள்* (கங்கை புத்தக நிலையம்), பிரம்ம புராணம், pp. 10–13 (Tamil Virtual Academy e-library). The book is cited as a reference; no passage is copied.
- Verse: Bhagavad Gita 2.63 (public domain). It is not from the Brahma Purana and the app says so.
- Meanings and wisdom notes: AI drafts, labelled "awaiting review".
- Sounds (bell, gong, tambura) are synthesised for this project — no third-party recordings.

## Gita and mantra sources

- Sanskrit Gita text: [gita/gita](https://github.com/gita/gita) dataset (public domain / Unlicense); Tamil script generated with indic-transliteration. Rebuild: `tools/gita_prep.py`.
- All Tamil meanings, explanations, moments, library entries: written for Divine Life (AI draft, awaiting review). No translation from Bharathiyar or any other book is copied.
- Mantra texts are traditional Sanskrit; benefits are described as tradition, never promised.
