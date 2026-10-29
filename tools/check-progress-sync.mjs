import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compile = name => ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const modules = new Map();
const disk = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name).exports;
  const module = { exports: {} }; modules.set(name, module);
  new Function('require', 'module', 'exports', compile(name))(id => {
    if (id === 'react') return {};
    if (id === '@react-native-async-storage/async-storage') return { __esModule: true, default: {
      getItem: async key => disk.get(key) ?? null,
      setItem: async (key, value) => { await new Promise(r => setTimeout(r, 1)); disk.set(key, value); },
    } };
    if (id.startsWith('./')) return load(id.slice(2));
    throw Error(id);
  }, module, module.exports);
  return module.exports;
}
const { emptyProgress, progressStore, progress } = load('progress');
const { stampProgress, mergeProgress, isProgressDocument } = load('progressMerge');
const { authReturnCode } = load('authLinks');
assert.equal(authReturnCode('divinelife://account?code=one-time-code'), 'one-time-code');
assert.equal(authReturnCode('https://example.com/account?code=untrusted'), null);
assert.equal(authReturnCode('divinelife://other?code=untrusted'), null);
assert.equal(authReturnCode('divinelife://account/other?code=untrusted'), null);
assert.equal(authReturnCode('divinelife://account?code='), null);
const left = stampProgress({ ...emptyProgress(), gitaRead: ['2.1'], gitaSaved: ['2.1'], bookLast: { id: 'book', page: 8 }, daily: { date: '2026-10-26', read: 1, chant: 3, talk: 0 }, chantLog: [{ id: 'om', date: '2026-10-26', rounds: 3 }] }, null, 'phone-a', 10);
const right = stampProgress({ ...emptyProgress(), gitaRead: ['3.2'], gitaSaved: [], gitaLast: { c: 3, v: 2 }, daily: { date: '2026-10-26', read: 2, chant: 2, talk: 1 }, chantLog: [{ id: 'om', date: '2026-10-26', rounds: 2 }] }, null, 'phone-b', 20);
const merged = mergeProgress(left, right);
assert.deepEqual(merged, mergeProgress(right, left), 'Merge must be independent of device order');
assert.deepEqual(mergeProgress(merged, merged), merged, 'Repeated sync must not inflate progress');
assert.deepEqual(merged.values.gitaRead, ['2.1', '3.2']);
assert.deepEqual(merged.values.gitaSaved, [], 'Removing a bookmark must survive an older device reconnecting');
assert.equal(merged.values.daily.chant, 3);
assert.equal(merged.values.chantLog[0].rounds, 3);
assert.equal(merged.values.gitaLast.v, 2);
assert.equal(isProgressDocument(merged), true);
assert.equal(isProgressDocument({ ...merged, values: { ...merged.values, daily: { date: 'x', chant: 'wrong' } } }), false);
assert.equal(isProgressDocument({ ...merged, values: { ...merged.values, bookLast: { id: 'x', page: -1 } } }), false);

await progress.markRead(2, 1);
await progressStore.selectUser('account-a');
assert.deepEqual(progressStore.get().gitaRead, [], 'Guest activity must require explicit import');
await progress.markRead(3, 2);
await progressStore.selectUser('account-b');
assert.deepEqual(progressStore.get().gitaRead, [], 'Account B must not inherit account A data');
await progress.bookPosition('book-b', 22);
await progressStore.selectUser('account-a');
assert.deepEqual(progressStore.get().gitaRead, ['3.2']);
assert.equal(progressStore.get().bookLast, null);
await progressStore.selectUser(null);
assert.deepEqual(progressStore.get().gitaRead, ['2.1'], 'Signing out restores guest data, not another account');
assert.deepEqual((await progressStore.guest()).gitaRead, ['2.1']);
console.log('Progress sync: merge, bookmark removal, counter idempotence, validation and account isolation passed.');
