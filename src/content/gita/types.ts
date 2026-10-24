export type VerseNote = {
  /** speaker override shown above the verse */
  s?: string;
  /** word → Tamil meaning */
  w: [string, string][];
  /** meaning */
  m: string;
  /** explanation */
  e: string;
  /** use in daily life */
  l: string;
  /** reflection question */
  q?: string;
};

/** English meaning for a verse (own words). */
export type VerseEn = { m: string; e?: string; l?: string };

export type VerseNotes = Record<number, VerseNote>;

export type GitaVerse = {
  c: number;
  v: number;
  /** speaker line from the text (only where the speaker changes) */
  s: string | null;
  /** Devanagari */
  sa: string;
  /** Tamil script */
  ta: string;
  /** IAST (English letters) */
  en: string;
};

/** A short "this moment" scene shared by a run of verses. */
export type Moment = { from: number; to: number; text: string };
