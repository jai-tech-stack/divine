import type { ImageSourcePropType } from 'react-native';

/** Which painted backdrop the scene engine draws when no artwork image is supplied. */
export type Backdrop =
  | 'forest-dawn'
  | 'palace-storm'
  | 'divine-birth'
  | 'coronation'
  | 'famine'
  | 'wrath'
  | 'cosmic-chase'
  | 'earth-speaks'
  | 'levelling'
  | 'harvest';

export type Particles = 'dust' | 'embers' | 'petals' | 'stars' | 'sparks' | 'none';

export type Camera = {
  /** start and end zoom, e.g. 1 → 1.15 for a slow push-in */
  zoom: [number, number];
  /** horizontal pan in px over the scene, positive = drift right */
  panX: [number, number];
  panY?: [number, number];
};

export type Scene = {
  id: string;
  title: string;
  /** Narration, one subtitle line per entry. */
  lines: string[];
  backdrop: Backdrop;
  particles: Particles;
  camera: Camera;
  /** Short flashes or tremors at scene start. */
  effect?: 'lightning' | 'tremor' | 'bloom';
  /** Optional AI or artist painting. When present it replaces the drawn backdrop. */
  image?: ImageSourcePropType;
  /** width ÷ height of the artwork (default 1.5) */
  imageAspect?: number;
  /** where the slow pan starts and ends across the artwork, 0 = left edge, 1 = right edge */
  focus?: [number, number];
  /** Prompt to generate the painting for this scene (kept with the data so art can be made later). */
  imagePrompt: string;
};

export type Verse = {
  ref: string;
  devanagari: string;
  tamilScript: string;
  words: { w: string; m: string }[];
  meaning: string;
  note: string;
};

export type Story = {
  id: string;
  title: string;
  subtitle: string;
  purana: string;
  source: string;
  minutes: number;
  scenes: Scene[];
  verse: Verse;
  wisdom: { heading: string; body: string }[];
  reflection: { question: string; options: string[] };
  practice: { label: string; detail: string; route: '/practice/dhyanam' | '/practice/japa'; minutes: number };
  askSuggestions: string[];
};
