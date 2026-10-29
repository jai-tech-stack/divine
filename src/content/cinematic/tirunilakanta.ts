import { tirunilakanta } from '../stories/batch2';
import type { Story, Scene } from '../types';
import script from './tirunilakanta.json';
import media from './media.json';

type Media = { images?: Record<string, string>; audio?: Record<string, string> };
const assets = (media as Record<string, Media>).tirunilakanta;
export const tirunilakantaFilm: Story = {
  ...tirunilakanta,
  sourceReviewed: true,
  title: script.title,
  subtitle: script.subtitle,
  source: script.source,
  minutes: 5,
  scenes: script.scenes.map((scene, i): Scene => ({
    id: scene.id, title: scene.title, lines: scene.lines,
    backdrop: i === 2 ? 'palace-storm' : 'forest-dawn',
    particles: 'none', camera: { zoom: [1, 1.06], panX: [0, 0] },
    image: assets?.images?.[scene.art] ? { uri: assets.images[scene.art] } : undefined,
    audio: assets?.audio?.[scene.id], imageAspect: 9 / 16,
    focus: [0.5, i === 4 ? 0.45 : 0.52],
    imagePrompt: 'Original, source-based Tamil period-story illustration; cinematic natural village atmosphere.',
  })),
};
