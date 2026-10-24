import { chapterVerses, getEn, getNote, getVerse, GITA_CHAPTERS, MOODS, speakerFor } from '@/content/gita';
import { getMantra } from '@/content/mantraLib';
import { askWithContext, aiConfigured } from '@/lib/ai';
import { GRAHA_TA, RASI, grahas } from '@/lib/planets';
import type { Progress } from '@/lib/progress';

/**
 * The Divine Life companion. It is an AI guide — never a god speaking. It opens with what the
 * person just read or chanted, answers from that grounded text, and, when no AI key is set,
 * still answers by pointing to the verse in the Gita that speaks to their words.
 */

export type ChatMsg = {
  id: string;
  who: 'me' | 'guide';
  text: string;
  /** a verse or mantra the reply rests on */
  ref?: { kind: 'gita'; c: number; v: number } | { kind: 'mantra'; id: string };
  followUp?: string;
};

export type Topic = { kind: 'gita'; c: number; v: number } | { kind: 'mantra'; id: string } | null;

export function topicFrom(p: Progress): Topic {
  const a = p.lastActivity;
  if (a?.kind === 'gita') {
    const [c, v] = a.ref.split('.').map(Number);
    return { kind: 'gita', c, v };
  }
  if (a?.kind === 'mantra') return { kind: 'mantra', id: a.ref };
  if (p.gitaLast) return { kind: 'gita', c: p.gitaLast.c, v: p.gitaLast.v };
  return null;
}

const clean = (s: string) => s.replace(' கூறினார்', '').replace(' கூறினான்', '');

/** The first thing the guide says — about what the person was just doing. */
export function opening(topic: Topic, en: boolean): { text: string; suggestions: string[] } {
  if (topic?.kind === 'gita') {
    const ch = GITA_CHAPTERS[topic.c - 1];
    const note = getNote(topic.c, topic.v);
    const who = clean(speakerFor(topic.c, topic.v));
    const gist = (en ? getEn(topic.c, topic.v)?.m : undefined) ?? note?.m ?? '';
    return {
      text: en
        ? `Welcome back. You were reading Gita ${topic.c}.${topic.v} (${ch.name}), where ${who} says: “${gist}”\n\nWhat would you like to understand about this moment?`
        : `வணக்கம். நீங்கள் கீதை ${topic.c}.${topic.v} (${ch.name}) படித்துக்கொண்டிருந்தீர்கள். அங்கே ${who}: “${gist}”\n\nஇந்தத் தருணத்தைப் பற்றி எதைப் புரிந்துகொள்ள விரும்புகிறீர்கள்?`,
      suggestions: en
        ? ['Explain this verse simply', 'How do I use this today?', 'Why does it matter here?']
        : ['இதை எளிமையாக விளக்குங்கள்', 'இன்று இதை எப்படிப் பயன்படுத்துவது?', 'இந்த இடத்தில் இது ஏன் முக்கியம்?'],
    };
  }
  if (topic?.kind === 'mantra') {
    const m = getMantra(topic.id);
    if (m) {
      return {
        text: en
          ? `You were with “${m.name}”. ${m.about}\n\nShall we look at what it means, or how to chant it with attention?`
          : `நீங்கள் “${m.name}” உடன் இருந்தீர்கள். ${m.about}\n\nஇதன் பொருளைப் பார்க்கலாமா, அல்லது கவனத்துடன் ஜபிப்பது எப்படி என்று பேசலாமா?`,
        suggestions: en ? ['What does it mean?', 'How should I chant it?', 'When is it chanted?'] : ['இதன் பொருள் என்ன?', 'எப்படி ஜபிப்பது?', 'எப்போது சொல்வது?'],
      };
    }
  }
  return {
    text: en
      ? 'Welcome. I am the Divine Life guide — an AI that answers from the Gita and the texts in this app. How is your mind today?'
      : 'வணக்கம். நான் Divine Life துணை — கீதை, இந்த app-இல் உள்ள நூல்கள் இவற்றிலிருந்து பதில் சொல்லும் AI. இன்று உங்கள் மனம் எப்படி இருக்கிறது?',
    suggestions: en ? ['I feel anxious', 'I am angry', 'I feel lost'] : ['மனம் கவலையாக இருக்கிறது', 'கோபமாக இருக்கிறது', 'என்ன செய்வது என்று தெரியவில்லை'],
  };
}

/** Words a person might use → the feeling in MOODS that holds the right verse. */
const FEELINGS: Record<string, string[]> = {
  anger: ['கோப', 'சின', 'எரிச்ச', 'angry', 'anger', 'irritat'],
  worry: ['கவலை', 'பதற்ற', 'tension', 'anx', 'worr', 'stress'],
  confused: ['குழப்ப', 'தெரியவில்லை', 'confus', 'lost', 'decide'],
  grief: ['துக்க', 'துயர', 'இழப்', 'இறந்', 'grief', 'death', 'died', 'loss'],
  low: ['சோர்', 'சலிப்', 'tired', 'low', 'sad', 'depress'],
  restless: ['அமைதி', 'மனம் அலை', 'restless', 'focus', 'peace'],
  desire: ['ஆசை', 'want', 'desire', 'craving'],
  fear: ['பய', 'fear', 'afraid', 'scared'],
  compare: ['ஒப்பி', 'பொறாமை', 'compare', 'jealous', 'envy'],
  lazy: ['தள்ளிப்', 'சோம்ப', 'procrastin', 'lazy'],
  guilt: ['குற்ற', 'தவறு செய்', 'guilt', 'mistake', 'regret'],
  lonely: ['தனிமை', 'யாரும் இல்லை', 'lonely', 'alone'],
  failure: ['தோல்வி', 'fail', 'lost the', 'rejected'],
};

