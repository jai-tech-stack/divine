import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { progressStore } from './progress';
import { isProgressDocument, mergeProgress, stampProgress, type ProgressDocument } from './progressMerge';
import { supabase } from './supabase';

type Status = { phase: 'guest' | 'loading' | 'pending' | 'syncing' | 'synced' | 'offline'; at?: number };
let status: Status = { phase: 'guest' };
const listeners = new Set<(value: Status) => void>();
const update = (value: Status) => { status = value; listeners.forEach(fn => fn(value)); };
type Context = { user: string; key: string; device: string; doc: ProgressDocument; unsubscribe?: () => void; timer?: ReturnType<typeof setTimeout>; flight?: Promise<void>; abort?: AbortController; applying: boolean; retry: number };
let current: Context | undefined;
let generation = 0;
let connecting = Promise.resolve();
let persistence = Promise.resolve();
const persist = (ctx: Context) => {
  const raw = JSON.stringify(ctx.doc);
  persistence = persistence.then(() => AsyncStorage.setItem(ctx.key, raw)).catch(() => { if (current === ctx) update({ phase: 'offline' }); });
};
function schedule(ctx: Context, delay = 1200) {
  clearTimeout(ctx.timer);
  ctx.timer = setTimeout(() => { void syncProgress(); }, delay);
}

export function connectProgress(user: string | null) {
  const ticket = ++generation;
  current?.unsubscribe?.(); clearTimeout(current?.timer); current?.abort?.abort();
  current = undefined;
  update({ phase: user ? 'loading' : 'guest' });
  connecting = connecting.catch(() => {}).then(async () => {
    if (ticket !== generation) return;
    await progressStore.selectUser(user);
    if (!user || ticket !== generation) return;
    let device = await AsyncStorage.getItem('divine-life.sync-device.v1');
    if (!device) { device = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; await AsyncStorage.setItem('divine-life.sync-device.v1', device); }
    const key = `divine-life.sync.v1.${user}`;
    const raw = await AsyncStorage.getItem(key);
    let cached: unknown;
    try { cached = raw ? JSON.parse(raw) : null; } catch {}
    const doc = isProgressDocument(cached) ? stampProgress(progressStore.get(), cached, device) : stampProgress(progressStore.get(), null, device, 0);
    if (ticket !== generation) return;
    const ctx: Context = { user, key, device, doc, applying: false, retry: 0 };
    current = ctx;
    ctx.unsubscribe = progressStore.subscribe(values => {
      if (ctx.applying || current !== ctx) return;
      ctx.doc = stampProgress(values, ctx.doc, ctx.device);
      persist(ctx); update({ phase: 'pending' }); schedule(ctx);
    });
    persist(ctx);
    await syncProgress();
  }).catch(() => { if (ticket === generation) update({ phase: 'offline' }); });
  return connecting;
}

export function syncProgress(): Promise<void> {
  const ctx = current;
  const client = supabase;
  if (!ctx || !client) return Promise.resolve();
  if (ctx.flight) return ctx.flight;
  clearTimeout(ctx.timer);
  const controller = new AbortController(); ctx.abort = controller;
  const timeout = setTimeout(() => controller.abort(), 20000);
  ctx.flight = (async () => {
    update({ phase: 'syncing' });
    for (let attempt = 0; attempt < 3 && current === ctx; attempt++) {
      const { data, error } = await client.from('user_progress').select('progress,revision').eq('user_id', ctx.user).abortSignal(controller.signal).maybeSingle();
      if (error) throw error;
      if (current !== ctx) return;
      if (data && !isProgressDocument(data.progress)) throw new Error('Invalid remote progress');
      const candidate = data ? mergeProgress(ctx.doc, data.progress as ProgressDocument) : ctx.doc;
      const { data: saved, error: writeError } = await client.rpc('save_user_progress', { document: candidate, expected_revision: data?.revision ?? 0 }).abortSignal(controller.signal);
      if (writeError) throw writeError;
      if (current !== ctx) return;
      if (!saved) continue; // Another device wrote first: refetch, merge and retry.
      const changedWhileSaving = JSON.stringify(ctx.doc) !== JSON.stringify(candidate) && JSON.stringify(ctx.doc) !== JSON.stringify(data?.progress);
      ctx.doc = mergeProgress(ctx.doc, candidate);
      ctx.applying = true;
      try { progressStore.replace(ctx.doc.values); } finally { ctx.applying = false; }
      persist(ctx); ctx.retry = 0;
      // If edits arrived during I/O they remain pending and are sent next.
      const pending = JSON.stringify(ctx.doc) !== JSON.stringify(candidate);
      update({ phase: pending ? 'pending' : 'synced', at: Date.now() });
      if (pending && changedWhileSaving) schedule(ctx);
      return;
    }
    throw new Error('Progress changed on another device');
  })().catch(() => {
    if (current === ctx) {
      update({ phase: 'offline' });
      schedule(ctx, Math.min(60000, 5000 * ++ctx.retry));
    }
  }).finally(() => { clearTimeout(timeout); ctx.flight = undefined; if (ctx.abort === controller) ctx.abort = undefined; });
  return ctx.flight;
}

/** Explicit opt-in: guest history is never silently imported into another account. */
export async function importGuestProgress() {
  await connecting;
  const ctx = current;
  if (!ctx) return;
  const guest = await progressStore.guest();
  if (current !== ctx) return;
  const incoming = stampProgress(guest, null, ctx.device);
  // Guest import adds history without replacing the account's bookmarks or position.
  incoming.values = { ...incoming.values, gitaSaved: [...new Set([...ctx.doc.values.gitaSaved, ...guest.gitaSaved])], mantraFavs: [...new Set([...ctx.doc.values.mantraFavs, ...guest.mantraFavs])] };
  const account = { ...ctx.doc.values,
    gitaLast: ctx.doc.values.gitaLast ?? guest.gitaLast,
    bookLast: ctx.doc.values.bookLast ?? guest.bookLast,
    storyLast: ctx.doc.values.storyLast ?? guest.storyLast,
    lastActivity: ctx.doc.values.lastActivity ?? guest.lastActivity,
    readingLast: ctx.doc.values.readingLast ?? guest.readingLast,
  };
  const combined = mergeProgress(incoming, stampProgress(account, null, ctx.device, Date.now() + 1));
  combined.values.gitaSaved = incoming.values.gitaSaved; combined.values.mantraFavs = incoming.values.mantraFavs;
  progressStore.replace(combined.values);
  await syncProgress();
}

export function useSyncStatus() {
  return useSyncExternalStore(callback => { listeners.add(callback); return () => { listeners.delete(callback); }; }, () => status, () => status);
}
