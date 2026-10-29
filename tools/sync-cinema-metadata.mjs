// Synchronize the published episode's text/source metadata with its reviewed local source.
// Existing media URLs and all other Supabase documents are preserved.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';

const project = 'oojhfezpvpdfrjjdsjod';
const env = parseEnv(fs.readFileSync('.env.local', 'utf8'));
const origin = env.EXPO_PUBLIC_SUPABASE_URL;
assert.equal(new URL(origin).hostname, `${project}.supabase.co`);
const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const local = JSON.parse(fs.readFileSync('src/content/cinematic/tirunilakanta.json', 'utf8'));
const query = `kind=eq.cinema&id=eq.${encodeURIComponent(local.id)}&select=kind,id,title,document,published,sha256`;
const publicRead = () => fetch(`${origin}/rest/v1/content_documents?${query}`, { headers: { apikey: anon }, signal: AbortSignal.timeout(15000) });

const beforeResponse = await publicRead();
assert.equal(beforeResponse.status, 200, `Public read failed: ${beforeResponse.status}`);
const beforeRows = await beforeResponse.json();
assert.equal(beforeRows.length, 1, 'Expected exactly one existing published episode; no insert/delete will be attempted');
const before = beforeRows[0];
assert.equal(before.published, true, 'Episode is not published; refusing to change publication state');
assert.equal(before.document.id, local.id);
assert.ok(before.document.media, 'Existing media URLs missing; refusing to replace document');

// Preserve media and any non-story fields while synchronizing only reviewed story metadata.
const document = { ...before.document, ...local, media: before.document.media };
const sha256 = crypto.createHash('sha256').update(JSON.stringify(document)).digest('hex');
const raw = execFileSync('npx.cmd', ['--yes', 'supabase', 'projects', 'api-keys', '--project-ref', project, '--output', 'json'], {
  shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1024 * 1024,
});
const keys = JSON.parse(raw.slice(raw.indexOf('[')));
const service = keys.find((key) => key.name === 'service_role')?.api_key;
assert.ok(service, 'Supabase publishing credential unavailable');

const update = await fetch(`${origin}/rest/v1/content_documents?kind=eq.cinema&id=eq.${encodeURIComponent(local.id)}`, {
  method: 'PATCH',
  headers: {
    apikey: service,
    Authorization: `Bearer ${service}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({ title: local.title, document, sha256 }),
});
assert.equal(update.status, 200, `Targeted episode metadata update failed: ${update.status}`);
const updatedRows = await update.json();
assert.equal(updatedRows.length, 1, 'Expected to update exactly the existing episode');

const afterResponse = await publicRead();
assert.equal(afterResponse.status, 200, `Post-update public read failed: ${afterResponse.status}`);
const afterRows = await afterResponse.json();
assert.equal(afterRows.length, 1);
assert.deepEqual(afterRows[0].document.scenes, local.scenes);
assert.deepEqual(afterRows[0].document.media, before.document.media);
assert.equal(afterRows[0].sha256, sha256);
console.log('Published Tirunilakanta narration now matches the reviewed local story; existing media and all other records were preserved.');