function matchFeeling(q: string) {
  const s = q.toLowerCase();
  for (const [id, words] of Object.entries(FEELINGS)) if (words.some((w) => s.includes(w))) return MOODS.find((m) => m.id === id);
  return undefined;
}

const DISTRESS = ['தற்கொலை', 'சாக வேண்டும்', 'வாழ விருப்பமில்லை', 'suicide', 'kill myself', 'end my life', 'want to die'];

/** A grounded reply without any AI: the verse that speaks to their words, and one small step. */
function offlineReply(q: string, topic: Topic, en: boolean): Omit<ChatMsg, 'id' | 'who'> {
  if (DISTRESS.some((w) => q.toLowerCase().includes(w))) {
    return {
      text: en
        ? 'I am really glad you told me. What you are carrying sounds very heavy, and you deserve a real person with you now. Please call someone you trust, or a helpline such as Tele-MANAS 14416 (free, 24×7 in India). If you are in immediate danger, call 112.'
        : 'சொன்னதற்கு நன்றி. நீங்கள் சுமப்பது மிகவும் கனமாக இருக்கிறது; இப்போது ஒரு உண்மையான மனிதர் உங்களுடன் இருக்க வேண்டும். நம்பிக்கையான ஒருவரை அழையுங்கள், அல்லது Tele-MANAS 14416 (இலவசம், 24 மணி நேரமும்) என்ற உதவி எண்ணை அழையுங்கள். உடனடி ஆபத்து என்றால் 112.',
    };
  }
  const mood = matchFeeling(q);
  const target = mood ? { c: mood.c, v: mood.v } : topic?.kind === 'gita' ? { c: topic.c, v: topic.v } : null;
  if (target) {
    const note = getNote(target.c, target.v);
    const e = en ? getEn(target.c, target.v) : undefined;
    if (note) {
      const head = mood
        ? en
          ? `What you are feeling is something the Gita speaks to directly — verse ${target.c}.${target.v}:`
          : `நீங்கள் சொல்வதற்குக் கீதை நேரடியாகப் பேசுகிறது — சுலோகம் ${target.c}.${target.v}:`
        : en
          ? `From Gita ${target.c}.${target.v}:`
          : `கீதை ${target.c}.${target.v}-இலிருந்து:`;
      return {
        text: `${head}\n“${e?.m ?? note.m}”\n\n${note.e}\n\n${en ? 'One small step for today: ' : 'இன்றைக்கு ஒரு சிறிய அடி: '}${note.l}`,
        ref: { kind: 'gita', c: target.c, v: target.v },
        followUp: note.q ?? (en ? 'Would you like to read the full verse?' : 'முழுச் சுலோகத்தையும் படிக்கலாமா?'),
      };
    }
  }
  if (topic?.kind === 'mantra') {
    const m = getMantra(topic.id);
    if (m) {
      return {
        text: `${m.name}\n\n${m.lines.map((l) => `• ${l.mean}`).join('\n')}\n\n${en ? 'When: ' : 'எப்போது: '}${m.when}`,
        ref: { kind: 'mantra', id: m.id },
      };
    }
  }
  return {
    text: en
      ? 'The full AI guide is not connected yet, so I can answer from the Gita for feelings like worry, anger, fear, grief, confusion or guilt. Tell me what you are going through in a few words.'
      : 'முழு AI துணை இன்னும் இணைக்கப்படவில்லை. கவலை, கோபம், பயம், துயரம், குழப்பம், குற்றவுணர்வு போன்ற உணர்வுகளுக்குக் கீதையிலிருந்து பதில் சொல்ல முடியும். நீங்கள் என்ன அனுபவிக்கிறீர்கள் என்று சில சொற்களில் சொல்லுங்கள்.',
  };
}


const GRAHA_Q = /கிரக|நவகிர|ராகு|கேது|சனி|செவ்வாய்|குரு |சுக்கிர|புதன்|சந்திரன்|சூரியன்|ஜாதக|ராசி|planet|graha|rahu|ketu|saturn|jupiter|navagraha|horoscope|zodiac/i;
const KARMA_Q = /கர்ம|விதி|karma|fate|destiny/i;

/**
 * Graha questions are answered from real astronomy computed on the device + the tradition, clearly labelled.
 * Never predicts a person's future and never sells a remedy.
 */
