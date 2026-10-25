import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = new Map();
let configured = false;
let sent;
let providerReply = { source: 'test', text: 'உங்கள் கவலையை அமைதியாகப் பார்க்கலாம்.' };
const ai = {
  aiConfigured: () => configured,
  askWithContext: async (q, context) => {
    sent = { q, context };
    return providerReply;
  },
};
function load(file) {
  if (!path.extname(file)) file = fs.existsSync(file + '.ts') ? file + '.ts' : path.join(file, 'index.ts');
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (name === '@/lib/ai') return ai;
    if (name === '@/lib/planets') return {};
    if (/\.(png|jpg|jpeg|webp)$/.test(name)) return 0;
    if (name.startsWith('@/')) return load(path.join(root, 'src', name.slice(2)));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    throw Error(name);
  }, module, module.exports);
  return module.exports;
}
const guide = load(path.join(root, 'src/lib/companion.ts'));
const gita = load(path.join(root, 'src/content/gita/index.ts'));
assert.match(guide.opening(null, false).text, /அன்புடன்/);
assert.equal(guide.opening(null, true).text, guide.opening(null, false).text, 'Legacy English preference must not change the interface language');
for (const q of ['மனம் கவலையாக இருக்கிறது', 'பயமாக இருக்கிறது', 'தனிமை வலிக்கிறது', 'தோல்வி அடைந்தேன்', 'கோபமாக இருக்கிறது']) {
  const reply = await guide.askGuide(q, null, [], false);
  assert.equal(reply.ref?.kind, 'gita', q);
  const n = gita.getNote(reply.ref.c, reply.ref.v);
  assert.ok(reply.text.includes(n.m), 'Keep the supplied meaning intact');
  assert.ok(reply.text.includes(n.l), 'Offer the source-linked practical step');
  assert.match(reply.text, /உங்களால் முடிந்தால்/);
  assert.doesNotMatch(reply.text, /நான் உன்னைக் காப்பேன்|என் அருளால்/);
}
const mantra = await guide.askGuide('இதன் பொருள் என்ன?', { kind: 'mantra', id: 'traditional-andal' }, [], false);
assert.equal(mantra.ref.id, 'traditional-andal');
assert.ok(mantra.text.length < 3000, 'A full collection must not flood the conversation');
assert.ok(mantra.followUp);
const general = await guide.askGuide('வணக்கம்', null, [], false);
assert.match(general.text, /அக்கறையுடன்/);
assert.equal(general.ref, undefined, 'Do not invent a scripture reference');
configured = true;
const online = await guide.askGuide('மனம் கவலையாக இருக்கிறது', null, [], false);
assert.equal(online.text, 'உங்கள் கவலையை அமைதியாகப் பார்க்கலாம்.');
assert.equal(sent.context.language, 'Tamil');
assert.ok(sent.context.relatedVerse.meaning);
assert.match(sent.context.instruction, /Never claim to literally be a deity/);
providerReply = { source: 'test', text: 'Hello, how can I help?' };
assert.equal((await guide.askGuide('மனம் கவலையாக இருக்கிறது', null, [], true)).text,
  (await guide.askGuide('மனம் கவலையாக இருக்கிறது', null, [], false)).text);
assert.match((await guide.askGuide('மனம் கவலையாக இருக்கிறது', null, [], false)).text, /இதனுடன் சிந்திக்க/);
providerReply = { source: 'test', text: 'नमस्ते' };
assert.match((await guide.askGuide('வணக்கம்', null, [], false)).text, /அக்கறையுடன்/);
providerReply = { source: 'test', text: 'அன்புடன் பேசலாம்.', followUp: 'How are you?' };
assert.equal((await guide.askGuide('வணக்கம்', null, [], false)).followUp, undefined);
// Exercise the server module with Deno and network stubbed: all providers share the new tone.
let handler;
let request;
const server = ts.transpileModule(fs.readFileSync(path.join(root, 'supabase/functions/wisdom/index.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function('Deno', 'fetch', server)(
  { env: { get: key => key === 'GEMINI_API_KEY' ? 'test-key' : undefined }, serve: fn => { handler = fn; } },
  async (_url, options) => {
    request = JSON.parse(options.body);
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ text: 'அன்புடன் பேசலாம்.' }) }] } }] });
  },
);
const response = await handler(new Request('https://example.invalid', {
  method: 'POST', body: JSON.stringify({ question: 'பயமாக இருக்கிறது', context: {} }),
}));
assert.equal((await response.json()).text, 'அன்புடன் பேசலாம்.');
assert.match(request.systemInstruction.parts[0].text, /அக்கறையுடனும் கனிவுடனும்/);
assert.match(request.systemInstruction.parts[0].text, /தெய்வமாகப் பேசும் உறுதிகளையும்/);
console.log('Companion checks passed: caring offline replies, preserved scripture references, short mantra responses, and online tone instructions.');
