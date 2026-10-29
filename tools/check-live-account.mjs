// Creates only disposable, confirmed example.invalid test accounts. Sends no email.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
const env = parseEnv(fs.readFileSync('.env.local', 'utf8'));
const raw = execFileSync('npx.cmd', ['--yes', 'supabase', 'projects', 'api-keys', '--project-ref', 'oojhfezpvpdfrjjdsjod', '--output', 'json'], { shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const keys = JSON.parse(raw.slice(raw.indexOf('[')));
const service = keys.find(k => k.name === 'service_role')?.api_key;
if (!service) throw Error('Authenticated test tooling unavailable');
const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) }) } };
const admin = createClient(env.EXPO_PUBLIC_SUPABASE_URL, service, options);
const ids = [];
try {
  const clients = [];
  for (let i = 0; i < 2; i++) {
    const email = `divine-test-${crypto.randomUUID()}@example.invalid`;
    const password = crypto.randomBytes(24).toString('base64url');
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(error); ids.push(data.user.id);
    const client = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, options);
    const login = await client.auth.signInWithPassword({ email, password }); assert.ifError(login.error);
    clients.push(client);
  }
  const [a, b] = clients;
  const userA = await a.auth.getUser(); assert.ifError(userA.error);
  const recovery = await admin.auth.admin.generateLink({ type: 'recovery', email: userA.data.user.email,
    options: { redirectTo: 'divinelife://account' } });
  assert.ifError(recovery.error);
  assert.equal(recovery.data.properties.redirect_to, 'divinelife://account', 'The exact mobile redirect must be allowlisted');
  let recoveryEvent = false;
  const recoveryClient = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, options);
  const subscription = recoveryClient.auth.onAuthStateChange(event => { if (event === 'PASSWORD_RECOVERY') recoveryEvent = true; });
  const recovered = await recoveryClient.auth.verifyOtp({ type: 'recovery', token_hash: recovery.data.properties.hashed_token });
  assert.ifError(recovered.error); assert.equal(recoveryEvent, true);
  subscription.data.subscription.unsubscribe();
  console.log('Recovery link redirect and password recovery session verified without sending email.');
  const first = await a.rpc('save_user_progress', { document: { version: 1, test: 'owned' }, expected_revision: 0 });
  assert.ifError(first.error); assert.equal(first.data, true);
  const own = await a.from('user_progress').select('progress,revision').eq('user_id', ids[0]).single();
  assert.ifError(own.error); assert.equal(own.data.revision, 1);
  const hidden = await b.from('user_progress').select('user_id').eq('user_id', ids[0]);
  assert.ifError(hidden.error); assert.deepEqual(hidden.data, []);
  const denied = await b.from('user_progress').insert({ user_id: ids[0], progress: { test: 'forbidden' } });
  assert.ok(denied.error, 'Another account must not write this user row');
  const results = await Promise.all([a, a].map((client, i) => client.rpc('save_user_progress', { document: { version: 1, test: `concurrent-${i}` }, expected_revision: 1 })));
  results.forEach(result => assert.ifError(result.error));
  assert.deepEqual(results.map(r => r.data).sort(), [false, true], 'Exactly one concurrent revision can win');
  const stale = await a.rpc('save_user_progress', { document: { test: 'stale' }, expected_revision: 1 });
  assert.ifError(stale.error); assert.equal(stale.data, false);
  const anon = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, options);
  const blocked = await anon.rpc('save_user_progress', { document: {}, expected_revision: 0 });
  assert.ok(blocked.error);
  const out = await a.auth.signOut({ scope: 'local' }); assert.ifError(out.error);
  console.log('Live account checks passed: password login, own save/read, cross-user isolation, revision conflicts, anonymous denial and logout.');
} finally {
  for (const id of ids) {
    const result = await admin.auth.admin.deleteUser(id);
    if (result.error) throw Error('Disposable test account cleanup failed');
  }
  console.log('Disposable test accounts removed; existing users untouched.');
}
