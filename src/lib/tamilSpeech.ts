import * as Speech from 'expo-speech';

let epoch = 0;
let available: Promise<Speech.Voice[]> | undefined;
export function stopTamilSpeech() {
  epoch++;
  return Speech.stop();
}
/** Prefer an installed Tamil voice; never hard-code a device-specific identifier. */
export async function speakTamil(text: string, options: Speech.SpeechOptions = {}) {
  const request = ++epoch;
  await Speech.stop();
  try {
    available ??= Speech.getAvailableVoicesAsync();
    const voices = (await available).filter(voice => /^ta(?:[-_]|$)/i.test(voice.language));
    const voice = voices.find(voice => voice.quality === Speech.VoiceQuality.Enhanced) ?? voices.find(voice => /^ta[-_]IN$/i.test(voice.language)) ?? voices[0];
    if (request !== epoch) return;
    Speech.speak(text, { ...options, language: 'ta-IN', voice: voice?.identifier, rate: 0.9, pitch: 1 });
  } catch (error) {
    available = undefined;
    if (request === epoch) options.onError?.(error as Error);
  }
}
