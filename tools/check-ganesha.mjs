// Content integrity checks for the requested Vinayagar collection.
// Run: node tools/check-ganesha.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const hymns = read('../src/content/ganesha.json');
const existing = read('../src/content/mantras.json');
const expected = {
  'ganesha-mangalashtakam': 9, // eight hymns + closing verse
  'ganesha-sankata-nashana': 8,
  'ganesha-shodasha-nama': 3,
  'ganesha-runa-vimochana': 9,
  'ganesha-pancharatnam': 6, // five hymns + phalashruti
  'ganesha-santana': 6,
  'ganesha-siddhi-vinayaka': 8,
  'ganesha-ashtottara-stotram': 17,
  'ganesha-vinayagar-agaval': 36, // 72 original lines, grouped in pairs
  'ganesha-aindhu-karathanai': 1,
  'ganesha-kariya-siddhi-malai': 10, // eight songs + two closing verses
  'ganesha-kaithala-niraikani': 8,
  'ganesha-paalum-thelithenum': 1,
};

assert.equal(hymns.length, Object.keys(expected).length);
const ids = [...existing, ...hymns].map((m) => m.id);
assert.equal(new Set(ids).size, ids.length, 'IDs must not overwrite existing favourites or routes');
for (const hymn of hymns) {
  assert.equal(hymn.lines.length, expected[hymn.id], `${hymn.id}: incomplete text`);
  assert.equal(hymn.deity, 'ganesha');
  assert.equal(hymn.japa, 1);
  assert.ok(hymn.practice.days.trim() && hymn.practice.steps.length >= 3);
  assert.ok(hymn.aliases.length && hymn.source && hymn.references.length);
  for (const reference of hymn.references) assert.equal(new URL(reference.url).protocol, 'https:');
  for (const verse of hymn.lines) {
    assert.ok(verse.ta.trim() && verse.en.trim() && verse.mean.trim(), `${hymn.id}: missing reading or meaning`);
    assert.match(verse.mean, /[\u0b80-\u0bff]/u);
    assert.doesNotMatch(verse.ta, /[\u0900-\u097f]/u, 'Tamil reading must not retain unmapped Sanskrit');
    assert.doesNotMatch(verse.en, /[\u0900-\u097f\u0b80-\u0bff]/u, 'Romanization must use Latin characters');
    assert.doesNotMatch(verse.ta + verse.en + verse.mean, /undefined|TODO|PLACEHOLDER|�/u);
    if (hymn.originalLanguage !== 'ta') assert.match(verse.sa, /[\u0900-\u097f]/u);
  }
}
const agaval = hymns.find((m) => m.id === 'ganesha-vinayagar-agaval');
assert.equal(agaval.id, 'ganesha-vinayagar-agaval');
assert.equal(agaval.lines.flatMap((line) => line.ta.split('\n')).length, 72);
assert.ok(agaval.lines.every((line) => line.sa === ''), 'Do not invent a Sanskrit original for Agaval');
assert.match(agaval.lines[0].ta, /^சீதக் களபச்/);
assert.match(agaval.lines.at(-1).ta, /வித்தக விநாயக விரைகழல் சரணே$/);
assert.match(hymns.find((m) => m.id === 'ganesha-shodasha-nama').lines[0].sa, /^सुमुख/);
assert.match(hymns.find((m) => m.id === 'ganesha-ashtottara-stotram').lines[0].sa, /^विनायको/);
for (const hymn of hymns.filter((m) => m.originalLanguage === 'ta')) {
  assert.ok(hymn.lines.every((line) => line.sa === ''), `${hymn.id}: do not invent a Sanskrit original`);
}
assert.match(hymns.find((m) => m.id === 'ganesha-paalum-thelithenum').source, /நல்வழி/);
assert.match(hymns.find((m) => m.id === 'ganesha-kaithala-niraikani').lines[1].ta, /^கற்றிடும்/);
assert.match(hymns.find((m) => m.id === 'ganesha-kariya-siddhi-malai').lines[0].ta, /^பந்தம் அகற்றும்/);
const total = hymns.reduce((sum, hymn) => sum + hymn.lines.length, 0);
console.log(`Content checks passed: ${hymns.length} complete hymns, ${total} Tamil meanings, 72 Agaval lines, unique routes and valid reference URLs.`);
