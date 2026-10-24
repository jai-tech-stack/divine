import json, sys
from indic_transliteration import sanscript
def ta(s):
    t = sanscript.transliterate(s, sanscript.DEVANAGARI, sanscript.TAMIL)
    return t.replace("'", '').replace('ऽ', '').replace('ஃ', ':').replace('ஶ', 'ச').replace('।', '|').replace('॥', '||').replace('ௐ', 'ஓம்')
src = json.load(open(sys.argv[1]))
out = []
for m in src:
    lines = [{'sa': l[0], 'ta': l[2] if len(l) > 2 else ta(l[0]), 'mean': l[1]} for l in m['lines']]
    out.append({**{k: v for k, v in m.items() if k != 'lines'}, 'lines': lines})
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
print(len(out))
for m in out[:3]+out[-4:-3]:
    for l in m['lines']: print(l['ta'])
