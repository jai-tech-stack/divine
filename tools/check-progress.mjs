import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const compile = file => ts.transpileModule(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const dateModule = { exports: {} };
new Function('module', 'exports', compile('src/lib/date.ts'))(dateModule, dateModule.exports);
const today = dateModule.exports.localDateKey();
let stored = JSON.stringify({ gitaRead: ['2.1'], gitaLast: { c: 2, v: 1 }, mantraFavs: ['existing'], streakDays: [], daily: { date: '2000-01-01', read: 9, chant: 9, talk: 9 } });
let releaseLoad;
let activeWrites = 0;
let maxWrites = 0;
let completedWrites = 0;
let releaseWrites;
const flushed = new Promise(resolve => { releaseWrites = resolve; });
function runtime(deferred = false) {
  let snapshot;
  const module = { exports: {} };
  const storage = {
    getItem: () => deferred ? new Promise(resolve => { releaseLoad = () => resolve(stored); }) : Promise.resolve(stored),
    setItem: async (_key, value) => {
      activeWrites++; maxWrites = Math.max(maxWrites, activeWrites);
      await new Promise(resolve => setTimeout(resolve, 2));
      stored = value; activeWrites--;
      if (++completedWrites === 5) releaseWrites();
    },
  };
  new Function('require', 'module', 'exports', compile('src/lib/progress.ts'))(name => {
    if (name === '@react-native-async-storage/async-storage') return { __esModule: true, default: storage };
    if (name === 'react') return { useState: initial => { snapshot = initial; return [initial, value => { snapshot = value; }]; }, useEffect: fn => { fn(); } };
    if (name === './date') return dateModule.exports;
    throw Error(name);
  }, module, module.exports);
  module.exports.useProgress();
  return { ...module.exports, snapshot: () => snapshot };
}
const app = runtime(true);
const taps = [app.progress.markRead(2, 2), app.progress.chanted('test-mantra', 3), app.progress.talked(), app.progress.storyPosition('prithu', 3, 2), app.progress.bookPosition('eighteen-puranas', 108)];
releaseLoad(); await Promise.all(taps);
await flushed;
assert.equal(maxWrites, 1, 'Persist snapshots in order');
assert.deepEqual(app.snapshot().gitaRead, ['2.1', '2.2'], 'Quick taps preserve hydrated history');
assert.deepEqual(app.snapshot().mantraFavs, ['existing']);
assert.equal(app.snapshot().daily.date, today);
assert.equal(app.snapshot().daily.chant, 3);
assert.equal(app.snapshot().daily.talk, 1);
assert.deepEqual(app.wicks(app.snapshot()), { read: true, chant: true, talk: true });
const reopened = runtime();
await reopened.progress.setLast(2, 3);
assert.equal(reopened.snapshot().storyLast.scene, 3, 'Story scene survives restart');
assert.equal(reopened.snapshot().bookLast.page, 108, 'Book page survives restart');
assert.equal(reopened.snapshot().readingLast.kind, 'gita', 'The latest reading activity is tracked independently of mantra activity');
assert.equal(reopened.snapshot().gitaLast.v, 3);
assert.equal(reopened.snapshot().chantLog[0].rounds, 3);
assert.equal(app.streak(['2026-10-23', '2026-10-24'], new Date(2026, 9, 25, 8)), 2, 'Streak stays intact before first activity today');
assert.equal(app.streak(['2026-10-23'], new Date(2026, 9, 25, 8)), 0, 'A missed day ends the streak');
assert.equal(app.streak(['2026-10-24', '2026-10-25'], new Date(2026, 9, 25, 8)), 2);
const puranas = { exports: {} };
new Function('module', 'exports', compile('src/content/puranas.ts'))(puranas, puranas.exports);
const sections = puranas.exports.PURANA_SECTIONS;
const book = JSON.parse(fs.readFileSync(new URL('../src/content/bookTexts/eighteen-puranas.json', import.meta.url), 'utf8'));
assert.equal(sections.length, 18);
assert.equal(sections.filter(section => section.page).length, 17);
for (const section of sections.filter(section => section.page)) {
  const page = book.pages[section.page - 1];
  assert.equal(page.number, section.page);
  assert.match(page.text.slice(0, 400), /இப்புராணம் பற்றி/, section.title);
}
assert.equal(sections.at(-1).page, null, 'Do not invent the absent Brahmanda section');
console.log('Progress and Purana checks passed: hydration, ordered writes, daily reset, restart continuity, streaks, and 17 verified source-section links.');
