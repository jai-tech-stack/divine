import { useEffect, useRef, useState } from 'react';

/**
 * Speech-to-text, safe everywhere. expo-speech-recognition is a native module: it works in a dev build
 * (and in the browser), but not in Expo Go — there `available` is false and the screen falls back to typing.
 */
let M: any = null;
try {
  M = require('expo-speech-recognition');
} catch {
  M = null;
}
const mod = M?.ExpoSpeechRecognitionModule ?? null;
const useEv: (name: string, cb: (e: any) => void) => void = M?.useSpeechRecognitionEvent ?? (() => {});

export const sttAvailable = !!mod;

export function useListen(lang: string, onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const got = useRef('');
  const cb = useRef(onFinal);
  cb.current = onFinal;

  useEv('start', () => {
    got.current = '';
    setListening(true);
    setError(null);
  });
  useEv('result', (e: any) => {
    const t = e?.results?.[0]?.transcript ?? '';
    setPartial(t);
    if (e?.isFinal) got.current = t;
    else if (t) got.current = t;
  });
  useEv('error', (e: any) => {
    setListening(false);
    if (e?.error && e.error !== 'aborted' && e.error !== 'no-speech') setError(e.error === 'not-allowed' ? 'மைக் அனுமதி இல்லை' : 'குரல் புரியவில்லை, மீண்டும் முயலுங்கள்');
    if (e?.error === 'no-speech') setError('எதுவும் கேட்கவில்லை');
  });
  useEv('end', () => {
    setListening(false);
    const t = got.current.trim();
    got.current = '';
    setPartial('');
    if (t) cb.current(t);
  });

  const start = async () => {
    if (!mod) return;
    try {
      const perm = await mod.requestPermissionsAsync();
      if (!perm.granted) {
        setError('மைக் அனுமதி இல்லை');
        return;
      }
      setPartial('');
      mod.start({ lang, interimResults: true, continuous: false });
    } catch {
      setError('மைக் தொடங்கவில்லை');
    }
  };
  const stop = () => {
    try {
      mod?.stop();
    } catch {}
  };
  useEffect(() => () => {
    try {
      mod?.abort();
    } catch {}
  }, []);
  return { listening, partial, error, start, stop };
}
