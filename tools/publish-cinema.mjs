// Publish only our original story art and source-based Tamil narration. No user recordings.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const env = parseEnv(fs.readFileSync('.env.local', 'utf8'));
const script = JSON.parse(fs.readFileSync('src/content/cinematic/tirunilakanta.json', 'utf8'));
const output = '.expo/cinema-media'; fs.mkdirSync(output, { recursive: true });
const binaries = '.expo/media-runtime/imageio_ffmpeg/binaries';
const executables = fs.readdirSync(binaries).filter(name => name.endsWith('.exe'));
if (executables.length !== 1) throw Error('Expected the project media encoder');
const ffmpeg = path.resolve(binaries, executables[0]);
const encode = args => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const media = { images: {}, audio: {} };
const files = [];
for (const name of ['statue', 'potter', 'guest', 'pond']) {
  const target = `assets/cinema/tirunilakanta/${name}.webp`;
  encode(['-i', `assets/cinema/tirunilakanta/${name}.png`, '-vf', 'scale=720:-2', '-c:v', 'libwebp', '-quality', '78', target]);
  files.push({ kind: 'images', id: name, path: target, type: 'image/webp' });
}
for (const scene of script.scenes) {
  const text = scene.lines.join(' ');
  if (text.length > 2000 || !text.trim()) throw Error('Scene exceeds bounded narration input');
  const fingerprint = hash(text).slice(0, 16);
  const wav = `${output}/${scene.id}-${fingerprint}.wav`;
  const target = `${output}/${scene.id}-${fingerprint}.m4a`;
  if (!fs.existsSync(target)) {
    if (!fs.existsSync(wav)) {
      const response = await fetch(`${env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/tamil-voice`, {
        method: 'POST', signal: AbortSignal.timeout(35000),
        headers: { apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: 'narration' }),
      });
      if (!response.ok) throw Error(`Narration unavailable for ${scene.id}: HTTP ${response.status}; no quota bypass`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.subarray(0, 4).toString() !== 'RIFF' || bytes.subarray(8, 12).toString() !== 'WAVE') throw Error('Invalid voice audio');
      fs.writeFileSync(wav, bytes);
    }
    encode(['-i', wav, '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', target]);
  }
  files.push({ kind: 'audio', id: scene.id, path: target, type: 'audio/mp4' });
  console.log(`Prepared narrated scene: ${scene.id}`);
}
let keys;
try {
  const raw = execFileSync('npx.cmd', ['--yes', 'supabase', 'projects', 'api-keys', '--project-ref', 'oojhfezpvpdfrjjdsjod', '--output', 'json'], { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  keys = JSON.parse(raw.slice(raw.indexOf('[')));
} catch { throw Error('Authenticated Supabase publishing is unavailable'); }
const service = keys.find(key => key.name === 'service_role')?.api_key;
if (!service) throw Error('Publishing credential unavailable');
const client = createClient(env.EXPO_PUBLIC_SUPABASE_URL, service, { auth: { persistSession: false, autoRefreshToken: false } });
const bucketName = 'cinema-media';
const bucket = await client.storage.getBucket(bucketName);
if (bucket.error) {
  const created = await client.storage.createBucket(bucketName, { public: true, fileSizeLimit: 12000000, allowedMimeTypes: ['image/webp', 'audio/mp4'] });
  if (created.error) throw Error('Could not create the dedicated public story-media bucket');
} else if (!bucket.data.public) throw Error('Existing bucket is private; do not change its permissions automatically');
for (const item of files) {
  const bytes = fs.readFileSync(item.path);
  const digest = hash(bytes);
  const object = `${script.id}/v${script.version}/${item.id}-${digest.slice(0, 16)}${path.extname(item.path)}`;
  const result = await client.storage.from(bucketName).upload(object, bytes, { contentType: item.type, cacheControl: '31536000', upsert: false });
  if (result.error && !/already exists|duplicate/i.test(result.error.message)) throw Error(`Media upload failed: ${item.id}`);
  const url = client.storage.from(bucketName).getPublicUrl(object).data.publicUrl;
  const check = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!check.ok || hash(Buffer.from(await check.arrayBuffer())) !== digest) throw Error(`Published media mismatch: ${item.id}`);
  media[item.kind][item.id] = url;
  console.log(`Verified published media: ${item.id} (${bytes.length} bytes)`);
}
const document = { ...script, media };
const result = await client.from('content_documents').upsert({ kind: 'cinema', id: script.id, title: script.title, document, sha256: hash(JSON.stringify(document)), published: true }, { onConflict: 'kind,id' });
if (result.error) throw Error('Story metadata publication failed');
const manifestPath = 'src/content/cinematic/media.json';
const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
fs.writeFileSync(manifestPath, JSON.stringify({ ...existing, [script.id]: media }, null, 2) + '\n');
console.log('Published the complete original episode and verified every media file.');
