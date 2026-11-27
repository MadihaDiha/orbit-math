// Supabase Edge Function: BIMO AI (Google Gemini, free tier).
// Deploy : npx supabase functions deploy bimo-chat
// Secret : npx supabase secrets set GEMINI_API_KEY=...   (opsional: GEMINI_MODEL=gemini-3.5-flash-lite)
// Hanya siswa yang sudah login (JWT pengguna Supabase) yang dapat memakai fungsi ini.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { CORS_HEADERS, ERROR_MESSAGES, chatWithBimo, configFromEnv, createRateLimiter } from "../_shared/bimo.ts";

const allow = createRateLimiter(15, 5 * 60 * 1000); // 15 pesan / 5 menit per siswa

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "bad_request", message: ERROR_MESSAGES.bad_request }, 405);

  // Pastikan pemanggil adalah siswa yang login (bukan sekadar anon key publik).
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return json({ error: "unauthorized", message: ERROR_MESSAGES.unauthorized }, 401);

  if (!allow(data.user.id)) return json({ error: "rate_limited", message: ERROR_MESSAGES.rate_limited }, 429);

  const body = await req.json().catch(() => null);
  const result = await chatWithBimo(body, configFromEnv((name) => Deno.env.get(name)));
  return json(result.body, result.status);
});
