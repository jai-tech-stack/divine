"""Generate Tamil audio (meanings + stories) with Google Cloud TTS.
Usage:  pip install google-cloud-texttospeech
        set GOOGLE_APPLICATION_CREDENTIALS=path\\to\\key.json
        python tools/make_voice.py
Writes assets/audio/gita/cXX/vYYY_ta.mp3 for every verse that has a Tamil note."""
import json, os, re, pathlib
from google.cloud import texttospeech as tts

ROOT = pathlib.Path(__file__).resolve().parents[1]
client = tts.TextToSpeechClient()
voice = tts.VoiceSelectionParams(language_code="ta-IN", name="ta-IN-Wavenet-C")
cfg = tts.AudioConfig(audio_encoding=tts.AudioEncoding.MP3, speaking_rate=0.92)

def say(text, out):
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.exists(): return
    r = client.synthesize_speech(input=tts.SynthesisInput(text=text), voice=voice, audio_config=cfg)
    out.write_bytes(r.audio_content); print("wrote", out.relative_to(ROOT))

notes_dir = ROOT / "src/content/gita/notes"
for f in sorted(notes_dir.glob("ch*.ts")):
    c = int(re.match(r"ch(\d+)", f.stem).group(1))
    src = f.read_text(encoding="utf-8")
    for v, m in re.findall(r"(\d+):\s*\{[^}]*?m:\s*'((?:[^'\\]|\\.)*)'", src, re.S):
        say(m.replace("\\'", "'"), ROOT / f"assets/audio/gita/c{c:02d}/v{int(v):03d}_ta.mp3")
