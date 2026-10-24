// Writes one reading script per story to recording-scripts/<story>.txt — read it aloud, one scene at a time.
//   node tools/recording_script.mjs            (all)      node tools/recording_script.mjs kannappar
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadStories } from './_stories.mjs';

const only = process.argv[2];
const out = path.join(ROOT, 'recording-scripts');
fs.mkdirSync(out, { recursive: true });
for (const s of loadStories()) {
  if (only && s.id !== only) continue;
  const txt = [`${s.title} — ${s.subtitle}`, `Save each scene as assets/audio/story/${s.id}/<file>.m4a (or .mp3)`, ''];
  s.scenes.forEach((sc, i) => {
    txt.push(`── காட்சி ${i + 1}: ${sc.title}   →   ${sc.id}.m4a`, ...sc.lines.map((l) => l.replace(/["“”]/g, '')), '');
  });
  fs.writeFileSync(path.join(out, `${s.id}.txt`), txt.join('\n'), 'utf8');
  console.log('wrote', `${s.id}.txt`, `(${s.scenes.length} scenes)`);
}
