import assert from 'node:assert/strict';
import fs from 'node:fs';
const verses=JSON.parse(fs.readFileSync(new URL('../src/content/gita/verses.json',import.meta.url)));
const counts=[47,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78];
assert.equal(verses.length,701);
for(let c=1;c<=18;c++){
  const chapter=verses.filter(v=>v.c===c);
  assert.equal(chapter.length,counts[c-1],`Chapter ${c}`);
  chapter.forEach((v,i)=>assert.equal(v.v,i+(c===13?0:1)));
}
for(const v of verses){
  assert.ok(v.sa&&v.ta&&v.en,`${v.c}.${v.v}: missing reading`);
  assert.ok(!/[\u0900-\u097f]/u.test(v.ta),'Devanagari leaked into Tamil reading');
  assert.ok(!/्[िीेैोौ]|़/u.test(v.sa),`${v.c}.${v.v}: malformed vowel or nukta`);
  assert.ok(!/ध्यायः|ब्रह्मविद्यायां|श्रीभगवानुवाच/.test(v.sa),'Chapter heading or speaker leaked into verse');
}
const get=(c,v)=>verses.find(x=>x.c===c&&x.v===v);
assert.match(get(1,26).sa,/पितॄनथ/);
assert.match(get(1,34).sa,/श्वशुराः/);
assert.match(get(5,1).sa,/सुनिश्चितम्/);
assert.match(get(17,23).sa,/ॐ/);
assert.match(get(17,23).ta,/ஓம்/);
assert.match(get(17,25).sa,/मोक्षकाङ्क्षिभिः/);
assert.match(get(18,68).sa,/भक्तिं/);
console.log('Gita checks passed: 18 chapters and 701 verses in the selected source edition; chapter 13 verse labels are mapped for the app. Tamil readings and spelling regressions checked.');
