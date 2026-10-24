import * as Speech from 'expo-speech';

import { estimateMs, hasTamilVoice } from './narrator';

/**
 * Reads lines one after another and reports which line is being read, so the screen can
 * highlight it ("chant along"). Uses the phone's Tamil voice; without one it still steps
 * through the lines at reading pace so the highlight works.
 */
export function chantAlong(lines: string[], opts: { rate?: number; language?: string; onLine: (i: number) => void; onDone: () => void }) {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const voice = hasTamilVoice();
  const step = (i: number) => {
    if (cancelled) return;
    if (i >= lines.length) {
      opts.onLine(-1);
      opts.onDone();
      return;
    }
    opts.onLine(i);
    const text = lines[i].replace(/[|।॥]/g, ' ');
    const next = () => {
      if (!cancelled) timer = setTimeout(() => step(i + 1), 250);
    };
    if (voice) {
      Speech.speak(text, { language: opts.language ?? 'ta-IN', rate: opts.rate ?? 0.75, onDone: next, onError: () => {
        timer = setTimeout(next, estimateMs(text));
      } });
    } else {
      timer = setTimeout(next, estimateMs(text) * 1.3);
    }
  };
  step(0);
  return {
    cancel() {
      cancelled = true;
      if (timer) clearTimeout(timer);
      Speech.stop();
      opts.onLine(-1);
    },
  };
}
