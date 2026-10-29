import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { applyAbiSplits } = require('../plugins/with-small-android');
const root = new URL('../', import.meta.url);
const { expo } = JSON.parse(fs.readFileSync(new URL('app.json', root), 'utf8'));
const gradle = new URL('android/app/build.gradle', root);
let contents = fs.readFileSync(gradle, 'utf8');
if (!contents.includes(`applicationId '${expo.android.package}'`)) throw Error('Unexpected native project identity');
for (const pattern of [/versionCode\s+\d+/g, /versionName\s+"[^"]+"/g]) {
  if ([...contents.matchAll(pattern)].length !== 1) throw Error('Unexpected generated version configuration');
}
contents = contents.replace(/versionCode\s+\d+/, `versionCode ${expo.android.versionCode}`)
  .replace(/versionName\s+"[^"]+"/, `versionName "${expo.version}"`);
fs.writeFileSync(gradle, applyAbiSplits(contents));
const properties = new URL('android/gradle.properties', root);
const keys = { 'expo.useLegacyPackaging': 'true', 'android.enableBundleCompression': 'true' };
const lines = fs.readFileSync(properties, 'utf8').split(/\r?\n/).filter(line => !Object.keys(keys).some(key => line.startsWith(key + '=')));
fs.writeFileSync(properties, lines.join('\n') + '\n' + Object.entries(keys).map(([k,v]) => `${k}=${v}`).join('\n') + '\n');
if (process.argv.includes('--clean-assets')) {
  const generatedRoot = path.resolve(fileURLToPath(root), 'android/app/build/generated');
  for (const relative of ['res/react/release', 'assets/react/release']) {
    const target = path.resolve(generatedRoot, relative);
    if (!target.startsWith(generatedRoot + path.sep)) throw Error('Unsafe generated asset path');
    fs.rmSync(target, { recursive: true, force: true });
  }
}
console.log(`Prepared ABI-specific compressed APKs, version ${expo.version} (${expo.android.versionCode}); signing unchanged.`);
