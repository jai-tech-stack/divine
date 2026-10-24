import json, re, sys
from indic_transliteration import sanscript
v = json.load(open('/root/dl/gita/verse.json'))
SPK = {'धृतराष्ट्र उवाच':'திருதராஷ்டிரன் கூறினான்','सञ्जय उवाच':'சஞ்சயன் கூறினான்','अर्जुन उवाच':'அர்ஜுனன் கூறினான்','श्रीभगवानुवाच':'ஸ்ரீ பகவான் கூறினார்','श्री भगवानुवाच':'ஸ்ரீ பகவான் கூறினார்','संजय उवाच':'சஞ்சயன் கூறினான்'}
def ta(s):
    t = sanscript.transliterate(s, sanscript.DEVANAGARI, sanscript.TAMIL)
    t = t.replace("'", '').replace('ऽ', '').replace('ஃ', ':').replace('ஶ', 'ச').replace('।।', '||').replace('।', '|')
    return t
out = []
last = None
unknown = set()
for x in sorted(v, key=lambda r: (r['chapter_number'], r['verse_number'])):
    lines = [l.strip() for l in x['text'].strip().split('\n') if l.strip()]
    speaker = None
    if lines and lines[0].endswith('वाच'):
        s = lines.pop(0)
        speaker = SPK.get(s) or SPK.get(s.replace(' ', ''))
        if not speaker: unknown.add(s)
    if speaker: last = speaker
    elif x['verse_number'] > 1: speaker = None
    body = '\n'.join(lines)
    body = re.sub(r'\s*[।॥]+\s*[\d\.]+\s*[।॥]*\s*$', ' ॥', body)
    body = body.replace('।।', '॥')
    out.append({'c': x['chapter_number'], 'v': x['verse_number'], 's': speaker, 'sa': body, 'ta': ta(body)})
print('verses', len(out), 'unknown speakers', unknown, file=sys.stderr)
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False, separators=(',', ':'))
