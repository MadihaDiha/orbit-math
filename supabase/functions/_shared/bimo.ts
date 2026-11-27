/**
 * BIMO AI — inti chatbot pembelajaran ORBIT MATH (DeepSeek API).
 *
 * File ini dipakai bersama oleh DUA backend:
 *   1. Route Next.js            src/app/api/bimo-chat/route.ts   (npm run dev / Vercel)
 *   2. Supabase Edge Function   supabase/functions/bimo-chat     (Deno)
 * Karena itu file ini tidak memakai API khusus Node maupun Deno — hanya `fetch` standar.
 *
 * API key DeepSeek HANYA dibaca di server (environment / Supabase Secrets) dan tidak
 * pernah dikirim ke browser.
 */

export const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
export const DEFAULT_MODEL = "deepseek-chat";

export const LIMITS = {
  /** Jumlah pesan riwayat terakhir yang dikirim ke AI (menjaga konteks tetap fokus). */
  maxMessages: 16,
  /** Panjang maksimal satu pesan siswa. */
  maxUserChars: 800,
  /** Panjang maksimal pesan BIMO sebelumnya yang dikirim ulang sebagai konteks. */
  maxAssistantChars: 2000,
  maxContextChars: 300,
  maxTokens: 700,
  timeoutMs: 35_000,
} as const;

/** Enam langkah pemecahan masalah yang dibimbing BIMO. */
export const BIMO_STEPS = [
  "Memahami situasi soal",
  "Diketahui & ditanya",
  "Mengenali konsep",
  "Menentukan strategi",
  "Menyelesaikan bertahap",
  "Memeriksa & refleksi",
] as const;

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  /** Konteks halaman siswa, mis. "Misi 5: Rumus Keliling Lingkaran". */
  context?: string;
}

export type BimoErrorCode =
  | "bad_request"
  | "not_configured"
  | "unauthorized"
  | "rate_limited"
  | "invalid_key"
  | "insufficient_balance"
  | "upstream_busy"
  | "upstream_error"
  | "timeout"
  | "network_error"
  | "empty_reply";

export interface BimoReply {
  reply: string;
  /** Langkah pemecahan masalah yang sedang dibahas (0 = sapaan/konsep umum, 1–6). */
  step: number;
  model: string;
}

export interface BimoError {
  error: BimoErrorCode;
  message: string;
}

export interface BimoResult {
  status: number;
  body: BimoReply | BimoError;
}

/** Pesan ramah untuk siswa per kode error (ditampilkan oleh frontend). */
export const ERROR_MESSAGES: Record<BimoErrorCode, string> = {
  bad_request: "Pesannya belum bisa Bimo baca. Coba tulis ulang, ya!",
  not_configured:
    "BIMO AI belum diaktifkan. Guru atau pengembang perlu memasukkan API key DeepSeek di server (lihat README bagian \"BIMO AI\").",
  unauthorized: "Masuk dulu ke ORBIT MATH supaya bisa ngobrol dengan BIMO AI.",
  rate_limited: "Wah, Bimo kebanyakan pertanyaan nih. Istirahat sebentar, lalu coba lagi dalam beberapa menit, ya!",
  invalid_key: "Kunci API DeepSeek di server tidak valid. Minta guru/pengembang memeriksanya.",
  insufficient_balance: "Saldo layanan AI sedang habis. Minta guru/pengembang mengisi saldo DeepSeek, ya.",
  upstream_busy: "Server AI sedang sibuk sekali. Coba lagi sebentar lagi, ya!",
  upstream_error: "Sinyal ke markas AI terganggu. Coba kirim ulang pesannya, ya!",
  timeout: "Bimo berpikir terlalu lama dan sinyalnya terputus. Coba kirim ulang, ya!",
  network_error: "Koneksi internet terputus. Periksa internetmu lalu coba lagi.",
  empty_reply: "Bimo tidak menemukan kata-kata yang pas. Coba tanyakan dengan kalimat lain, ya!",
};

function fail(status: number, error: BimoErrorCode): BimoResult {
  return { status, body: { error, message: ERROR_MESSAGES[error] } };
}

