import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/** Small on-device preference store (phase 1: never leaves the phone). */
export type Prefs = {
  /** a deity id, or 'weekday' to follow the day of the week */
  deity: string;
  /** script the verse is shown in */
  script: 'ta' | 'sa' | 'en';
  /** language of meanings and notes */
  meaning: 'ta' | 'en';
  /** reading text size multiplier */
  fontScale: number;
  /** reading page theme */
  readTheme: 'dark' | 'light' | 'sepia';
  /** also show the verse in a second script under the first */
  showTranslit: boolean;
};

const KEY = 'divine-life.prefs.v1';
let state: Prefs = { deity: 'weekday', script: 'ta', meaning: 'ta', fontScale: 1, readTheme: 'sepia', showTranslit: true };
let loaded = false;
const listeners = new Set<(p: Prefs) => void>();

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch {}
  listeners.forEach((l) => l(state));
}

export async function setPrefs(patch: Partial<Prefs>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function usePrefs(): Prefs {
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
