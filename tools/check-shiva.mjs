// Run after: node tools/ganesha-build.mjs shiva
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const hymns=read('../src/content/shiva.json');
const expected={
 'kalabhairavashtakam':9,'shadakshara-stotram':7,'bhairava-aarti':7,
 'tandava-stotram':17,'panchakshara-stotram':6,'pancharatnam':6,
 'ashtakam':9,'lingashtakam':9,'bilvashtakam':9,'ardhanarishvara':9,
 'dakshinamurti':10,'mangalashtakam':9,'dvadasha-jyotirlinga':13,
 'uma-maheshvara':13,'kashi-vishvanathashtakam':10,'mallikarjuna-mangalashasanam':6,
 'vasishtha-daridrya-dahana':9,'deva-danava-stotram':13,
 'sivapuranam':19,'thevaram-sambandar':1,'thevaram-appar':1,'thevaram-sundarar':1,
 'thirumoolar-selected':2,'sivavakkiyar-selected':3,
};
assert.equal(hymns.length,Object.keys(expected).length);
const all=[...read('../src/content/mantras.json'),...read('../src/content/ganesha.json'),...hymns];
assert.equal(new Set(all.map(h=>h.id)).size,all.length,'Duplicate routes/favourites');
for(const h of hymns){
 assert.equal(h.deity,'shiva');
 assert.equal(h.japa,1);
 assert.equal(h.lines.length,expected[h.id.replace(/^shiva-/, '')],h.id);
 assert.ok(h.aliases.length&&h.source&&h.practice.days&&h.practice.steps.length>=3);
 assert.ok(h.references.length);
 for(const ref of h.references)assert.equal(new URL(ref.url).protocol,'https:');
 for(const v of h.lines){
  for(const key of ['ta','en','mean'])assert.ok(v[key].trim(),`${h.id}: missing ${key}`);
  assert.match(v.mean,/[\u0b80-\u0bff]/u);
  assert.doesNotMatch(v.ta,/[\u0900-\u097f]/u);
  assert.doesNotMatch(v.en,/[\u0900-\u097f\u0b80-\u0bff]/u);
  assert.doesNotMatch(JSON.stringify(v),/undefined|TODO|PLACEHOLDER|�|<[^>]+>|Encoded by|Proofread|(?<!\p{L})var(?!\p{L})/u);
  if(h.originalLanguage==='ta')assert.equal(v.sa,'');
  else assert.match(v.sa,/[\u0900-\u097f]/u);
 }
}
const get=id=>hymns.find(h=>h.id==='shiva-'+id);
const siva=get('sivapuranam').lines.flatMap(v=>v.ta.split('\n'));
assert.equal(siva.length,95);
assert.match(siva[0],/^நமச்சிவாய/);
assert.match(siva.at(-1),/^பல்லோரும் ஏத்தப் பணிந்து/);
assert.doesNotMatch(siva.join('\n'),/[0-9]/);
assert.match(get('panchakshara-stotram').lines[0].sa,/^नागेन्द्रहाराय/);
assert.match(get('pancharatnam').lines[0].sa,/^मत्तसिन्धुर/);
assert.equal(get('bhairava-aarti').originalLanguage,'hi');
assert.match(get('bhairava-aarti').lines[0].sa,/^जय भैरव देवा/);
for(const id of ['thevaram-sambandar','thevaram-appar','thevaram-sundarar'])assert.match(get(id).about,/முழுப் பதிகம் அல்ல/);
console.log(`Shiva content checks passed: ${hymns.length} entries, ${hymns.reduce((n,h)=>n+h.lines.length,0)} meanings, all 95 Sivapuranam lines.`);