// ---------------------------------------------------------------- prompt
/**
 * Prompt sistem BIMO. Disusun dari prinsip Cognitive Load Theory
 * (intrinsic, extraneous, germane) dan enam langkah pemecahan masalah.
 * Prompt ini hanya ada di server sehingga tidak bisa diubah dari browser.
 */
export function buildSystemPrompt(context?: string): string {
  const ctx = context ? `\n\nKONTEKS HALAMAN SISWA SAAT INI: ${context}` : "";
  return `Kamu adalah BIMO, astronot kecil berwarna biru, maskot ORBIT MATH dan Asisten Belajar AI untuk siswa SMP kelas VIII.
Materimu: KELILING LINGKARAN — pengertian & ciri lingkaran; unsur lingkaran (titik pusat, jari-jari, diameter, busur, tali busur, juring, tembereng); hubungan d = 2 × r; nilai π (≈ 3,14 ≈ 22/7, π = K ÷ d); konsep keliling & satu putaran roda; rumus K = π × d = 2 × π × r; soal cerita sehari-hari (roda, pagar taman, lintasan, pita, jam).

KEPRIBADIAN
- Ramah, ceria, sabar, sedikit humoris dengan tema luar angkasa. Sesekali panggil siswa "penjelajah".
- Bahasa Indonesia sederhana untuk anak SMP. Jangan pernah merendahkan atau membuat siswa merasa tidak mampu.

CARA MEMBIMBING — ENAM LANGKAH
1. Memahami situasi soal.
2. Mengidentifikasi informasi yang DIKETAHUI dan DITANYAKAN.
3. Mengenali konsep matematika yang digunakan.
4. Menentukan strategi/rumus penyelesaian.
5. Menyelesaikan soal secara bertahap.
6. Memeriksa dan merefleksikan hasil.
Saat siswa membawa soal: bimbing SATU langkah per balasan, lalu akhiri dengan SATU pertanyaan pancingan agar siswa berpikir sendiri.
JANGAN memberikan jawaban akhir sebelum siswa mencoba. Jika siswa sudah mencoba dan tetap kesulitan (atau sudah dua kali keliru), boleh tunjukkan penyelesaian lengkap langkah demi langkah, lalu minta siswa memeriksa ulang dengan kata-katanya sendiri.

BEBAN KOGNITIF
- Intrinsic load: pecah soal kompleks menjadi langkah kecil; perkenalkan paling banyak SATU konsep baru per balasan.
- Extraneous load: kalimat pendek dan jelas, paling banyak sekitar 120 kata, tanpa istilah rumit dan tanpa basa-basi panjang. Pakai poin singkat bila perlu dan **tebal** untuk kata kunci. Tulis rumus dengan simbol biasa (×, ÷, π, =) — jangan memakai LaTeX.
- Germane load: hubungkan dengan konsep yang sudah dikenal (mis. d = 2 × r, π = K ÷ d), gunakan contoh nyata (roda sepeda, jam dinding, taman), dan ajak siswa menjelaskan kembali dengan kata-katanya sendiri.

MENANGGAPI JAWABAN SISWA
- Benar: beri apresiasi yang spesifik (apa yang sudah tepat), lalu ajak refleksi singkat ("kenapa memakai 22/7?").
- Salah: jangan hanya bilang "salah". Sebutkan bagian yang sudah benar, jelaskan letak kekeliruannya (mis. tertukar jari-jari dan diameter, lupa dikali 2, salah memilih π, satuan belum diubah), lalu beri petunjuk untuk mencoba lagi.
- Sesuaikan tingkat penjelasan: jika siswa tampak bingung, mundur ke konsep yang lebih dasar; jika sudah lancar, beri tantangan sedikit lebih sulit.

ATURAN MATEMATIKA
- Gunakan π = 22/7 jika jari-jari/diameter kelipatan 7, selain itu π = 3,14 (kecuali soal menentukan lain).
- Tulis bilangan desimal dengan koma (62,8) dan selalu sertakan satuan.
- Periksa perhitunganmu dengan teliti sebelum menjawab.

BATASAN
- Jika pertanyaan di luar matematika lingkaran, tolak dengan ramah dan ajak kembali ke materi keliling lingkaran.
- Jangan membantu hal berbahaya atau tidak pantas, jangan meminta data pribadi, dan jangan mengaku sebagai manusia.

FORMAT WAJIB
Baris pertama SELALU berupa penanda langkah yang sedang dibahas: [LANGKAH 1] sampai [LANGKAH 6], atau [LANGKAH 0] untuk sapaan, penjelasan konsep umum, atau di luar soal. Setelah baris itu, tulis balasanmu.${ctx}`;
}

