export async function voiceAudio(bytes: ArrayBuffer) {
  const uri = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
  return { uri, dispose: () => URL.revokeObjectURL(uri) };
}
