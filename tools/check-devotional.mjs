import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const content=read('src/content/devotional.json');
const expected={achyuta:9,shatpadi:7,narasimha:5,vamana:3,varaha:5,krishna:9,guruvayur:11,venkatesha:16,rama:9,lakshmi:11,durga:14,saraswati:9,kali:11,bagala:15,hanuman:6,datta:19,ayyappa:5,lalita:6,annapurna:12,meenakshi:5,pallandu:12};
Object.assign(expected,{andal:30,tiruppalli:10,amalan:10,kanninun:11});
assert.equal(content.length,25);
assert.equal(new Set(content.map(m=>m.id)).size,25);
for(const [key,count] of Object.entries(expected)){
 const m=content.find(m=>m.id===(key==='lakshmi'?'lakshmi-namastestu':`traditional-${key}`));
 assert.ok(m,key);assert.equal(m.lines.length,count,key);
 assert.ok(m.source&&m.references.length&&m.practice.steps.length,key);
 assert.ok(new URL(m.references[0].url).protocol==='https:');
 for(const [i,line] of m.lines.entries()){
  assert.ok(/[\u0b80-\u0bff]/u.test(line.ta)&&/[\u0b80-\u0bff]/u.test(line.mean),`${key} ${i+1}: Tamil missing`);
  assert.ok(!/[\u0900-\u097f]/u.test(line.ta),`${key}: source script leaked into reading`);
  assert.ok(!/\ufffd|<br|&nbsp;|\bvar\b/.test(line.sa+line.ta+line.mean),`${key}: transcription debris`);
  if(['pallandu','andal','tiruppalli','amalan','kanninun'].includes(key))assert.equal(line.sa,'');
  else {assert.ok(/[\u0900-\u097f]/u.test(line.sa));assert.ok(!/[a-zA-Z]/.test(line.sa),`${key}: translated prose leaked into original`);}
 }
 if(m.sections)assert.equal(m.sections.reduce((n,s)=>n+s.verses.length,0),count);
}
const all=[...read('src/content/ganesha.json'),...read('src/content/shiva.json'),...read('src/content/murugan.json'),...content];
assert.equal(new Set(all.map(m=>m.id)).size,all.length,'Duplicate collection routes');
assert.equal(content.find(m=>m.id==='traditional-kali').sections[1].verses.length,8);
assert.equal(content.find(m=>m.id==='traditional-datta').sections[1].verses.length,18);
assert.match(content.find(m=>m.id==='traditional-guruvayur').lines[10].sa,/त्वत्प्रसादाय/);
assert.match(content.find(m=>m.id==='traditional-pallandu').lines[11].ta,/விட்டுசித்தன்/);
assert.equal(content.reduce((n,m)=>n+m.lines.length,0),260);
assert.match(content.find(m=>m.id==='traditional-andal').lines[29].ta,/கோதை சொன்ன/);
assert.ok(!content.find(m=>m.id==='traditional-andal').lines[29].ta.includes('(-சொன்ன'));
// Load the real catalogue with artwork imports stubbed; verify discoverability and saved routes.
const cache=new Map();
function load(file){
 if(!path.extname(file))file=fs.existsSync(file+'.ts')?file+'.ts':path.join(file,'index.ts');
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(name=>{if(/\.(jpg|png)$/.test(name))return 0;if(!name.startsWith('.'))throw Error(name);return load(path.resolve(path.dirname(file),name));},module,module.exports);
 return module.exports;
}
const catalogue=load(fileURLToPath(new URL('../src/content/mantraLib.ts',import.meta.url)));
assert.equal(catalogue.MANTRAS.length,96);
assert.equal(new Set(catalogue.MANTRAS.map(m=>m.id)).size,96);
const groups=new Set(catalogue.MANTRA_GROUPS.map(g=>g.id));
for(const m of catalogue.MANTRAS)assert.ok(groups.has(m.deity),`Missing category ${m.deity}`);
assert.equal(catalogue.getMantra('lakshmi-namastestu').lines.length,11,'Saved Lakshmi route must open the full work');
assert.equal(catalogue.getMantra('saraswati-namastubhyam').deity,'saraswati');
assert.equal(catalogue.mantrasFor('alvar').length,5);
assert.equal(catalogue.mantrasFor('bhairava').length,2);
assert.equal(catalogue.mantrasFor('murugan').length,12);
let spoken='';
const speechModule={exports:{}};
const speechCode=ts.transpileModule(fs.readFileSync(new URL('../src/lib/chant.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('require','module','exports',speechCode)(name=>name==='expo-speech'?{speak:text=>{spoken=text;},stop:()=>{}}:{hasTamilVoice:()=>true,estimateMs:()=>1},speechModule,speechModule.exports);
const playback=speechModule.exports.chantAlong(['க³ணபதயே நமஃ ॥'],{onLine:()=>{},onDone:()=>{}});
assert.equal(spoken.trim(),'கணபதயே நமஃ','Pronunciation markers must not be spoken as numbers');playback.cancel();
console.log('Devotional checks passed: 25 sourced works, 260 Tamil meanings, complete selected works and valid source-script readings.');