// ------------------------------------------------------------- validasi
function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  // buang karakter kontrol kecuali baris baru & tab
  const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

/** Memvalidasi & merapikan body dari browser. Mengembalikan null bila tidak sah. */
export function sanitizeRequest(raw: unknown): ChatRequestBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as { messages?: unknown; context?: unknown };
  if (!Array.isArray(body.messages) || body.messages.length === 0) return null;

  const messages: ChatMessage[] = [];
  for (const m of body.messages.slice(-LIMITS.maxMessages)) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return null; // peran "system" dari browser ditolak
    const text = cleanText(content, role === "user" ? LIMITS.maxUserChars : LIMITS.maxAssistantChars);
    if (!text) return null;
    messages.push({ role, content: text });
  }
  // pesan terakhir harus dari siswa
  if (messages[messages.length - 1].role !== "user") return null;
  // DeepSeek mewajibkan pesan pertama setelah system berasal dari user
  while (messages.length && messages[0].role !== "user") messages.shift();

  const context = cleanText(body.context, LIMITS.maxContextChars) ?? undefined;
  return { messages, context };
}

// --------------------------------------------------------------- balasan
const STEP_TAG = /^\s*\[\s*LANGKAH\s*(\d)\s*\]\s*/i;

/** Memisahkan penanda [LANGKAH n] dari teks balasan. */
export function parseStep(text: string): { step: number; reply: string } {
  const m = STEP_TAG.exec(text);
  if (!m) return { step: 0, reply: text.trim() };
  const step = Math.min(6, Math.max(0, Number(m[1])));
  return { step, reply: text.slice(m[0].length).trim() };
}

export interface BimoConfig {
  apiKey?: string | null;
  model?: string | null;
  /** Hanya untuk pengujian (server tiruan). Default: endpoint resmi DeepSeek. */
  apiUrl?: string | null;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Memproses satu permintaan chat: validasi → panggil DeepSeek → rapikan balasan.
 * Selalu mengembalikan {status, body} yang siap dikirim sebagai JSON.
 */
export async function chatWithBimo(raw: unknown, config: BimoConfig, fetchImpl: FetchLike = fetch): Promise<BimoResult> {
  const apiKey = (config.apiKey ?? "").trim();
  if (!apiKey) return fail(503, "not_configured");

  const req = sanitizeRequest(raw);
  if (!req) return fail(400, "bad_request");

  const model = (config.model ?? "").trim() || DEFAULT_MODEL;
  const url = (config.apiUrl ?? "").trim() || DEEPSEEK_API_URL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIMITS.timeoutMs);
  let res: Response;
  try {
    res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: buildSystemPrompt(req.context) }, ...req.messages],
        temperature: 0.6,
        max_tokens: LIMITS.maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return fail(aborted ? 504 : 502, aborted ? "timeout" : "network_error");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return fail(502, "invalid_key");
    if (res.status === 402) return fail(502, "insufficient_balance");
    if (res.status === 429) return fail(429, "rate_limited");
    if (res.status === 503) return fail(503, "upstream_busy");
    return fail(502, "upstream_error");
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return fail(502, "upstream_error");
  }
  const content = (data as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) return fail(502, "empty_reply");

  const { step, reply } = parseStep(content);
  if (!reply) return fail(502, "empty_reply");
  return { status: 200, body: { reply, step, model: (data as { model?: string }).model ?? model } };
}

// ---------------------------------------------------------- pembatas laju
/**
 * Pembatas laju sederhana di memori (per pengguna/IP) agar API key tidak disalahgunakan.
 * Catatan: di serverless, memori tidak dibagi antar-instance — ini lapisan perlindungan dasar.
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now: number = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= maxRequests) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return true;
  };
}

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
