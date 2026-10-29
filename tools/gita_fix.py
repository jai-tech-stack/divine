"""Second pass over verses.json: pull merged speaker labels out of the text, restore the
line break at the half-verse danda, and renumber chapter 13 so Arjuna's opening question
is 13.0 and the rest follow this selected edition's numbering."""
import json, re, sys
from indic_transliteration import sanscript
p = sys.argv[1]
d = json.load(open(p))
SPK = [('धृतराष्ट्र उवाच','திருதராஷ்டிரன் கூறினான்'),('सञ्जय उवाच','சஞ்சயன் கூறினான்'),('संजय उवाच','சஞ்சயன் கூறினான்'),
       ('अर्जुन उवाच','அர்ஜுனன் கூறினான்'),('श्रीभगवानुवाच','ஸ்ரீ பகவான் கூறினார்'),('श्री भगवानुवाच','ஸ்ரீ பகவான் கூறினார்')]
def ta(s):
    t = sanscript.transliterate(s, sanscript.DEVANAGARI, sanscript.TAMIL)
    return t.replace("'", '').replace('ऽ', '').replace('ஃ', ':').replace('ஶ', 'ச').replace('।।', '||').replace('।', '|')
fixed = 0
for x in d:
    sa = x['sa'].strip()
    for dev, tam in SPK:
        if sa.startswith(dev):
            sa = sa[len(dev):].strip(); x['s'] = tam; fixed += 1; break
    if '\n' not in sa and '।' in sa:
        i = sa.index('।') + 1
        sa = sa[:i] + '\n' + sa[i:].strip()
    x['sa'] = sa; x['ta'] = ta(sa)
c13 = [x for x in d if x['c'] == 13]
if len(c13) == 35:
    for x in c13: x['v'] -= 1
    # the speaker on the new 13.1 is Krishna
    nxt = [x for x in c13 if x['v'] == 1][0]; nxt['s'] = 'ஸ்ரீ பகவான் கூறினார்'
print('speakers fixed', fixed, file=sys.stderr)
json.dump(d, open(p, 'w'), ensure_ascii=False, separators=(',', ':'))
