import { File, Paths } from 'expo-file-system';

/** Ephemeral, private playback file; deleted after playback or cancellation. */
export async function voiceAudio(bytes: ArrayBuffer) {
  const file = new File(Paths.cache, `divine-voice-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);
  try {
    await file.write(new Uint8Array(bytes));
  } catch (error) {
    try { file.delete(); } catch { /* Cache cleanup is best effort. */ }
    throw error;
  }
  return { uri: file.uri, dispose: () => { try { file.delete(); } catch { /* Already removed. */ } } };
}