function grahaReply(q: string, en: boolean): Omit<ChatMsg, 'id' | 'who'> | null {
  if (!GRAHA_Q.test(q)) return null;
  const now = new Date();
  const g = grahas(now);
  const lines = g.map((x) => `${en ? x.id : GRAHA_TA[x.id]}: ${RASI[x.rasi]} ${Math.floor(x.deg)}°`).join('\n');
  const karma = KARMA_Q.test(q);
  const head = en
    ? 'Today’s sky (sidereal, Lahiri), computed on your phone — this part is astronomy:'
    : 'இன்றைய வானம் (நிரயனம், லாஹிரி) — உங்கள் கைபேசியிலேயே கணக்கிடப்பட்டது; இந்தப் பகுதி வானியல்:';
  const tradition = en
    ? 'In the tradition, the grahas are read as a clock for when karma ripens — not as the cause of your life. The cause is karma; the fruit is given by Ishvara. Rahu and Ketu are points where the Moon’s path crosses the Sun’s, not bodies. Astrology’s power to predict a person has not held up in controlled tests (Carlson, Nature 1985), so I will not predict your future or sell a remedy.'
    : 'மரபில் கிரகங்கள் கர்மம் எப்போது பழுக்கும் என்பதைக் காட்டும் குறியீடு; வாழ்க்கையின் காரணம் அல்ல. காரணம் கர்மம்; பலனை வழங்குபவர் இறைவன். ராகு–கேது பொருள்கள் அல்ல; சந்திரன் பாதை சூரியன் பாதையைக் கடக்கும் புள்ளிகள். ஒருவரின் எதிர்காலத்தைக் கிரகம் முன்கூறும் என்பது கட்டுப்படுத்தப்பட்ட சோதனையில் (கார்ல்சன், Nature 1985) நிரூபணமாகவில்லை; எனவே நான் உங்கள் எதிர்காலத்தைக் கூறவோ பரிகாரம் விற்கவோ மாட்டேன்.';
  const tail = karma
    ? en ? '\n\nThree kinds of karma: sanchita (stored), prarabdha (this life’s share), agami (what you do now). Only agami is in your hands today.' : '\n\nகர்மம் மூன்று: சஞ்சிதம் (சேமிப்பு), பிராரப்தம் (இப்பிறவிக்கு எடுத்தது), ஆகாமியம் (இன்று நீங்கள் செய்வது). இன்று உங்கள் கையில் இருப்பது ஆகாமியம் மட்டுமே.'
    : '';
  return {
    text: `${head}\n${lines}\n\n${tradition}${tail}`,
    followUp: en ? 'How do I act without worrying about the fruit?' : 'பலன் விடுத்துச் செய்வது எப்படி?',
    ref: { kind: 'gita', c: 2, v: 47 },
  };
}

/** Ask the guide. Uses the AI when configured, grounded in the current topic; otherwise the offline guide. */
export async function askGuide(q: string, topic: Topic, history: ChatMsg[], en: boolean): Promise<Omit<ChatMsg, 'id' | 'who'>> {
  const gr = DISTRESS.some((w) => q.toLowerCase().includes(w)) ? null : grahaReply(q, en);
  if (gr) return gr;
  const off = offlineReply(q, topic, en);
  if (!aiConfigured() || DISTRESS.some((w) => q.toLowerCase().includes(w))) return off;
  const ctx: Record<string, unknown> = {
    language: en ? 'English' : 'Tamil',
    recent: history.slice(-6).map((m) => `${m.who === 'me' ? 'user' : 'guide'}: ${m.text}`),
    instruction: 'You are the Divine Life guide, an AI. Never speak as Krishna, Shiva or any deity. Quote only the verse/text given here.',
  };
  if (topic?.kind === 'gita') {
    const v = getVerse(topic.c, topic.v);
    const n = getNote(topic.c, topic.v);
    Object.assign(ctx, { source: `Bhagavad Gita ${topic.c}.${topic.v}`, chapter: GITA_CHAPTERS[topic.c - 1].name, speaker: speakerFor(topic.c, topic.v), verseSanskrit: v?.sa, meaning: n?.m, explanation: n?.e, dailyLife: n?.l });
  } else if (topic?.kind === 'mantra') {
    const m = getMantra(topic.id);
    if (m) Object.assign(ctx, { source: m.name, about: m.about, lines: m.lines.map((l) => ({ sa: l.sa, meaning: l.mean })) });
  }
  if (off.ref?.kind === 'gita' && (off.ref.c !== (topic as { c?: number })?.c || off.ref.v !== (topic as { v?: number })?.v)) {
    const n = getNote(off.ref.c, off.ref.v);
    ctx.relatedVerse = { ref: `${off.ref.c}.${off.ref.v}`, meaning: n?.m, explanation: n?.e };
  }
  const r = await askWithContext(q, ctx);
  if (r.source === 'offline') return off;
  return { text: r.text, followUp: r.followUp, ref: off.ref ?? (topic ?? undefined) };
}

export function refLabel(ref: ChatMsg['ref']) {
  if (!ref) return '';
  if (ref.kind === 'gita') return `கீதை ${ref.c}.${ref.v}`;
  return getMantra(ref.id)?.name ?? '';
}

export { chapterVerses };
