// Shared helper: loads src/content/stories/*.ts in plain Node (no Metro) so tools can read the scenes.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = createRequire(import.meta.url)('typescript');
const cache = new Map();

function resolveFile(from, spec) {
  const base = spec.startsWith('@/') ? path.join(ROOT, 'src', spec.slice(2)) : path.resolve(path.dirname(from), spec);
  for (const c of [base, base + '.ts', base + '.tsx', path.join(base, 'index.ts')]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} };
  cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const req = (spec) => {
    if (!spec.startsWith('.') && !spec.startsWith('@/')) return {};
    if (/\.(jpe?g|png|webp|mp3|wav|json)$/i.test(spec)) return 1;
    const f = resolveFile(file, spec);
    return f ? load(f) : 1;
  };
  new Function('require', 'module', 'exports', code)(req, mod, mod.exports);
  return mod.exports;
}

export function loadStories() {
  const dir = path.join(ROOT, 'src/content/stories');
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.ts') && x !== 'nayanar.ts')) {
    for (const v of Object.values(load(path.join(dir, f)))) {
      for (const s of Array.isArray(v) ? v : [v]) if (s && s.id && Array.isArray(s.scenes)) out.push(s);
    }
  }
  return [...new Map(out.map((s) => [s.id, s])).values()];
}
