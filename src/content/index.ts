import { appar } from './stories/appar';
import { BATCH2 } from './stories/batch2';
import { BATCH3 } from './stories/batch3';
import { BATCH4 } from './stories/batch4';
import { prithu } from './stories/prithu';
import { sambandar } from './stories/sambandar';
import { sundarar } from './stories/sundarar';
import type { Story } from './types';

export const stories: Story[] = [prithu, appar, sambandar, sundarar, ...BATCH2, ...BATCH3, ...BATCH4];

export function getStory(id: string | undefined): Story | undefined {
  return stories.find((s) => s.id === id);
}
