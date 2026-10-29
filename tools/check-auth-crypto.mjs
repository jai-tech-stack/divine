import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { Buffer } from 'node:buffer';
import ts from 'typescript';
const code = ts.transpileModule(fs.readFileSync('src/lib/authCrypto.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const native = {
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  getRandomValues: input => webcrypto.getRandomValues(input),
  randomUUID: () => webcrypto.randomUUID(),
  digest: (algorithm, input) => webcrypto.subtle.digest(algorithm, input),
};
const runtime = {};
new Function('require', 'exports', 'globalThis', code)(name => {
  assert.equal(name, 'expo-crypto'); return native;
}, {}, runtime);
const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const digest = await runtime.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
assert.equal(Buffer.from(digest).toString('base64url'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'RFC 7636 S256 vector');
const random = new Uint32Array(56);
assert.equal(runtime.crypto.getRandomValues(random), random);
assert.ok(random.some(value => value !== 0));
assert.throws(() => runtime.crypto.subtle.digest('unsupported', new Uint8Array()));
console.log('Native PKCE bridge passed: secure typed randomness and RFC 7636 SHA-256 vector.');
