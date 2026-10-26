import fs from 'node:fs';
import assert from 'node:assert/strict';
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => line.includes('=')).map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]));
const origin = env.EXPO_PUBLIC_SUPABASE_URL;
assert.equal(origin, 'https://oojhfezpvpdfrjjdsjod.supabase.co');
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const books = JSON.parse(fs.readFileSync('src/content/books.json', 'utf8'));
let pages = 0;
for (const book of books) {
  const response = await fetch(`${origin}/rest/v1/content_documents?kind=eq.book&id=eq.${encodeURIComponent(book.id)}&select=document`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  assert.equal(response.status, 200);
  const rows = await response.json();
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].document, JSON.parse(fs.readFileSync(`src/content/bookTexts/${book.id}.json`, 'utf8')));
  pages += rows[0].document.pages.length;
}
assert.equal(pages, 3214);
console.log(`Verified all ${books.length} remote books, ${pages} pages: exact match with local originals.`);
