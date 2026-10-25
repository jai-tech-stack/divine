import type { ImageSourcePropType } from 'react-native';

import { DEITIES, getDeity, SCENES } from './deities';

export type MantraLine = { sa: string; ta: string; en: string; mean: string };
export type Mantra = {
  id: string;
  deity: string;
  name: string;
  kind: 'mantra' | 'shloka';
  when: string;
  about: string;
  japa: number;
  lines: MantraLine[];
  /** long stotrams: verses grouped in parts (lines then holds a preview) */
  sections?: StotraSection[];
  /** where the text comes from */
  source?: string;
  originalLanguage?: 'ta' | 'sa' | 'hi';
  aliases?: string[];
  practice?: { days: string; steps: string[]; note?: string };
  references?: { title: string; url: string }[];
};

export type StotraVerse = { sa: string; ta: string; en: string; mean?: string };
export type StotraSection = { key: string; title: string; titleEn: string; verses: StotraVerse[] };

/** Texts: traditional Sanskrit (public domain); Tamil meanings written for Divine Life (AI draft, awaiting review). */
const BASE = (require('./mantras.json') as Mantra[]).map(m => m.id.startsWith('saraswati-') ? { ...m, deity: 'saraswati' } : m);
const VSN = require('./stotras_vsn.json') as StotraSection[];
const GANESHA = require('./ganesha.json') as Mantra[];
const SHIVA = (require('./shiva.json') as Mantra[]).map(m => m.id.includes('bhairav') ? { ...m, deity: 'bhairava' } : m);
const MURUGAN = require('./murugan.json') as Mantra[];
const DEVOTIONAL = require('./devotional.json') as Mantra[];
const BASE_WITHOUT_REPLACED = BASE.filter(m => !DEVOTIONAL.some(full => full.id === m.id));

const vishnuSahasranama: Mantra = {
  id: 'vishnu-sahasranama',
  deity: 'vishnu',
  name: 'ஸ்ரீ விஷ்ணு ஸஹஸ்ரநாமம்',
  kind: 'shloka',
  when: 'ஏகாதசி, வியாழன், சனி; தினமும் காலை அல்லது மாலை',
  japa: 1,
  about:
    'மகாபாரதம், அனுசாசன பர்வத்தில் அம்புப் படுக்கையில் இருந்த பீஷ்மர் யுதிஷ்டிரருக்கு உபதேசித்த விஷ்ணுவின் ஆயிரம் நாமங்கள். பூர்வ பீடிகை, தியானம், 108 நாம ச்லோகங்கள், பலச்ருதி என்று நான்கு பகுதிகள்.',
  lines: [{ ...VSN[2].verses[1], mean: 'உலகமே அவர் வடிவம், எங்கும் நிறைந்தவர், வேள்வியின் தலைவர், கடந்த-நிகழ்-எதிர்காலங்களின் இறைவன்.' }],
  sections: VSN,
  source: 'சம்ஸ்கிருத மூலம்: மகாபாரதம், அனுசாசன பர்வம் 149 (hindu-devotional-texts, MIT உரிமம்). தமிழ், ஆங்கில எழுத்து மாற்றம்: Divine Life.',
};

export const MANTRAS: Mantra[] = [...BASE_WITHOUT_REPLACED.slice(0, 2), ...GANESHA, ...SHIVA, ...MURUGAN, ...DEVOTIONAL, ...BASE_WITHOUT_REPLACED.slice(2, 9), vishnuSahasranama, ...BASE_WITHOUT_REPLACED.slice(9)];

export type MantraGroup = { id: string; ta: string; image: ImageSourcePropType };

export const MANTRA_GROUPS: MantraGroup[] = [
  ...['ganesha', 'shiva', 'murugan', 'vishnu', 'amman', 'rama', 'hanuman', 'narasimha', 'ayyappan'].map((id) => {
    const d = getDeity(id);
    return { id, ta: d.ta, image: d.image };
  }),
  { id: 'krishna', ta: 'கிருஷ்ணர்', image: SCENES.krishnaArjuna },
  { id: 'alvar', ta: 'ஆழ்வார் அருளிச்செயல்கள்', image: SCENES.temple },
  ...[
    ['vamana', 'வாமனர்'], ['varaha', 'வராஹ மூர்த்தி'], ['guruvayur', 'குருவாயூரப்பன்'], ['venkatesha', 'வேங்கடேசப் பெருமாள்'],
    ['lakshmi', 'மகாலக்ஷ்மி'], ['durga', 'துர்க்கை'], ['saraswati', 'சரஸ்வதி'], ['kali', 'காளி'], ['bagalamukhi', 'பகளாமுகி'],
    ['lalita', 'லலிதாம்பிகை'], ['annapurna', 'அன்னபூரணி'], ['meenakshi', 'மீனாட்சி'], ['bhairava', 'காலபைரவர்'], ['dattatreya', 'தத்தாத்ரேயர்'],
  ].map(([id, ta]) => ({ id, ta, image: SCENES.temple })),
  { id: 'universal', ta: 'பொது மந்திரங்கள்', image: SCENES.temple },
];

export function groupOf(id: string): MantraGroup {
  return MANTRA_GROUPS.find((g) => g.id === id) ?? MANTRA_GROUPS[0];
}

export function getMantra(id: string | undefined): Mantra | undefined {
  return MANTRAS.find((m) => m.id === id);
}

export function mantrasFor(deity: string) {
  return MANTRAS.filter((m) => m.deity === deity);
}

/** Day-of-week suggestion, matched to the weekday deity. */
export function mantraOfTheDay(): Mantra {
  const byDay = ['rama-ramarameti', 'shiva-panchakshari', 'murugan-saravanabhava', 'ganesha-vakratunda', 'narasimha-ugram', 'amman-sarvamangala', 'hanuman-manojavam'];
  return getMantra(byDay[new Date().getDay()]) ?? MANTRAS[0];
}

export { DEITIES };
