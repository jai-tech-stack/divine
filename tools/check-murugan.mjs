import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => JSON.parse(fs.readFileSync(new URL(name, import.meta.url), 'utf8'));
const hymns = read('../src/content/murugan.json');
const expected = {
  'subrahmanya-bhujangam': 33, 'agastya-skanda-ashtakam': 8,
  'deva-kartikeya-stotram': 5, 'shakti-stuti': 1, 'shodasha-nama': 3,
  'kandar-anubhuthi': 52, 'shanmuga-kavasam': 30, 'pagai-kadithal': 10,
  'thiruppugazh-muthai': 8, 'thiruppugazh-erumayil': 4,
};
assert.equal(hymns.length, Object.keys(expected).length);
const all = ['mantras', 'ganesha', 'shiva', 'murugan'].flatMap(name => read(`../src/content/${name}.json`));
assert.equal(new Set(all.map(h => h.id)).size, all.length, 'Duplicate reader/favourite ID');
for (const hymn of hymns) {
  assert.equal(hymn.deity, 'murugan');
  assert.equal(hymn.lines.length, expected[hymn.id.replace(/^murugan-/, '')], hymn.id);
  assert.ok(hymn.aliases.length && hymn.source && hymn.references.length);
  assert.ok(hymn.practice.days && hymn.practice.steps.length >= 3);
  for (const ref of hymn.references) assert.equal(new URL(ref.url).protocol, 'https:');
  for (const verse of hymn.lines) {
    for (const key of ['ta', 'en', 'mean']) assert.ok(verse[key].trim(), `${hymn.id}: missing ${key}`);
    assert.match(verse.mean, /[\u0b80-\u0bff]/u);
    assert.doesNotMatch(verse.ta, /[\u0900-\u097f]/u);
    assert.doesNotMatch(verse.en, /[\u0900-\u097f\u0b80-\u0bff]/u);
    assert.doesNotMatch(JSON.stringify(verse), /undefined|TODO|PLACEHOLDER|�|Encoded by|COMMENTS:|<[^>]+>/u);
    if (hymn.originalLanguage === 'ta') assert.equal(verse.sa, '');
    else assert.match(verse.sa, /[\u0900-\u097f]/u);
  }
}
const get = id => hymns.find(h => h.id === `murugan-${id}`);
const anu = get('kandar-anubhuthi').lines;
assert.match(anu[0].ta, /^நெஞ்சக்/);
assert.match(anu[1].ta, /^ஆடும் பரி/);
assert.match(anu.at(-1).ta, /^உருவாய் அருவாய்/);
assert.ok(anu.every(v => v.ta.split('\n').length === 4));
assert.equal(get('kandar-anubhuthi').sections.length, 2);
assert.equal(get('kandar-anubhuthi').sections[0].verses.length, 1);
assert.equal(get('kandar-anubhuthi').sections[1].verses.length, 51);
assert.match(get('kandar-anubhuthi').sections[1].verses[0].ta, /^ஆடும் பரி/);
assert.equal(get('shanmuga-kavasam').lines.flatMap(v => v.ta.split('\n')).length, 120);
assert.match(get('shanmuga-kavasam').lines[0].ta, /^அண்டமாய்/);
assert.match(get('shanmuga-kavasam').lines.at(-1).ta, /^இனம்எனத்/);
assert.match(get('subrahmanya-bhujangam').lines.at(-1).sa, /^भुजङ्गाख्य/);
assert.match(get('agastya-skanda-ashtakam').aliases.join(' '), /Shadanana/);
assert.equal(get('thiruppugazh-erumayil').lines.flatMap(v => v.ta.split('\n')).length, 8);
console.log(`Murugan checks passed: ${hymns.length} entries, ${hymns.reduce((sum, h) => sum + h.lines.length, 0)} Tamil meanings.`);
