import { NextResponse, type NextRequest } from "next/server";
import { ERROR_MESSAGES, chatWithBimo, createRateLimiter } from "../../../../supabase/functions/_shared/bimo";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Backend BIMO AI (DeepSeek) untuk `npm run dev` / Vercel.
 * API key dibaca dari DEEPSEEK_API_KEY di environment SERVER (tanpa awalan NEXT_PUBLIC_),
 * sehingga tidak pernah ikut terkirim ke browser.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allow = createRateLimiter(15, 5 * 60 * 1000); // 15 pesan / 5 menit per siswa (atau per IP di Mode Demo)

export async function POST(request: NextRequest) {
  let who = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  // Dengan Supabase: hanya siswa yang login.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized", message: ERROR_MESSAGES.unauthorized }, { status: 401 });
    who = user.id;
  }

  if (!allow(who)) return NextResponse.json({ error: "rate_limited", message: ERROR_MESSAGES.rate_limited }, { status: 429 });

  const body = await request.json().catch(() => null);
  const result = await chatWithBimo(body, {
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL,
    apiUrl: process.env.DEEPSEEK_API_URL,
  });
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
