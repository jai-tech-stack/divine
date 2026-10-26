const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const output = ts.transpileModule(fs.readFileSync('src/lib/bookRepository.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
new Function('exports', output)(exportsObject);
const { createBookRepository } = exportsObject;
const book = { id: 'sample', title: 'நூல்', sourcePages: 1, pages: [{ number: 1, text: 'தமிழ்', reviewed: false, confidence: null }] };
async function main() {
  let cached = null, downloads = 0;
  const storage = { read: async () => cached, write: async (_, text) => { cached = text; } };
  const loader = createBookRepository(storage, async () => { downloads++; return book; });
  const [first, concurrent] = await Promise.all([loader('sample', 1), loader('sample', 1)]);
  assert.equal(downloads, 1); assert.equal(first.offline, true); assert.deepEqual(first, concurrent);
  const offline = createBookRepository(storage, async () => { throw Error('No internet'); });
  assert.deepEqual((await offline('sample', 1)).book, book);
  cached = '{broken'; await loader('sample', 1); assert.equal(downloads, 2);
  const full = createBookRepository({ read: async () => null, write: async () => { throw Error('Full'); } }, async () => book);
  assert.equal((await full('sample', 1)).offline, false);
  const invalid = createBookRepository({ read: async () => null, write: async () => { throw Error('Must not write'); } }, async () => ({ ...book, pages: [] }));
  await assert.rejects(invalid('sample', 1));
  const failure = createBookRepository({ read: async () => null, write: async () => {} }, async () => { throw Error('Network'); });
  await assert.rejects(failure('sample', 1)); await assert.rejects(failure('sample', 1));
  console.log('Book cache checks passed: offline reuse, download deduplication, corrupt cache recovery, disk-full reading, invalid data rejection and retry.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
