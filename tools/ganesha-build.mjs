// Build static reading assets; no transliteration work is done on the phone.
// Source hymns are traditional/public-domain texts. Meanings are Divine Life's own Tamil paraphrases.
// Run: node tools/ganesha-build.mjs [ganesha|shiva|murugan]
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const consonants = {
  क: ['க', 'k'], ख: ['க²', 'kh'], ग: ['க³', 'g'], घ: ['க⁴', 'gh'], ङ: ['ங', 'ṅ'],
  च: ['ச', 'c'], छ: ['ச²', 'ch'], ज: ['ஜ', 'j'], झ: ['ஜ²', 'jh'], ञ: ['ஞ', 'ñ'],
  ट: ['ட', 'ṭ'], ठ: ['ட²', 'ṭh'], ड: ['ட³', 'ḍ'], ढ: ['ட⁴', 'ḍh'], ण: ['ண', 'ṇ'],
  त: ['த', 't'], थ: ['த²', 'th'], द: ['த³', 'd'], ध: ['த⁴', 'dh'], न: ['ந', 'n'],
  प: ['ப', 'p'], फ: ['ப²', 'ph'], ब: ['ப³', 'b'], भ: ['ப⁴', 'bh'], म: ['ம', 'm'],
  य: ['ய', 'y'], र: ['ர', 'r'], ल: ['ல', 'l'], व: ['வ', 'v'], श: ['ஶ', 'ś'], ष: ['ஷ', 'ṣ'], स: ['ஸ', 's'], ह: ['ஹ', 'h'], ळ: ['ள', 'ḷ'],
};
const marks = { 'ा': ['ா', 'ā'], 'ि': ['ி', 'i'], 'ी': ['ீ', 'ī'], 'ु': ['ு', 'u'], 'ू': ['ூ', 'ū'], 'ृ': ['்ரு', 'ṛ'], 'ॄ': ['்ரூ', 'ṝ'], 'े': ['ே', 'e'], 'ै': ['ை', 'ai'], 'ो': ['ோ', 'o'], 'ौ': ['ௌ', 'au'], '्': ['்', ''] };
const vowels = { अ: ['அ', 'a'], आ: ['ஆ', 'ā'], इ: ['இ', 'i'], ई: ['ஈ', 'ī'], उ: ['உ', 'u'], ऊ: ['ஊ', 'ū'], ऋ: ['ரு', 'ṛ'], ए: ['ஏ', 'e'], ऐ: ['ஐ', 'ai'], ओ: ['ஓ', 'o'], औ: ['ஔ', 'au'] };
const symbols = { 'ं': ['ம்', 'ṃ'], 'ः': ['ஃ', 'ḥ'], 'ँ': ['ம்', 'ṃ'], 'ऽ': ['', '’'], '।': ['|', '|'], '॥': ['||', '||'], 'ॐ': ['ஓம்', 'oṃ'] };

// Vocalic l occurs in kḷpta in Subrahmanya Bhujangam.
marks['ॢ'] = ['்லு', 'ḷ'];

function fromSanskrit(text, script) {
  const chars = [...text.normalize('NFC')];
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (consonants[c]) {
      const base = consonants[c][script];
      const next = marks[chars[i + 1]];
      // Keep Tamil vowel signs adjacent to the letter, before aspiration/voicing markers.
      const suffix = next ? next[script] : script === 0 ? '' : 'a';
      out += script === 0 ? base[0] + suffix + base.slice(1) : base + suffix;
      if (next) i++;
    } else {
      const mapped = vowels[c] ?? symbols[c];
      if (!mapped && /[\u0900-\u097f]/u.test(c)) throw new Error(`Unmapped Sanskrit character: ${c}`);
      out += mapped ? mapped[script] : c;
    }
  }
  return out;
}

const tamilConsonants = { க: 'k', ங: 'ṅ', ச: 'c', ஞ: 'ñ', ட: 'ṭ', ண: 'ṇ', த: 't', ந: 'n', ப: 'p', ம: 'm', ய: 'y', ர: 'r', ல: 'l', வ: 'v', ழ: 'ḻ', ள: 'ḷ', ற: 'ṟ', ன: 'ṉ', ஜ: 'j', ஶ: 'ś', ஷ: 'ṣ', ஸ: 's', ஹ: 'h' };
const tamilMarks = { 'ா': 'ā', 'ி': 'i', 'ீ': 'ī', 'ு': 'u', 'ூ': 'ū', 'ெ': 'e', 'ே': 'ē', 'ை': 'ai', 'ொ': 'o', 'ோ': 'ō', 'ௌ': 'au', '்': '' };
const tamilVowels = { அ: 'a', ஆ: 'ā', இ: 'i', ஈ: 'ī', உ: 'u', ஊ: 'ū', எ: 'e', ஏ: 'ē', ஐ: 'ai', ஒ: 'o', ஓ: 'ō', ஔ: 'au', ஃ: 'ḥ' };
function romanizeTamil(text) {
  const chars = [...text.normalize('NFC')];
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (tamilConsonants[c]) {
      const next = chars[i + 1];
      out += tamilConsonants[c] + (next in tamilMarks ? tamilMarks[next] : 'a');
      if (next in tamilMarks) i++;
    } else out += tamilVowels[c] ?? c;
  }
  return out;
}

const group = process.argv[2] ?? 'ganesha';
if (group === 'gita') {
  const original = JSON.parse(fs.readFileSync(new URL('tools/gita-originals.json', root), 'utf8'));
  const path = new URL('src/content/gita/verses.json', root);
  const verses = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (original.verses.length !== 701 || verses.length !== 701) throw new Error('Gita verse count changed');
  for (const verse of verses) {
    const source = original.verses.find((v) => v.c === verse.c && v.v === verse.v);
    if (!source) throw new Error(`Missing Gita ${verse.c}.${verse.v}`);
    verse.sa = source.sa;
    verse.ta = fromSanskrit(source.sa, 0).replace(/[²³⁴]/g, '');
    verse.en = fromSanskrit(source.sa, 1);
  }
  fs.writeFileSync(path, JSON.stringify(verses) + '\n');
  console.log('Rebuilt 701 Gita readings from the verified reference edition');
  process.exit(0);
}
if (!['ganesha', 'shiva', 'murugan', 'devotional'].includes(group)) throw new Error('Unknown collection');
const source = [`tools/${group}_src.json`, `tools/${group}_tamil_src.json`].flatMap((path) =>
  JSON.parse(fs.readFileSync(new URL(path, root), 'utf8')));
const result = source.map(({ verses, readingSections, ...mantra }) => {
  const lines = verses.map(([text, mean, tamilReading, latinReading]) => mantra.originalLanguage === 'ta'
    ? { sa: '', ta: text, en: romanizeTamil(text), mean }
    : { sa: text, ta: tamilReading ?? fromSanskrit(text, 0), en: latinReading ?? fromSanskrit(text, 1), mean });
  return {
    ...mantra,
    deity: group === 'devotional' ? mantra.deity : group, kind: 'shloka', japa: 1, lines,
    ...(readingSections ? { sections: readingSections.map(({ start, end, ...section }) => ({ ...section, verses: lines.slice(start, end) })) } : {}),
  };
});
const output = new URL(`src/content/${group}.json`, root);
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(`Built ${result.length} hymns: ${fileURLToPath(output)}`);
