"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { RotateCcw, Send, Trash2, X } from "lucide-react";
import { BIMO_STEPS, LIMITS } from "../../../supabase/functions/_shared/bimo";
import { BimoClientError, askBimo, clearHistory, loadHistory, saveHistory, type StoredMessage } from "@/lib/bimo-ai";
import { getMission } from "@/content/missions";
import { PLANETS } from "@/content/planets";
import { playSfx } from "@/lib/sound";
import { Bimo } from "./Bimo";

const QUICK_PROMPTS = [
  "Jelaskan rumus keliling lingkaran dengan sederhana",
  "Bantu aku mengerjakan soal keliling langkah demi langkah",
  "Apa bedanya jari-jari dan diameter?",
  "Beri aku satu soal latihan keliling lingkaran",
];

const PAGE_NAMES: Record<string, string> = {
  dashboard: "Control Center (dashboard)",
  galaxy: "Peta Perjalanan Galaksi",
  lab: "Circle Laboratory (simulasi lingkaran & kalkulator keliling)",
  training: "Training Zone (latihan soal)",
  playground: "Cosmic Playground (mini game)",
  exam: "Final Examination — bimbing dengan petunjuk saja, jangan berikan jawaban soal ujian",
  pretest: "Pre-test — beri petunjuk umum saja, jangan berikan jawaban",
  posttest: "Post-test — beri petunjuk umum saja, jangan berikan jawaban",
  results: "Hasil Akhir",
};

/** Konteks halaman agar BIMO tetap terhubung dengan materi yang sedang dipelajari. */
function pageContext(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "missions" && parts[1]) {
    const m = getMission(parts[1]);
    if (m) return `Misi ${m.id} (${PLANETS[m.id - 1]?.name ?? m.planet}): ${m.title}. Tujuan: ${m.objectives.slice(0, 2).join("; ")}`;
  }
  return PAGE_NAMES[parts[0]] ?? "Halaman ORBIT MATH";
}

