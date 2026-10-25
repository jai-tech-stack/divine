import type { Story } from '@/content/types';

export type WisdomReply = {
  text: string;
  /** which provider answered, or 'offline' for a prepared answer */
  source: string;
  followUp?: string;
};

/**
 * Prepared answers for the suggested questions, so the flow works before the AI backend
 * is configured. Written for review; not presented as scripture.
 */
const PREPARED: Record<string, WisdomReply> = {
  'வேலை அழுத்தத்தில் வீட்டில் கோபப்பட்டேன் — முதலில் என்ன செய்யலாம்?': {
    source: 'offline',
    text:
      'முதலில், நடந்ததை உங்களைக் குற்றம் சாட்டாமல் பெயரிடுங்கள்: "அழுத்தம் என்னுள் இருந்தது; அது வீட்டில் வெளிப்பட்டது." பிருதுவின் சினமும் மக்களின் துயரத்திலிருந்துதான் எழுந்தது — ஆனால் அது பூமியை நோக்கித் திரும்பியது.\n\nஇன்று செய்யக்கூடிய ஒரு சிறிய செயல்: பாதிக்கப்பட்டவரிடம் சுருக்கமாக, சாக்குப்போக்கு இல்லாமல் சொல்லுங்கள் — "நான் கடுமையாகப் பேசினேன்; அது உங்கள் தவறு அல்ல."\n\nஅடுத்த முறைக்கு: வீட்டுக் கதவைத் திறக்கும் முன் மூன்று மெதுவான மூச்சுகள் — அதுவே "பூமி பேசும்" இடைவெளி.',
    followUp: 'அந்த அழுத்தம் பெரும்பாலும் எந்த நேரத்தில் அதிகமாகிறது — வேலை முடியும் போதா, வீட்டுக்கு வந்த பிறகா?',
  },
  'பிருதுவின் சினம் சரியா, தவறா?': {
    source: 'offline',
    text:
      'கதை இதை எளிய "சரி / தவறு" ஆகப் பிரிக்கவில்லை. சினத்தின் காரணம் — மக்களின் பசி — நியாயமானது. ஆனால் சினம் தேர்ந்தெடுத்த வழி — பூமியை அழிப்பது — யாருடைய பசியையும் தீர்த்திருக்காது.\n\nஅவன் நின்று கேட்டபோதுதான் தீர்வு கிடைத்தது: நிலத்தைச் சமன் செய்து உழைப்பது. எனவே கதை சொல்வது: உணர்வு நியாயமாக இருக்கலாம்; செயல்தான் தேர்வு செய்யப்பட வேண்டியது.',
    followUp: 'உங்கள் வாழ்வில் "நியாயமான கோபம், தவறான வழி" என்று தோன்றிய ஒரு நிகழ்வு உண்டா?',
  },
  'கீதை 2.63-ஐ இன்னும் எளிமையாக விளக்குங்கள்': {
    source: 'offline',
    text:
      'ஒரு படிக்கட்டு போல நினைத்துக் கொள்ளுங்கள்:\n1. கோபம் வருகிறது.\n2. மனம் மங்குகிறது — ஒன்றை மட்டுமே பார்க்கிறோம்.\n3. நமக்குத் தெரிந்ததை மறக்கிறோம் — "இவர் என் அன்புக்குரியவர்" என்பதைக் கூட.\n4. நல்லது கெட்டது பிரித்தறியும் திறன் போகிறது.\n5. நம்மையே காயப்படுத்தும் செயலைச் செய்கிறோம்.\n\nஇந்தச் சங்கிலியை இரண்டாவது படியிலேயே நிறுத்த முடியும் — ஒரு இடைவெளி, ஒரு மூச்சு, ஒரு கேள்வி.',
  },
};

const ENDPOINT = process.env.EXPO_PUBLIC_WISDOM_URL;
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function aiConfigured() {
  return !!ENDPOINT;
}

/**
 * Asks the wisdom companion. Only the current question and the story context are sent —
 * no earlier chat history is forwarded between providers.
 */
export async function askWisdom(question: string, story: Story): Promise<WisdomReply> {
  const prepared = PREPARED[question.trim()];
  if (!ENDPOINT) {
    if (prepared) return prepared;
    return {
      source: 'offline',
      text:
        'உரையாடல் சேவை இன்னும் இணைக்கப்படவில்லை. மேலே உள்ள பரிந்துரைக் கேள்விகளின் விளக்கங்களை இப்போது பார்க்கலாம்.',
    };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}) },
      body: JSON.stringify({
        question,
        context: {
          storyTitle: story.title,
          purana: story.purana,
          source: story.source,
          summary: story.scenes.map((s) => s.lines.join(' ')).join(' '),
          verse: { ref: story.verse.ref, meaning: story.verse.meaning },
          wisdom: story.wisdom.map((w) => `${w.heading}: ${w.body}`),
        },
      }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as WisdomReply;
    return data;
  } catch {
    return prepared ?? { source: 'offline', text: 'இப்போது பதிலைப் பெற முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயலுங்கள்.' };
  }
}

/** Ask about any grounded content (a Gita verse, a mantra) with its own context. */
export async function askWithContext(question: string, context: Record<string, unknown>): Promise<WisdomReply> {
  if (!ENDPOINT) {
    return {
      source: 'offline',
      text: 'உரையாடல் சேவை இன்னும் இணைக்கப்படவில்லை. இந்தச் சுலோகத்தின் தமிழ் பொருளையும் விளக்கத்தையும் இப்போது படிக்கலாம்.',
    };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}) },
      body: JSON.stringify({ question, context }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as WisdomReply;
  } catch {
    return { source: 'offline', text: 'இப்போது பதிலைப் பெற முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயலுங்கள்.' };
  }
}
