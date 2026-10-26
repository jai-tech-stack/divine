// Native text import integrity; source PDFs must never be packaged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = name => JSON.parse(fs.readFileSync(new URL(name, root), 'utf8'));
const books = read('src/content/books.json');
assert.equal(books.length, 10);
assert.equal(new Set(books.map(book => book.id)).size, 10);
let pageCount = 0, textPages = 0, characters = 0;
for (const book of books) {
  assert.ok(!fs.existsSync(new URL(`assets/books/${book.id}.pdf`, root)), 'Do not bundle PDFs');
  assert.ok(fs.existsSync(new URL(`assets/books/${book.id}.jpg`, root)), 'Missing cover');
  const text = read(`src/content/bookTexts/${book.id}.json`);
  assert.equal(text.id, book.id);
  assert.equal(text.sourcePages, book.pages);
  assert.equal(text.pages.length, book.pages, `${book.id}: import incomplete`);
  assert.ok(['local-ocr', 'embedded-text'].includes(text.method));
  assert.notEqual(text.reviewStatus, 'importing', 'Pending import must not be reported complete');
  for (const [index, page] of text.pages.entries()) {
    assert.equal(page.number, index + 1);
    assert.equal(typeof page.text, 'string');
    assert.equal(typeof page.reviewed, 'boolean');
    assert.ok(page.confidence === null || (Number.isFinite(page.confidence) && page.confidence >= 0 && page.confidence <= 100));
    pageCount++;
    if (page.text.trim()) textPages++;
    characters += page.text.length;
  }
}
assert.equal(pageCount, 3214);
const loaders = fs.readFileSync(new URL('src/content/books.ts', root), 'utf8');
assert.doesNotMatch(loaders, /require\([^)]*\.pdf/);
assert.doesNotMatch(loaders, /import\([^)]*bookTexts|require\([^)]*bookTexts/, 'Do not bundle large book texts');
const pkg = read('package.json');
assert.ok(!pkg.dependencies['expo-sharing'], 'Removed PDF feature must not leave its dependency');
console.log(`Text-book checks passed: 10 books, ${pageCount} source pages, ${textPages} pages with extracted text, ${characters.toLocaleString()} characters; no PDF assets.`);
