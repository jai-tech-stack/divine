import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync('src/lib/tamilSpeech.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function harness(fetch) {
  let listener;
  const counts = { played: 0, removed: 0, disposed: 0, fallback: 0 };
  const speech = { stop: async () => {}, getAvailableVoicesAsync: async () => [{ language: 'ta-IN', identifier: 'tamil' }],
    VoiceQuality: { Enhanced: 'enhanced' }, speak: (_text, options) => { counts.fallback++; options.onDone?.(); } };
  const modules = {
    'expo-speech': speech,
    'expo-audio': { createAudioPlayer: () => ({ addListener: (_name, cb) => { listener = cb; return { remove() {} }; },
      play: () => counts.played++, remove: () => counts.removed++ }) },
    './voiceAudio': { voiceAudio: async () => ({ uri: 'private-cache.wav', dispose: () => counts.disposed++ }) },
  };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'fetch', 'process', code)(name => modules[name], module, module.exports, fetch,
    { env: { EXPO_PUBLIC_SUPABASE_URL: 'https://example.invalid', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'public' } });
  return { ...module.exports, counts, finish: () => listener({ didJustFinish: true }) };
}
const wav = () => new Response(new Uint8Array(44), { headers: { 'Content-Type': 'audio/wav' } });
const ok = harness(async () => wav());
let completed = 0;
await ok.speakTamil('வணக்கம்', { onDone: () => completed++ });
assert.equal(ok.counts.played, 1);
ok.finish();
assert.deepEqual(ok.counts, { played: 1, removed: 1, disposed: 1, fallback: 0 });
assert.equal(completed, 1);

let resolve;
const cancelled = harness(() => new Promise(r => { resolve = r; }));
let stopped = 0;
const pending = cancelled.speakTamil('வணக்கம்', { onStopped: () => stopped++ });
await new Promise(r => setImmediate(r));
await cancelled.stopTamilSpeech();
resolve(wav());
await pending;
assert.equal(cancelled.counts.played, 0, 'Cancelled request must never start delayed playback');
assert.equal(cancelled.counts.fallback, 0, 'Cancelled request must not start device speech');
assert.equal(stopped, 1);

const limited = harness(async () => new Response(null, { status: 429 }));
await limited.speakTamil('வணக்கம்');
assert.equal(limited.counts.fallback, 1, 'Quota exhaustion must fall back to the installed Tamil voice');
const active = harness(async () => wav());
let activeStopped = 0;
await active.speakTamil('வணக்கம்', { onStopped: () => activeStopped++ });
await active.stopTamilSpeech();
assert.equal(activeStopped, 1);
assert.equal(active.counts.removed, 1);
assert.equal(active.counts.disposed, 1);
console.log('Tamil voice: playback, completion, cancellation, cleanup and quota fallback passed.');
