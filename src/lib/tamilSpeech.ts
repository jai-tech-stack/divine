import * as Speech from 'expo-speech';
import { createAudioPlayer } from 'expo-audio';
import { voiceAudio } from './voiceAudio';

let epoch = 0;
let available: Promise<Speech.Voice[]> | undefined;
let pending: AbortController | undefined;
let releaseAudio: (() => void) | undefined;
let stopped: (() => void) | undefined;
export function stopTamilSpeech() {
  epoch++;
  pending?.abort();
  pending = undefined;
  const onStopped = stopped;
  releaseAudio?.();
  releaseAudio = undefined;
  onStopped?.();
  stopped = undefined;
  return Speech.stop();
}
/** Natural Tamil speech online, with the installed Tamil voice as a fallback. */
export async function speakTamil(text: string, options: Speech.SpeechOptions = {}) {
  const stopping = stopTamilSpeech();
  const request = ++epoch;
  await stopping;
  if (request !== epoch) return;
  stopped = options.onStopped;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon && text.length <= 2000) {
    const controller = new AbortController();
    pending = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${url}/functions/v1/tamil-voice`, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anon}`, apikey: anon },
        body: JSON.stringify({ text }),
      });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/wav')) throw new Error('Voice unavailable');
      const bytes = await response.arrayBuffer();
      if (request !== epoch) return;
      const audio = await voiceAudio(bytes);
      if (request !== epoch) { audio.dispose(); return; }
      const player = createAudioPlayer(audio.uri);
      let finished = false;
      const cleanup = () => {
        if (finished) return;
        finished = true;
        clearTimeout(watchdog);
        subscription.remove();
        player.remove();
        audio.dispose();
        if (request === epoch) { releaseAudio = undefined; stopped = undefined; }
      };
      const subscription = player.addListener('playbackStatusUpdate', status => {
        if (status.didJustFinish) { cleanup(); options.onDone?.(); }
      });
      // Handles a native decoder/load failure that never reaches didJustFinish.
      const watchdog = setTimeout(() => { cleanup(); options.onError?.(new Error('Voice playback timed out')); }, 180000);
      releaseAudio = cleanup;
      player.play();
      options.onStart?.();
      return;
    } catch {
      if (request !== epoch) return;
      releaseAudio?.();
      releaseAudio = undefined;
    } finally {
      clearTimeout(timeout);
      if (pending === controller) pending = undefined;
    }
  }
  try {
    available ??= Speech.getAvailableVoicesAsync();
    const voices = (await available).filter(voice => /^ta(?:[-_]|$)/i.test(voice.language));
    const voice = voices.find(voice => voice.quality === Speech.VoiceQuality.Enhanced) ?? voices.find(voice => /^ta[-_]IN$/i.test(voice.language)) ?? voices[0];
    if (request !== epoch) return;
    Speech.speak(text, { ...options, language: 'ta-IN', voice: voice?.identifier, rate: 0.9, pitch: 1,
      onDone: () => { if (request === epoch) { stopped = undefined; options.onDone?.(); } },
      onStopped: () => { if (request === epoch) { stopped = undefined; options.onStopped?.(); } },
    });
  } catch (error) {
    available = undefined;
    if (request === epoch) { stopped = undefined; options.onError?.(error as Error); }
  }
}
