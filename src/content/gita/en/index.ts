import type { VerseEn } from '../types';
import { EN1 } from './ch01';
import { EN2 } from './ch02';
import { EN3 } from './ch03';
import { EN4 } from './ch04';
import { EN5 } from './ch05';
import { EN6 } from './ch06';
import { EN7 } from './ch07';
import { EN8 } from './ch08';
import { EN9 } from './ch09';
import { EN10 } from './ch10';
import { EN11 } from './ch11';
import { EN12 } from './ch12';
import { EN13 } from './ch13';
import { EN14 } from './ch14';
import { EN15 } from './ch15';
import { EN16 } from './ch16';
import { EN17 } from './ch17';
import { EN18 } from './ch18';

export const EN: Record<number, Record<number, VerseEn>> = {
  1: EN1,
  2: EN2,
  3: EN3,
  4: EN4,
  5: EN5,
  6: EN6,
  7: EN7,
  8: EN8,
  9: EN9,
  10: EN10,
  11: EN11,
  12: EN12,
  13: EN13,
  14: EN14,
  15: EN15,
  16: EN16,
  17: EN17,
  18: EN18,
};
