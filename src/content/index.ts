import { appar } from './stories/appar';
import { BATCH2 } from './stories/batch2';
import { BATCH3 } from './stories/batch3';
import { BATCH4 } from './stories/batch4';
import { BATCH5 } from './stories/batch5';
import { BATCH6 } from './stories/batch6';
import { BATCH7 } from './stories/batch7';
import { BATCH8 } from './stories/batch8';
import { BATCH9 } from './stories/batch9';
import { BATCH10 } from './stories/batch10';
import { BATCH11 } from './stories/batch11';
import { BATCH12 } from './stories/batch12';
import { BATCH13 } from './stories/batch13';
import { prithu } from './stories/prithu';
import { sambandar } from './stories/sambandar';
import { sundarar } from './stories/sundarar';
import type { Story } from './types';
import { tirunilakantaFilm } from './cinematic/tirunilakanta';

export const stories: Story[] = [prithu, appar, sambandar, sundarar, ...BATCH2.map((story) => story.id === 'tirunilakanta' ? tirunilakantaFilm : story), ...BATCH3, ...BATCH4, ...BATCH5, ...BATCH6, ...BATCH7, ...BATCH8, ...BATCH9, ...BATCH10, ...BATCH11, ...BATCH12, ...BATCH13];

export function getStory(id: string | undefined): Story | undefined {
  return stories.find((s) => s.id === id);
}
