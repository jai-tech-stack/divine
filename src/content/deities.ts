import type { ImageSourcePropType } from 'react-native';

export type Deity = {
  id: string;
  ta: string;
  en: string;
  image: ImageSourcePropType;
  /** Mantra used by the Japa screen when this deity is chosen. */
  mantra: { ta: string; en: string };
  /** Where the face sits in the 2:3 painting, so screens can crop without cutting it. */
  focusY: number;
  /** Iconography fixes still wanted for this artwork (shown to reviewers, not to users). */
  artNote?: string;
};

export const DEITIES: Deity[] = [
  { id: 'shiva', ta: 'சிவன்', en: 'Shiva', image: require('@/assets/deities/shiva.jpg'), mantra: { ta: 'ஓம் நமசிவாய', en: 'Om Namah Shivaya' }, focusY: 0.2, artNote: 'Leopard spots on the skin; tradition shows tiger skin.' },
  { id: 'murugan', ta: 'முருகன்', en: 'Murugan', image: require('@/assets/deities/murugan.jpg'), mantra: { ta: 'ஓம் சரவணபவ', en: 'Om Saravanabhava' }, focusY: 0.2, artNote: 'Remove the peacock feather from the crown (a Krishna mark).' },
  { id: 'ganesha', ta: 'விநாயகர்', en: 'Vinayagar', image: require('@/assets/deities/ganesha.jpg'), mantra: { ta: 'ஓம் கம் கணபதயே நமஹ', en: 'Om Gam Ganapataye Namah' }, focusY: 0.2 },
  { id: 'vishnu', ta: 'விஷ்ணு', en: 'Vishnu', image: require('@/assets/deities/vishnu.jpg'), mantra: { ta: 'ஓம் நமோ நாராயணாய', en: 'Om Namo Narayanaya' }, focusY: 0.2, artNote: 'Remove the peacock feather from the crown (a Krishna mark).' },
  { id: 'amman', ta: 'அம்மன்', en: 'Amman', image: require('@/assets/deities/amman.jpg'), mantra: { ta: 'ஓம் சக்தி', en: 'Om Shakti' }, focusY: 0.18, artNote: 'Two-armed form: label as Amman/Parvati, or regenerate an eight-armed Durga.' },
  { id: 'rama', ta: 'ராமர்', en: 'Rama', image: require('@/assets/deities/rama.jpg'), mantra: { ta: 'ஸ்ரீ ராம ஜெயம்', en: 'Sri Rama Jayam' }, focusY: 0.15 },
  { id: 'hanuman', ta: 'ஆஞ்சநேயர்', en: 'Hanuman', image: require('@/assets/deities/hanuman.jpg'), mantra: { ta: 'ஓம் ஆஞ்சநேயாய நமஹ', en: 'Om Anjaneyaya Namah' }, focusY: 0.18 },
  { id: 'ayyappan', ta: 'ஐயப்பன்', en: 'Ayyappan', image: require('@/assets/deities/ayyappan.jpg'), mantra: { ta: 'சுவாமியே சரணம் ஐயப்பா', en: 'Swamiye Saranam Ayyappa' }, focusY: 0.2, artNote: 'Sabarimala form shows chin mudra in the right hand, not abhaya.' },
  { id: 'narasimha', ta: 'லக்ஷ்மி நரசிம்மர்', en: 'Lakshmi Narasimha', image: require('@/assets/deities/narasimha.jpg'), mantra: { ta: 'ஓம் நமோ நாராயணாய', en: 'Om Namo Narayanaya' }, focusY: 0.18 },
  { id: 'brahma', ta: 'பிரம்மா', en: 'Brahma', image: require('@/assets/deities/brahma.jpg'), mantra: { ta: 'ஓம் நமசிவாய', en: 'Om Namah Shivaya' }, focusY: 0.18 },
];

/** Editable defaults for "follow the weekday" mode (0 = Sunday). */
export const WEEKDAY_DEITY: string[] = ['rama', 'shiva', 'murugan', 'ganesha', 'narasimha', 'amman', 'hanuman'];

export const SCENES = {
  temple: require('@/assets/deities/temple.jpg') as ImageSourcePropType,
  library: require('@/assets/deities/library.jpg') as ImageSourcePropType,
  shivaNandi: require('@/assets/deities/shiva-nandi.jpg') as ImageSourcePropType,
  krishnaArjuna: require('@/assets/deities/krishna-arjuna.jpg') as ImageSourcePropType,
  vishwaroopa: require('@/assets/deities/vishwaroopa.jpg') as ImageSourcePropType,
};

export function getDeity(id: string | undefined): Deity {
  return DEITIES.find((d) => d.id === id) ?? DEITIES[0];
}

export function deityForToday(choice: string | 'weekday') {
  return getDeity(choice === 'weekday' ? WEEKDAY_DEITY[new Date().getDay()] : choice);
}
