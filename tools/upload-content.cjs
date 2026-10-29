// Admin-only content importer. Credentials stay in the CLI/this process, never in the app.
/* global __dirname */
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const project = 'oojhfezpvpdfrjjdsjod';
const cache = new Map();
function load(relative) {
  let file = path.resolve(root, 'src/content', relative);
  if (!path.extname(file)) file = fs.existsSync(file + '.ts') ? file + '.ts' : path.join(file, 'index.ts');
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('deities.ts')) return { DEITIES: [], SCENES: {}, getDeity: id => ({ id, ta: id }) };
  const result = { exports: {} }; cache.set(file, result.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'exports', 'module', code)(id => load(path.relative(path.join(root, 'src/content'), path.resolve(path.dirname(file), id))), result.exports, result);
  return result.exports;
}
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rows = [];
function add(kind, id, title, document) { rows.push({ kind, id, title, document, sha256: digest(document), published: true }); }
for (const book of load('books.json')) {
  const document = load(`bookTexts/${book.id}.json`);
  if (document.id !== book.id || document.pages.length !== book.pages || document.pages.some((p, i) => p.number !== i + 1)) throw Error(`Invalid book: ${book.id}`);
  add('book', book.id, book.title, document);
}
for (const m of load('mantraLib').MANTRAS) add('mantra', m.id, m.name, m);
const gita = load('gita/index');
for (const v of load('gita/verses.json')) add('gita', `${v.c}.${v.v}`, `பகவத் கீதை ${v.c}.${v.v}`, { ...v, note: gita.getNote(v.c, v.v) ?? null });
for (const n of load('nayanmars').NAYANMARS) add('nayanmar', String(n.n), n.ta, n);
for (const p of load('puranas').PURANA_SECTIONS) add('purana', p.id, p.title, p);
if (new Set(rows.map(r => `${r.kind}/${r.id}`)).size !== rows.length) throw Error('Duplicate documents');
const manifest = rows.map(({ document, ...meta }) => ({ ...meta, bytes: Buffer.byteLength(JSON.stringify(document)) }));
fs.mkdirSync(path.join(root, 'artifacts/database-backup-2026-10-26'), { recursive: true });
fs.writeFileSync(path.join(root, 'artifacts/database-backup-2026-10-26/new-content-manifest.json'), JSON.stringify(manifest, null, 2));
if (process.argv.includes('--check')) { console.log(`Validated ${rows.length} documents: ${JSON.stringify(Object.fromEntries([...new Set(rows.map(r => r.kind))].map(k => [k, rows.filter(r => r.kind === k).length])))}`); process.exit(0); }
if (!process.argv.includes('--upload')) throw Error('Use --check or --upload');
const raw = execFileSync('npx.cmd', ['--yes', 'supabase@latest', 'projects', 'api-keys', '--project-ref', project, '--output', 'json'], { cwd: root, encoding: 'utf8', shell: true, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1024 * 1024 });
const keys = JSON.parse(raw.slice(raw.indexOf('[')));
const admin = keys.find(k => k.name === 'service_role')?.api_key;
const anon = keys.find(k => k.name === 'anon')?.api_key;
if (!admin || !anon) throw Error('CLI keys unavailable');
const origin = `https://${project}.supabase.co`;
async function main() {
  const batches = rows.filter(r => r.kind === 'book').map(r => [r]);
  const remaining = rows.filter(r => r.kind !== 'book');
  for (let i = 0; i < remaining.length; i += 100) batches.push(remaining.slice(i, i + 100));
  for (const batch of batches) {
    const response = await fetch(`${origin}/rest/v1/content_documents?on_conflict=kind,id`, { method: 'POST', headers: { apikey: admin, Authorization: `Bearer ${admin}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(batch) });
    if (!response.ok) throw Error(`Upload failed: ${batch[0].kind}/${batch[0].id}, HTTP ${response.status}`);
    console.log(`Uploaded ${batch.length} documents: ${batch[0].kind}/${batch[0].id}`);
  }
  const envPath = path.join(root, '.env.local');
  let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  for (const [name, value] of Object.entries({ EXPO_PUBLIC_SUPABASE_URL: origin, EXPO_PUBLIC_SUPABASE_ANON_KEY: anon })) {
    const pattern = new RegExp(`^${name}=.*$`, 'm');
    envText = pattern.test(envText) ? envText.replace(pattern, () => `${name}=${value}`) : `${envText.trimEnd()}\n${name}=${value}\n`;
  }
  fs.writeFileSync(envPath, envText);
  const response = await fetch(`${origin}/rest/v1/content_documents?select=kind,id,sha256`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
  if (!response.ok) throw Error(`Public read failed: ${response.status}`);
  const published = await response.json();
  const managedKinds = new Set(rows.map(row => row.kind));
  const managed = published.filter(row => managedKinds.has(row.kind));
  if (managed.length !== rows.length || rows.some(row => !managed.some(p => p.kind === row.kind && p.id === row.id && p.sha256 === row.sha256))) throw Error('Published manifest mismatch');
  const denied = await fetch(`${origin}/rest/v1/content_documents`, { method: 'POST', headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' }, body: JSON.stringify(rows[0]) });
  if (denied.ok || ![401,403].includes(denied.status)) throw Error(`Unexpected anonymous write result: ${denied.status}`);
  console.log(`Verified ${managed.length} managed documents; other published content retained; anonymous writes denied. Public app configuration saved privately.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
