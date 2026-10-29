import type { Progress } from './progress';

type Stamp = { at: number; device: string };
export type ProgressDocument = { version: 1; values: Progress; clocks: Partial<Record<keyof Progress, Stamp>> };
const keys: (keyof Progress)[] = ['gitaRead', 'gitaLast', 'storyLast', 'bookLast', 'readingLast', 'gitaSaved', 'mantraFavs', 'streakDays', 'commitments', 'lastActivity', 'chantLog', 'daily'];
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const newer = (a?: Stamp, b?: Stamp) => (a?.at ?? 0) > (b?.at ?? 0) || ((a?.at ?? 0) === (b?.at ?? 0) && (a?.device ?? '') > (b?.device ?? ''));

export function stampProgress(values: Progress, previous: ProgressDocument | null, device: string, at = Date.now()): ProgressDocument {
  const clocks = { ...previous?.clocks };
  for (const key of keys) if (!previous || !same(values[key], previous.values[key])) {
    clocks[key] = { at: Math.max(at, (clocks[key]?.at ?? 0) + 1), device };
  }
  return { version: 1, values, clocks };
}

/** Bounded validation before accepting another device's JSON. */
export function isProgressDocument(value: unknown): value is ProgressDocument {
  if (!value || typeof value !== 'object') return false;
  const d = value as ProgressDocument;
  if (d.version !== 1 || !d.values || !d.clocks || JSON.stringify(value).length > 250000) return false;
  const p = d.values;
  for (const key of ['gitaRead', 'gitaSaved', 'mantraFavs', 'streakDays'] as const)
    if (!Array.isArray(p[key]) || p[key].length > 5000 || p[key].some(x => typeof x !== 'string' || x.length > 200)) return false;
  if (!Array.isArray(p.chantLog) || p.chantLog.length > 5000 || p.chantLog.some(x => !x || typeof x.id !== 'string' || typeof x.date !== 'string' || !Number.isFinite(x.rounds) || x.rounds < 0)) return false;
  if (!Array.isArray(p.commitments) || p.commitments.length > 5000 || p.commitments.some(x => !x || typeof x.key !== 'string' || typeof x.date !== 'string' || typeof x.text !== 'string')) return false;
  if (!p.daily || typeof p.daily.date !== 'string' || ['read', 'chant', 'talk'].some(k => !Number.isFinite(p.daily[k as 'read']) || p.daily[k as 'read'] < 0)) return false;
  if (p.gitaLast !== null && (!p.gitaLast || !Number.isInteger(p.gitaLast.c) || !Number.isInteger(p.gitaLast.v) || p.gitaLast.c < 1 || p.gitaLast.c > 18 || p.gitaLast.v < 1 || p.gitaLast.v > 100)) return false;
  if (p.bookLast !== null && (!p.bookLast || typeof p.bookLast.id !== 'string' || !Number.isInteger(p.bookLast.page) || p.bookLast.page < 1)) return false;
  if (p.storyLast !== null && (!p.storyLast || typeof p.storyLast.id !== 'string' || !Number.isInteger(p.storyLast.scene) || !Number.isInteger(p.storyLast.line) || typeof p.storyLast.completed !== 'boolean')) return false;
  if (p.lastActivity !== null && (!p.lastActivity || !['gita', 'mantra'].includes(p.lastActivity.kind) || typeof p.lastActivity.ref !== 'string' || !Number.isFinite(p.lastActivity.at))) return false;
  if (p.readingLast != null && (!['gita', 'story', 'book'].includes(p.readingLast.kind) || typeof p.readingLast.ref !== 'string' || !Number.isFinite(p.readingLast.at))) return false;
  return keys.every(key => !d.clocks[key] || (Number.isFinite(d.clocks[key]!.at) && typeof d.clocks[key]!.device === 'string'));
}

export function mergeProgress(a: ProgressDocument, b: ProgressDocument): ProgressDocument {
  const values = { ...a.values };
  const clocks = { ...a.clocks };
  for (const key of keys) if (newer(b.clocks[key], a.clocks[key])) {
    Object.assign(values, { [key]: b.values[key] }); clocks[key] = b.clocks[key];
  }
  values.gitaRead = [...new Set([...a.values.gitaRead, ...b.values.gitaRead])].sort();
  values.streakDays = [...new Set([...a.values.streakDays, ...b.values.streakDays])].sort().slice(-366);
  // Counts use maximums, not sums: reading the same snapshot repeatedly must not
  // manufacture extra chants. Simultaneous offline totals are conservative.
  if (a.values.daily.date === b.values.daily.date) values.daily = {
    date: a.values.daily.date,
    read: Math.max(a.values.daily.read, b.values.daily.read),
    chant: Math.max(a.values.daily.chant, b.values.daily.chant),
    talk: Math.max(a.values.daily.talk, b.values.daily.talk),
  };
  else values.daily = a.values.daily.date > b.values.daily.date ? a.values.daily : b.values.daily;
  const chants = new Map<string, Progress['chantLog'][number]>();
  for (const item of [...a.values.chantLog, ...b.values.chantLog]) {
    const key = `${item.date}/${item.id}`;
    if (!chants.has(key) || chants.get(key)!.rounds < item.rounds) chants.set(key, item);
  }
  values.chantLog = [...chants.values()].sort((x, y) => `${x.date}/${x.id}`.localeCompare(`${y.date}/${y.id}`)).slice(-366);
  const commitments = new Map<string, Progress['commitments'][number]>();
  const ordered = newer(a.clocks.commitments, b.clocks.commitments) ? [b, a] : [a, b];
  for (const doc of ordered) for (const item of doc.values.commitments) commitments.set(`${item.date}/${item.key}`, item);
  values.commitments = [...commitments.values()].sort((x, y) => `${x.date}/${x.key}`.localeCompare(`${y.date}/${y.key}`)).slice(-100);
  return { version: 1, values, clocks };
}
