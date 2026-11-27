"use client";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { ERROR_MESSAGES, LIMITS, type BimoErrorCode, type BimoReply, type ChatMessage } from "../../supabase/functions/_shared/bimo";

/**
 * Klien BIMO AI di browser. TIDAK pernah menyimpan atau mengirim API key —
 * hanya memanggil backend milik ORBIT MATH:
 *   - "next"     → POST /api/bimo-chat              (default; npm run dev / Vercel)
 *   - "supabase" → Supabase Edge Function bimo-chat (NEXT_PUBLIC_BIMO_AI_BACKEND=supabase)
 * Situs statis GitHub Pages tidak punya server, sehingga BIMO AI menampilkan pesan konfigurasi.
 */
export type ClientErrorCode = BimoErrorCode | "static_site";

export class BimoClientError extends Error {
  constructor(
    public code: ClientErrorCode,
    message: string,
  ) {
    super(message);
  }
}

const STATIC_MESSAGE =
  "BIMO AI butuh server agar API key tetap aman, sedangkan versi demo ini adalah situs statis (GitHub Pages). Jalankan ORBIT MATH dengan `npm run dev` atau di Vercel/Supabase untuk mengaktifkannya — lihat README bagian \"BIMO AI\".";

export function bimoBackend(): "next" | "supabase" | "static" {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true") return "static";
  return process.env.NEXT_PUBLIC_BIMO_AI_BACKEND === "supabase" && isSupabaseConfigured() ? "supabase" : "next";
}

function toError(payload: unknown, fallback: ClientErrorCode): BimoClientError {
  const p = payload as { error?: string; message?: string } | null;
  const code = (p?.error as ClientErrorCode) ?? fallback;
  return new BimoClientError(code, p?.message ?? ERROR_MESSAGES[code as BimoErrorCode] ?? ERROR_MESSAGES.upstream_error);
}

/** Mengirim percakapan ke backend dan mengembalikan balasan BIMO. */
export async function askBimo(messages: ChatMessage[], context?: string): Promise<BimoReply> {
  const backend = bimoBackend();
  if (backend === "static") throw new BimoClientError("static_site", STATIC_MESSAGE);

  const body = { messages: messages.slice(-LIMITS.maxMessages), context };

  if (backend === "supabase") {
    const { data, error } = await createClient().functions.invoke("bimo-chat", { body });
    if (error) {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") throw toError(await ctx.json().catch(() => null), "upstream_error");
      throw new BimoClientError("network_error", ERROR_MESSAGES.network_error);
    }
    return data as BimoReply;
  }

  let res: Response;
  try {
    res = await fetch("/api/bimo-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new BimoClientError("network_error", ERROR_MESSAGES.network_error);
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw toError(payload, res.status === 404 ? "not_configured" : "upstream_error");
  return payload as BimoReply;
}

// ------------------------------------------------------------ riwayat chat
export interface StoredMessage extends ChatMessage {
  id: string;
  step?: number;
  at: string;
}

const MAX_HISTORY = 60;
const keyFor = (owner: string) => `orbit-math-bimo-chat-v1:${owner}`;

export function loadHistory(owner: string): StoredMessage[] {
  try {
    const raw = window.localStorage.getItem(keyFor(owner));
    const parsed = raw ? (JSON.parse(raw) as StoredMessage[]) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") : [];
  } catch {
    return [];
  }
}

export function saveHistory(owner: string, messages: StoredMessage[]) {
  try {
    window.localStorage.setItem(keyFor(owner), JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {
    // penyimpanan penuh/diblokir: riwayat tetap ada selama tab terbuka
  }
}

export function clearHistory(owner: string) {
  try {
    window.localStorage.removeItem(keyFor(owner));
  } catch {
    /* abaikan */
  }
}
