import * as Speech from 'expo-speech';

let tamilVoice: string | undefined;
let checked = false;

/** Finds an installed Tamil voice once. Devices without one fall back to timed subtitles. */
export async function prepareNarrator(): Promise<boolean> {
  if (checked) return !!tamilVoice;
  checked = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const ta = voices.filter((v) => (v.language || '').toLowerCase().startsWith('ta'));
    const best = ta.find((v) => String(v.quality).toLowerCase() === 'enhanced') ?? ta[0];
    tamilVoice = best?.identifier;
  } catch {
    tamilVoice = undefined;
  }
  return !!tamilVoice;
}

export function hasTamilVoice() {
  return !!tamilVoice;
}

/** Reading time when no voice is available: ~14 Tamil characters per second, min 2.8 s. */
export function estimateMs(text: string) {
  return Math.max(2800, Math.round((text.length / 14) * 1000) + 900);
}

type Handle = { cancel: () => void };

/**
 * Speaks one subtitle line. Calls onDone exactly once — when speech ends, or after the
 * estimated reading time if speech is muted/unavailable or never reports back.
 */
export function narrate(text: string, opts: { muted: boolean; rate?: number; onDone: () => void }): Handle {
  let finished = false;
  const est = estimateMs(text);
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    opts.onDone();
  };
  const useVoice = !opts.muted && !!tamilVoice;
  const safety = setTimeout(finish, useVoice ? est * 3 : est);
  if (useVoice) {
    Speech.speak(text.replace(/["“”]/g, ''), {
      language: 'ta-IN',
      voice: tamilVoice,
      rate: opts.rate ?? 0.92,
      pitch: 1.0,
      onDone: () => {
        setTimeout(finish, 350);
      },
      onError: () => {
        setTimeout(finish, est);
      },
    });
  }
  return {
    cancel: () => {
      finished = true;
      clearTimeout(safety);
      if (useVoice) Speech.stop();
    },
  };
}

export function stopNarration() {
  Speech.stop();
}
