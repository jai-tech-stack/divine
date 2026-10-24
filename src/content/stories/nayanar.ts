import type { Backdrop, Particles, Scene } from '../types';

/** Short builder so a Nayanar's story stays readable: id, title, backdrop, lines, art prompt. */
const CAMS: Scene['camera'][] = [
  { zoom: [1.1, 1.0], panX: [-16, 10] },
  { zoom: [1.0, 1.12], panX: [0, 0], panY: [0, -10] },
  { zoom: [1.14, 1.02], panX: [8, -8] },
  { zoom: [1.0, 1.08], panX: [14, -14] },
];

let n = 0;
export function sc(id: string, title: string, backdrop: Backdrop, lines: string[], imagePrompt: string, particles: Particles = 'dust', extra: Partial<Scene> = {}): Scene {
  return { id, title, backdrop, particles, camera: CAMS[n++ % CAMS.length], lines, imagePrompt, ...extra };
}

export const ART_STYLE =
  'Cinematic devotional digital painting of a Tamil Shaiva saint story, 3:2 landscape, rich glowing light, painterly but realistic, Chola-era temple architecture, no text or logo, lower third calm and dark for subtitles. ';
