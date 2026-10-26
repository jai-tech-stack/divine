// Optional live integration check: consumes one normal assistant request.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .filter(line => !line.trim().startsWith('#') && line.includes('='))
  .map(line => { const index = line.indexOf('='); return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
const origin = env.EXPO_PUBLIC_SUPABASE_URL;
assert.equal(origin, 'https://oojhfezpvpdfrjjdsjod.supabase.co');
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(key, 'Public app key is missing');
const response = await fetch(`${origin}/functions/v1/wisdom`, {
  method: 'POST', signal: AbortSignal.timeout(55000),
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'எந்த வேலையை முதலில் செய்வது என்று குழப்பமாக இருக்கிறது. ஒரே ஒரு நடைமுறை வழி சொல்லுங்கள்.', context: { deity: 'murugan', language: 'Tamil', recent: [] } }),
});
const result = await response.json();
if (!response.ok) {
  console.error(JSON.stringify({ status: response.status, unavailable: result.unavailable }));
  process.exit(1);
}
assert.ok(['gemini', 'groq'].includes(result.source));
for (const text of [result.text, ...(result.followUp ? [result.followUp] : [])]) {
  assert.equal(typeof text, 'string');
  assert.match(text, /[\u0B80-\u0BFF]/u);
  assert.doesNotMatch(text, /[a-zA-Z\u0900-\u097F]/u);
}
console.log(`Live assistant check passed: ${result.source}, Tamil-only reply.`);
if (process.argv.includes('--show-answer')) console.log(result.text);
