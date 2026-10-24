import type { ImageSourcePropType } from 'react-native';

import { SCENES } from '../deities';
import { GITA_CHAPTERS } from './chapters';
import { CH2A } from './notes/ch2a';
import { CH2B } from './notes/ch2b';
import { CH2C } from './notes/ch2c';
import { CH3A } from './notes/ch3a';
import { CH3B } from './notes/ch3b';
import { CH4A } from './notes/ch4a';
import { CH1N } from './notes/ch1n';
import { CH5N } from './notes/ch5n';
import { CH6N } from './notes/ch6n';
import { CH7N } from './notes/ch7n';
import { CH8N } from './notes/ch8n';
import { CH9N } from './notes/ch9n';
import { CH10N } from './notes/ch10n';
import { CH11N } from './notes/ch11n';
import { CH12N } from './notes/ch12n';
import { CH13N } from './notes/ch13n';
import { CH14N } from './notes/ch14n';
import { CH15N } from './notes/ch15n';
import { CH16N } from './notes/ch16n';
import { CH17N } from './notes/ch17n';
import { CH18A } from './notes/ch18a';
import { CH18B } from './notes/ch18b';
import type { GitaVerse, Moment, VerseNote, VerseNotes } from './types';

const VERSES = require('./verses.json') as GitaVerse[];

export { GITA_CHAPTERS };
export type { GitaVerse, VerseNote };

const NOTES: Record<number, VerseNotes> = {
  1: CH1N,
  2: { ...CH2A, ...CH2B, ...CH2C },
  3: { ...CH3A, ...CH3B },
  4: CH4A,
  5: CH5N,
  6: CH6N,
  7: CH7N,
  8: CH8N,
  9: CH9N,
  10: CH10N,
  11: CH11N,
  12: CH12N,
  13: CH13N,
  14: CH14N,
  15: CH15N,
  16: CH16N,
  17: CH17N,
  18: { ...CH18A, ...CH18B },
};

/** "இந்தத் தருணம்" — the scene behind a run of verses (written for Divine Life). */
const MOMENTS: Record<number, Moment[]> = {
  1: [
    { from: 1, to: 1, text: 'போர் அரண்மனையிலிருந்து வெகு தொலைவில் தொடங்கவிருக்கிறது. பார்வையற்ற மன்னன் திருதராஷ்டிரன், நடப்பதைச் சொல்லுமாறு சஞ்சயனிடம் கேட்கிறான்.' },
    { from: 2, to: 19, text: 'துரியோதனன் தன் குரு துரோணரிடம் சென்று இரு படைகளின் வலிமையையும் எண்ணிப் பார்க்கிறான். சங்குகள் முழங்குகின்றன.' },
    { from: 20, to: 27, text: 'அர்ஜுனன் தேரை இரு படைகளுக்கும் நடுவே நிறுத்தச் சொல்கிறான். எதிரே நிற்பவர்களைப் பார்க்கிறான் — தாத்தா, குரு, சகோதரர்கள், நண்பர்கள்.' },
    { from: 28, to: 47, text: 'அர்ஜுனனின் கைகள் நடுங்குகின்றன. வில் நழுவுகிறது. "இவர்களைக் கொன்று பெறும் வெற்றி எனக்கு வேண்டாம்" என்று தேரில் அமர்ந்துவிடுகிறான்.' },
  ],
  2: [
    { from: 1, to: 10, text: 'அர்ஜுனன் கண்ணீருடன் தேரில் அமர்ந்திருக்கிறான். குழப்பத்தின் உச்சத்தில், கிருஷ்ணரிடம் சீடனாகச் சரணடைகிறான்.' },
    { from: 11, to: 30, text: 'கிருஷ்ணர் புன்னகைக்கிறார். உடல் அழியும், ஆனால் உள்ளே இருக்கும் ஆன்மா அழிவதில்லை என்று விளக்கத் தொடங்குகிறார்.' },
    { from: 31, to: 38, text: 'தத்துவத்திலிருந்து நடைமுறைக்கு: அர்ஜுனனின் பொறுப்பு என்ன, அதிலிருந்து விலகினால் என்ன நடக்கும் என்று கிருஷ்ணர் காட்டுகிறார்.' },
    { from: 39, to: 53, text: 'இப்போது செயலின் இரகசியம் — பலனில் பற்றில்லாமல், சமநிலையுடன் செய்வதே யோகம் என்று கிருஷ்ணர் கற்பிக்கிறார்.' },
    { from: 54, to: 72, text: '"நிலைத்த அறிவுடையவன் எப்படி இருப்பான்?" என்று அர்ஜுனன் கேட்கிறான். கிருஷ்ணர் அமைதியான மனிதனின் உருவத்தை வரைகிறார்.' },
  ],
  3: [
    { from: 1, to: 2, text: 'அர்ஜுனன் குழம்புகிறான்: "அறிவே மேலானது என்றால், ஏன் என்னைப் போருக்குத் தள்ளுகிறாய்?"' },
    { from: 3, to: 9, text: 'கிருஷ்ணர் விளக்குகிறார்: செயலைத் தவிர்க்க முடியாது; பற்றின்றிச் செய்வதே விடுதலை.' },
    { from: 10, to: 16, text: 'கொடுத்தலும் பெறுதலுமான வாழ்க்கைச் சக்கரம் — உணவு, மழை, அர்ப்பணிப்பு.' },
    { from: 17, to: 35, text: 'ஞானியும் உலக நன்மைக்காகச் செயல்படுகிறான். கிருஷ்ணர் தம்மையே உதாரணமாகக் காட்டுகிறார்.' },
    { from: 36, to: 43, text: '"விரும்பாமலே ஏன் தவறு செய்கிறேன்?" — அர்ஜுனனின் கேள்விக்கு, ஆசையே உள் எதிரி என்று கிருஷ்ணர் பதில் சொல்கிறார்.' },
  ],
  4: [
    { from: 1, to: 3, text: 'கிருஷ்ணர் வெளிப்படுத்துகிறார்: இந்த யோகம் புதியதல்ல; யுகங்களுக்கு முன்பே சூரியனுக்கு அவரே சொன்னது.' },
    { from: 4, to: 10, text: '"நீங்கள் எப்படி அப்போதே இருந்தீர்கள்?" — அர்ஜுனனின் கேள்விக்கு, அவதாரத்தின் இரகசியத்தை கிருஷ்ணர் விளக்குகிறார்.' },
    { from: 11, to: 23, text: 'செயலும் செயலின்மையும் — பற்றில்லாமல் செய்யும் செயல் பிணைப்பதில்லை.' },
    { from: 24, to: 33, text: 'எல்லாமே வேள்வி: பொருள், தவம், மூச்சு, கல்வி — எதுவும் அர்ப்பணிப்பாகலாம்.' },
    { from: 34, to: 42, text: 'ஞானம் — பணிவுடன் கற்று, சந்தேகத்தை வாளால் வெட்டி, எழுந்து நிற்கும் வழி.' },
  ],
};

