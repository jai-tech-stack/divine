import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/** Reading progress, bookmarks and favourites — kept on the phone. */
export type Progress = {
  gitaRead: string[]; // "c.v"
  gitaLast: { c: number; v: number } | null;
  gitaSaved: string[];
  mantraFavs: string[];
  streakDays: string[]; // YYYY-MM-DD with any practice
  commitments: { key: string; date: string; text: string }[]; // "today I will…" from a verse
  /** what the person did last, so the companion can open with it */
  lastActivity: { kind: 'gita' | 'mantra'; ref: string; at: number } | null;
  /** mantra id -> rounds chanted today (date-stamped) */
  chantLog: { id: string; date: string; rounds: number }[];
  /** what was done today — lights the three wicks of the lamp */
  daily: { date: string; read: number; chant: number; talk: number };
};

const KEY = 'divine-life.progress.v1';
let state: Progress = { gitaRead: [], gitaLast: null, gitaSaved: [], mantraFavs: [], streakDays: [], commitments: [], lastActivity: null, chantLog: [], daily: { date: '', read: 0, chant: 0, talk: 0 } };
let loaded = false;
const listeners = new Set<(p: Progress) => void>();

const today = () => new Date().toISOString().slice(0, 10);

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch {}
  emit();
}

function emit() {
  listeners.forEach((l) => l(state));
}

function save(next: Progress) {
  state = next;
  emit();
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

const dayOf = (): Progress['daily'] => (state.daily && state.daily.date === today() ? state.daily : { date: today(), read: 0, chant: 0, talk: 0 });

const toggle = (list: string[], key: string) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

export const progress = {
  markRead(c: number, v: number) {
    const key = `${c}.${v}`;
    const d = today();
    save({
      ...state,
      gitaRead: state.gitaRead.includes(key) ? state.gitaRead : [...state.gitaRead, key],
      gitaLast: { c, v },
      daily: { ...dayOf(), read: dayOf().read + 1 },
      streakDays: state.streakDays.includes(d) ? state.streakDays : [...state.streakDays.slice(-60), d],
    });
  },
  setLast(c: number, v: number) {
    save({ ...state, gitaLast: { c, v }, lastActivity: { kind: 'gita', ref: `${c}.${v}`, at: Date.now() } });
  },
  openedMantra(id: string) {
    save({ ...state, lastActivity: { kind: 'mantra', ref: id, at: Date.now() } });
  },
  chanted(id: string, rounds: number) {
    const date = today();
    const prev = state.chantLog.find((x) => x.id === id && x.date === date);
    const rest = state.chantLog.filter((x) => !(x.id === id && x.date === date)).slice(-60);
    save({
      ...state,
      chantLog: [...rest, { id, date, rounds: (prev?.rounds ?? 0) + rounds }],
      daily: { ...dayOf(), chant: dayOf().chant + rounds },
      streakDays: state.streakDays.includes(date) ? state.streakDays : [...state.streakDays.slice(-60), date],
      lastActivity: { kind: 'mantra', ref: id, at: Date.now() },
    });
  },
  talked() {
    const date = today();
    save({ ...state, daily: { ...dayOf(), talk: dayOf().talk + 1 }, streakDays: state.streakDays.includes(date) ? state.streakDays : [...state.streakDays.slice(-60), date] });
  },
  toggleSaved(c: number, v: number) {
    save({ ...state, gitaSaved: toggle(state.gitaSaved, `${c}.${v}`) });
  },
  commit(c: number, v: number, text: string) {
    const key = `${c}.${v}`;
    const date = today();
    save({ ...state, commitments: [...state.commitments.filter((x) => !(x.key === key && x.date === date)).slice(-40), { key, date, text }] });
  },
  toggleFav(id: string) {
    save({ ...state, mantraFavs: toggle(state.mantraFavs, id) });
  },
};

export function useProgress(): Progress {
  const [p, setP] = useState(state);
  useEffect(() => {
    listeners.add(setP);
    load();
    return () => {
      listeners.delete(setP);
    };
  }, []);
  return p;
}

/** Consecutive days up to today with any recorded practice. */
export function streak(days: string[]): number {
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (!set.has(k)) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Today's three wicks: read, chant, talk. */
export function wicks(p: Progress) {
  const d = p.daily && p.daily.date === today() ? p.daily : { read: 0, chant: 0, talk: 0 };
  return { read: d.read > 0, chant: d.chant > 0, talk: d.talk > 0 };
}
