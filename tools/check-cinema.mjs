import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import ts from 'typescript';
const cache = new Map();
function load(file) {
  if (!path.extname(file)) file = fs.existsSync(`${file}.ts`) ? `${file}.ts` : path.join(file, 'index.ts');
  if (file.endsWith('artwork.ts')) return { ART: new Proxy({}, { get: () => 0 }) };
  if (file.endsWith('media.json')) return { tirunilakanta: { images: new Proxy({}, { get: (_, key) => 'https://oojhfezpvpdfrjjdsjod.supabase.co/storage/v1/object/public/cinema-media/tirunilakanta/v1/' + String(key) + '.webp' }), audio: new Proxy({}, { get: (_, key) => 'https://oojhfezpvpdfrjjdsjod.supabase.co/storage/v1/object/public/cinema-media/tirunilakanta/v1/' + String(key) + '.m4a' }) } };
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', code)(id => load(id.startsWith('@/') ? path.resolve('src', id.slice(2)) : path.resolve(path.dirname(file), id)), module, module.exports);
  return module.exports;
}
const { getStory } = load(path.resolve('src/content/index.ts'));
const { storiesForBook } = load(path.resolve('src/content/journeys.ts'));
const story = getStory('tirunilakanta');
assert.equal(story.scenes.length, 5);
assert.equal(new Set(story.scenes.map(scene => scene.id)).size, 5);
assert.match(story.source, /PDF பக்கங்கள் 10–12 \(அச்சுப் பக்கங்கள் 5–7\)/);
for (const scene of story.scenes) {
  assert.ok(scene.image && typeof scene.image.uri === 'string');
  assert.equal(scene.imageAspect, 9 / 16);
  assert.match(scene.audio, /^https:\/\/oojhfezpvpdfrjjdsjod\.supabase\.co\/storage\/v1\/object\/public\/cinema-media\//);
  assert.ok(scene.lines.length >= 3);
  assert.ok(scene.lines.join(' ').length <= 2000);
  assert.ok(scene.lines.every(line => !/[A-Za-z\u0900-\u097F]/.test(line)));
}
assert.ok(storiesForBook('nayanmar-stories').some(item => item.id === story.id));
assert.ok(!storiesForBook('eighteen-puranas').some(item => item.id === story.id));
assert.equal(storiesForBook('bogar-7000-3').length, 0, 'Do not invent a narrative adaptation for an unfinished source');
if (!process.argv.includes('--offline')) {
  const env = parseEnv(fs.readFileSync('.env.local', 'utf8'));
  const result = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/content_documents?kind=eq.cinema&id=eq.tirunilakanta&select=document`, { headers: { apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY }, signal: AbortSignal.timeout(15000) });
  assert.equal(result.status, 200);
  const rows = await result.json();
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].document.scenes.map(item => item.lines), story.scenes.map(item => item.lines));
}
console.log(`Cinema checks passed: five complete Tamil scenes, source citation and catalog separation${process.argv.includes('--offline') ? ' (live Supabase check skipped)' : ', plus published metadata'}.`);
