// Supabase Edge Function: POST /functions/v1/wisdom
// Tries free-tier providers in order: Gemini → Groq → OpenRouter. Keys live only in
// Supabase secrets (never in the app). Each provider gets only the current question and
// story context — no earlier conversation is forwarded when switching providers.
//
//   supabase secrets set GEMINI_API_KEY=... GROQ_API_KEY=... OPENROUTER_API_KEY=...
//   optional: GEMINI_MODEL, GROQ_MODEL, OPENROUTER_MODEL
//   supabase functions deploy wisdom

const SYSTEM = `நீங்கள் "Divine Life" செயலியின் ஞானத் துணை. நீங்கள் ஒரு AI; தெய்வமோ குருவோ அல்ல — அப்படிப் பேசாதீர்கள்.
விதிகள்:
- எளிய, அன்பான தமிழில் பதில் சொல்லுங்கள் (6–10 வரிகள்).
- கொடுக்கப்பட்ட கதை, சுலோகம், ஞானக் குறிப்புகளை மட்டுமே மேற்கோளாகப் பயன்படுத்துங்கள். இல்லாத சுலோகத்தையோ நூல் மேற்கோளையோ உருவாக்காதீர்கள்.
- கேள்வி கற்பனையானதா, தனிப்பட்டதா என்பதை மதியுங்கள்; கற்பனைக் கேள்வியை பயனருடையதாக மாற்றாதீர்கள்.
- தேவைப்பட்டால் ஒரு தெளிவுபடுத்தும் கேள்வி கேளுங்கள் ("followUp").
- ஒரு சிறிய, விருப்பமான அடுத்த செயலை மட்டும் பரிந்துரையுங்கள்.
- உறுதிமொழிகள் (பாதுகாப்பு, அதிசய பலன், மோட்சம்) தர வேண்டாம். பயமுறுத்தவோ குற்ற உணர்வு ஊட்டவோ வேண்டாம்.
- மருத்துவ, சட்ட, நிதி அல்லது அவசர நிலை என்றால், தகுந்த நிபுணரை / நம்பிக்கையான மனிதரை அணுகப் பரிந்துரையுங்கள்.
பதிலை JSON ஆக மட்டும் தாருங்கள்: {"text": "...", "followUp": "... அல்லது வெறுமை"}`;

type Ctx = Record<string, unknown>;

function userPrompt(question: string, context: Ctx) {
  return `கதைச் சூழல் (நம்பகமான மூலம்):\n${JSON.stringify(context)}\n\nபயனரின் கேள்வி:\n${question}`;
}

function parse(raw: string) {
  const m = raw.match(/\{[\s\S]*\}/);
  try {
    const j = JSON.parse(m ? m[0] : raw);
    return { text: String(j.text ?? '').trim(), followUp: j.followUp ? String(j.followUp) : undefined };
  } catch {
    return { text: raw.trim() };
  }
}

async function gemini(q: string, c: Ctx) {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('no key');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt(q, c) }] }],
      generationConfig: { temperature: 0.6, responseMimeType: 'application/json' },
    }),
  });
  if (!r.ok) throw new Error(`gemini ${r.status}`);
  const j = await r.json();
  return parse(j.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
}

async function openaiCompatible(url: string, key: string | undefined, model: string, q: string, c: Ctx) {
  if (!key) throw new Error('no key');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt(q, c) },
      ],
    }),
  });
  if (!r.ok) throw new Error(`${url} ${r.status}`);
  const j = await r.json();
  return parse(j.choices?.[0]?.message?.content ?? '');
}

const providers: [string, (q: string, c: Ctx) => Promise<{ text: string; followUp?: string }>][] = [
  ['gemini', gemini],
  ['groq', (q, c) => openaiCompatible('https://api.groq.com/openai/v1/chat/completions', Deno.env.get('GROQ_API_KEY'), Deno.env.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile', q, c)],
  [
    'openrouter',
    (q, c) =>
      openaiCompatible('https://openrouter.ai/api/v1/chat/completions', Deno.env.get('OPENROUTER_API_KEY'), Deno.env.get('OPENROUTER_MODEL') ?? 'meta-llama/llama-3.3-70b-instruct:free', q, c),
  ],
];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const { question, context } = await req.json().catch(() => ({}));
  if (!question || typeof question !== 'string' || question.length > 1200) {
    return new Response(JSON.stringify({ error: 'bad question' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
  for (const [name, call] of providers) {
    try {
      const out = await call(question, context ?? {});
      if (out.text) return new Response(JSON.stringify({ ...out, source: name }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch (_e) {
      // fall through to the next free provider
    }
  }
  return new Response(JSON.stringify({ text: 'இப்போது எந்த AI சேவையும் கிடைக்கவில்லை. சற்று நேரம் கழித்து முயலுங்கள்.', source: 'none' }), {
    status: 503,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