/** Merender teks balasan dengan format sederhana yang aman (tanpa HTML mentah): **tebal**, `kode`, daftar. */
function MessageText({ text }: { text: string }) {
  const inline = (line: string, key: string): ReactNode[] =>
    line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <b key={`${key}-${i}`} className="text-ice">{part.slice(2, -2)}</b>;
      if (part.startsWith("`") && part.endsWith("`")) return <code key={`${key}-${i}`} className="rounded bg-navy/70 px-1 font-hud text-[0.85em] text-gold">{part.slice(1, -1)}</code>;
      return <span key={`${key}-${i}`}>{part.replace(/\*\*/g, "")}</span>;
    });

  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `l${blocks.length}-${i}`)}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={`b${blocks.length}`} className="ml-5 list-decimal space-y-0.5">{items}</ol>
      ) : (
        <ul key={`b${blocks.length}`} className="ml-5 list-disc space-y-0.5">{items}</ul>
      ),
    );
    list = null;
  };

  for (const raw of text.split("\n")) {
    const line = raw.replace(/^#{1,6}\s+/, "").trimEnd();
    const bullet = /^\s*[-•*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flush();
    if (line.trim()) blocks.push(<p key={`b${blocks.length}`}>{inline(line, `p${blocks.length}`)}</p>);
  }
  flush();
  return <div className="space-y-1.5">{blocks}</div>;
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Panel chat BIMO AI (DeepSeek) dengan riwayat, langkah pemecahan masalah, loading, dan error ramah. */
export function BimoChat({ owner, onClose }: { owner: string; onClose: () => void }) {
  const pathname = usePathname() || "/";
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Riwayat percakapan per siswa
  useEffect(() => {
    setMessages(loadHistory(owner));
  }, [owner]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const currentStep = [...messages].reverse().find((m) => m.role === "assistant")?.step ?? 0;

  const send = async (text: string, base: StoredMessage[] = messages) => {
    const content = text.trim().slice(0, LIMITS.maxUserChars);
    if (!content || loading) return;
    playSfx("select");
    const userMsg: StoredMessage = { id: newId(), role: "user", content, at: new Date().toISOString() };
    const next = [...base, userMsg];
    setMessages(next);
    saveHistory(owner, next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await askBimo(
        next.map(({ role, content: c }) => ({ role, content: c })),
        pageContext(pathname),
      );
      const reply: StoredMessage = { id: newId(), role: "assistant", content: res.reply, step: res.step, at: new Date().toISOString() };
      const withReply = [...next, reply];
      setMessages(withReply);
      saveHistory(owner, withReply);
      playSfx("star");
    } catch (e) {
      const err = e instanceof BimoClientError ? e : new BimoClientError("network_error", "Koneksi ke BIMO AI gagal. Coba lagi, ya!");
      setError({ code: err.code, message: err.message });
      playSfx("wrong");
    } finally {
      setLoading(false);
    }
  };

  /** Kirim ulang pesan terakhir siswa setelah gagal. */
  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.lastIndexOf(lastUser);
    void send(lastUser.content, messages.slice(0, idx));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const reset = () => {
    clearHistory(owner);
    setMessages([]);
    setError(null);
  };

  const configProblem = error && (error.code === "not_configured" || error.code === "static_site" || error.code === "invalid_key" || error.code === "insufficient_balance");

  return (
    <div
      className="speech-in pointer-events-auto fixed inset-x-2 bottom-24 z-50 flex max-h-[72vh] flex-col overflow-hidden rounded-3xl border border-ice/40 bg-deep/95 shadow-[0_0_50px_-12px_rgba(98,229,245,0.8)] backdrop-blur sm:inset-x-auto sm:bottom-28 sm:right-6 sm:w-[400px]"
      role="dialog"
      aria-label="Chat dengan BIMO AI"
    >
      {/* Kepala panel */}
      <div className="flex items-center gap-3 border-b border-ice/15 bg-gradient-to-r from-royal/60 to-deep/80 px-4 py-3">
        <Bimo mood={loading ? "thinking" : error ? "oops" : "happy"} action={loading ? "think" : "idle"} talking={loading} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-hud text-sm font-black tracking-wider">BIMO AI</p>
          <p className="truncate text-[11px] text-soft/60">{loading ? "Bimo sedang berpikir..." : "Asisten belajar Keliling Lingkaran"}</p>
        </div>
        <button type="button" onClick={reset} className="rounded-full p-2 text-soft/50 hover:bg-white/10 hover:text-soft" aria-label="Mulai percakapan baru" title="Mulai percakapan baru">
          <Trash2 size={16} />
        </button>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-soft/60 hover:bg-white/10" aria-label="Tutup chat">
          <X size={18} />
        </button>
      </div>

      {/* Langkah pemecahan masalah (penanda bimbingan bertahap) */}
      <ol className="flex gap-1 border-b border-ice/10 px-3 py-2" aria-label="Langkah pemecahan masalah">
        {BIMO_STEPS.map((s, i) => {
          const n = i + 1;
          const active = currentStep === n;
          const done = currentStep > n;
          return (
            <li key={s} title={`Langkah ${n}: ${s}`} className="flex flex-1 flex-col items-center gap-0.5">
              <span className={`h-1.5 w-full rounded-full ${active ? "bg-gold shadow-[0_0_8px_#FFD76A]" : done ? "bg-ice/70" : "bg-white/10"}`} />
              <span className={`text-[9px] font-bold leading-none ${active ? "text-gold" : "text-soft/40"}`}>{n}</span>
            </li>
          );
        })}
      </ol>
      {currentStep > 0 && <p className="px-4 pt-1.5 text-[11px] font-bold text-gold">Langkah {currentStep}: {BIMO_STEPS[currentStep - 1]}</p>}

      {/* Pesan */}
      <div ref={listRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
        {messages.length === 0 && !error && (
          <div className="space-y-3">
            <div className="rounded-2xl rounded-tl-md bg-royal/30 px-3.5 py-2.5 text-sm">
              Halo, penjelajah! Aku <b className="text-ice">BIMO AI</b>. Tanyakan apa saja tentang <b className="text-ice">keliling lingkaran</b>, atau kirim soal yang sedang kamu kerjakan — kita pecahkan bersama, langkah demi langkah! 🚀
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} type="button" onClick={() => void send(q)} className="rounded-full border border-ice/30 bg-white/5 px-3 py-1.5 text-left text-xs font-semibold hover:border-ice hover:bg-ice/10">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="ml-8 whitespace-pre-wrap rounded-2xl rounded-tr-md bg-neon/80 px-3.5 py-2.5 text-sm font-semibold text-white">
              {m.content}
            </div>
          ) : (
            <div key={m.id} className="mr-6 rounded-2xl rounded-tl-md border border-ice/15 bg-royal/30 px-3.5 py-2.5 text-sm leading-relaxed">
              <MessageText text={m.content} />
            </div>
          ),
        )}

        {loading && (
          <div className="mr-6 flex items-center gap-2 rounded-2xl rounded-tl-md bg-royal/30 px-3.5 py-3 text-sm text-soft/70" role="status">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-ice" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            Bimo sedang berpikir...
          </div>
        )}

        {error && (
          <div className={`rounded-2xl border px-3.5 py-3 text-sm ${configProblem ? "border-gold/40 bg-gold/10 text-gold" : "border-rose-300/40 bg-rose-500/10 text-rose-100"}`} role="alert">
            <p>{error.message}</p>
            {!configProblem && messages.some((m) => m.role === "user") && (
              <button type="button" onClick={retry} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-current px-3 py-1 text-xs font-bold hover:bg-white/10">
                <RotateCcw size={13} /> Coba lagi
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t border-ice/15 p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="bimo-chat-input" className="sr-only">Pesan untuk BIMO</label>
          <textarea
            id="bimo-chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, LIMITS.maxUserChars))}
            onKeyDown={onKey}
            placeholder="Tulis pertanyaan atau jawabanmu..."
            className="input max-h-28 min-h-[44px] resize-none py-2.5 text-sm"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary h-11 w-11 shrink-0 p-0" aria-label="Kirim pesan">
            <Send size={18} />
          </button>
        </div>
        <p className="mt-1.5 flex justify-between text-[10px] text-soft/40">
          <span>BIMO AI bisa keliru — selalu cek lagi dengan rumus, ya.</span>
          <span>{input.length}/{LIMITS.maxUserChars}</span>
        </p>
      </form>
    </div>
  );
}
