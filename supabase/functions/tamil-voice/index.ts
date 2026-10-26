// Original preset voice with a calm Tamil delivery; no reference recording is uploaded.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};
const reply = (status: number) => new Response(null, { status, headers: cors });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return reply(204);
  if (req.method !== 'POST') return reply(405);
  try {
    const body = await req.text();
    if (body.length > 8000) return reply(413);
    let payload;
    try { payload = JSON.parse(body); } catch { return reply(400); }
    const text = payload?.text;
    if (typeof text !== 'string' || !text.trim() || text.length > 2000 ||
        !/[\u0B80-\u0BFF]/.test(text) || /[<>A-Za-z\u0900-\u097F]/.test(text)) return reply(400);
    const key = Deno.env.get('GEMINI_API_KEY');
    const url = Deno.env.get('SUPABASE_URL');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!key || !url || !service) return reply(503);
    // Share the existing atomic Gemini budget with text calls, rather than adding
    // an unrestricted speech allowance to the public mobile endpoint.
    const configured = Number(Deno.env.get('GEMINI_DAILY_LIMIT') ?? 20);
    const limit = Number.isFinite(configured) ? Math.max(0, Math.min(1000, Math.floor(configured))) : 20;
    const quota = await fetch(`${url}/rest/v1/rpc/reserve_provider_request`, {
      method: 'POST', signal: AbortSignal.timeout(4000),
      headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_name: 'gemini', daily_limit: limit }),
    });
    if (!quota.ok || await quota.json() !== true) return reply(429);
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST', signal: AbortSignal.timeout(25000),
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3.8-flash-lite-tts', store: false,
        input: [{ type: 'user_input', content: [{ type: 'text', text: text.trim(), annotations: [{
          type: 'speech_metadata',
          style: 'Warm, calm, reassuring, dignified Tamil voice. Clear natural Tamil pronunciation, gentle measured pace, short pauses between sentences. Speak the transcript exactly. No music or sound effects.',
        }] }] }],
        response_format: { type: 'audio' },
        generation_config: { speech_config: [{ voice: 'Kore' }] },
      }),
    });
    if (!response.ok) return reply(503);
    const result = await response.json();
    const audio = result.steps?.filter((step: { type: string }) => step.type === 'model_output')
      .flatMap((step: { content?: { type: string; data?: string }[] }) => step.content ?? [])
      .find((part: { type: string; data?: string }) => part.type === 'audio');
    if (typeof audio?.data !== 'string' || audio.data.length > 12000000) return reply(503);
    const bytes = Uint8Array.from(atob(audio.data), c => c.charCodeAt(0));
    if (String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF' || String.fromCharCode(...bytes.slice(8, 12)) !== 'WAVE') return reply(503);
    return new Response(bytes, { headers: { ...cors, 'Content-Type': 'audio/wav' } });
  } catch {
    // Do not log personal text, upstream payloads or credentials.
    return reply(503);
  }
});