export function chapterVerses(c: number): GitaVerse[] {
  return VERSES.filter((v) => v.c === c);
}

export function getVerse(c: number, v: number): GitaVerse | undefined {
  return VERSES.find((x) => x.c === c && x.v === v);
}

export function getNote(c: number, v: number): VerseNote | undefined {
  return NOTES[c]?.[v];
}

export function hasNotes(c: number) {
  return !!NOTES[c];
}

/** The speaker in force for a verse (the text only names a speaker where it changes). */
export function speakerFor(c: number, v: number): string {
  const list = chapterVerses(c);
  let who = c === 1 ? 'திருதராஷ்டிரன் கூறினான்' : 'ஸ்ரீ பகவான் கூறினார்';
  for (const x of list) {
    if (x.v > v) break;
    if (x.s) who = x.s;
  }
  return getNote(c, v)?.s ?? who;
}

export function momentFor(c: number, v: number): string {
  const m = MOMENTS[c]?.find((x) => v >= x.from && v <= x.to);
  return m?.text ?? GITA_CHAPTERS[c - 1].context.join(' ');
}

export function artFor(c: number): ImageSourcePropType {
  return c === 11 ? SCENES.vishwaroopa : SCENES.krishnaArjuna;
}

export const TOTAL_VERSES = VERSES.length;

/** "இன்று உங்கள் மனம்?" — a feeling opens the verse that speaks to it. */
export const MOODS = [
  { id: 'anger', label: 'கோபம்', c: 2, v: 63, why: 'சினம் எப்படி அறிவை மறைக்கிறது' },
  { id: 'worry', label: 'கவலை', c: 9, v: 22, why: '"நானே சுமக்கிறேன்"' },
  { id: 'confused', label: 'குழப்பம்', c: 2, v: 7, why: '"எனக்குத் தெரியவில்லை" என்று சொல்லும் துணிவு' },
  { id: 'grief', label: 'துயரம்', c: 2, v: 22, why: 'பழைய ஆடை, புதிய ஆடை' },
  { id: 'low', label: 'சோர்வு', c: 6, v: 5, why: 'உனக்கு நீயே நண்பன்' },
  { id: 'restless', label: 'அமைதியின்மை', c: 6, v: 35, why: 'பயிற்சியும் பற்றின்மையும்' },
  { id: 'desire', label: 'ஆசை', c: 3, v: 37, why: 'ஆசையும் சினமும் ஒன்றே' },
  { id: 'fear', label: 'பயம்', c: 18, v: 66, why: '"வருந்தாதே"' },
  { id: 'compare', label: 'ஒப்பீடு', c: 3, v: 35, why: 'உங்கள் வழியே உங்களுக்கு' },
  { id: 'lazy', label: 'தள்ளிப்போடல்', c: 3, v: 8, why: 'செயலே மேலானது' },
  { id: 'guilt', label: 'குற்றவுணர்வு', c: 9, v: 30, why: 'திரும்பிய கணமே மாற்றம்' },
  { id: 'lonely', label: 'தனிமை', c: 6, v: 30, why: 'அவர் உன்னை விட்டுப் போவதில்லை' },
  { id: 'failure', label: 'தோல்வி', c: 6, v: 40, why: 'நல்ல முயற்சி வீணாவதில்லை' },
] as const;

/** English meanings, loaded per chapter as they are written. */
import { EN } from './en';
export function getEn(c: number, v: number) {
  return EN[c]?.[v];
}
