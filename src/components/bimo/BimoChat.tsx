"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { Send, Trash2, WifiOff, X } from "lucide-react";
import { BIMO_STEPS, LIMITS } from "../../../supabase/functions/_shared/bimo";
import { BimoClientError, askBimo, bimoBackend, clearHistory, loadHistory, loadTutorState, saveHistory, saveTutorState, type StoredMessage } from "@/lib/bimo-ai";
import { EMPTY_TUTOR, tutorReply, type TutorState } from "@/lib/bimo-tutor";
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

const OFFLINE_NOTICE: Record<string, string> = {
  static_site: "Mode Offline: versi demo ini tidak memakai AI internet, tapi Bimo tetap membimbingmu langkah demi langkah — gratis!",
  not_configured: "Mode Offline: AI online belum diaktifkan, jadi Bimo memakai bimbingan offline (gratis).",
  invalid_key: "Mode Offline: kunci Gemini API bermasalah, jadi Bimo memakai bimbingan offline.",
  rate_limited: "Kuota gratis Gemini sedang penuh — sementara Bimo memakai bimbingan offline.",
  default: "AI online sedang tidak bisa dihubungi — Bimo memakai bimbingan offline dulu.",
};

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Panel chat BIMO AI: Google Gemini (free tier) dengan cadangan otomatis BIMO Tutor Offline. */
export function BimoChat({ owner, onClose }: { owner: string; onClose: () => void }) {
  const pathname = usePathname() || "/";
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** Status bimbingan BIMO Tutor Offline (dipakai saat AI online tidak tersedia). */
  const tutorRef = useRef<TutorState>(EMPTY_TUTOR);
  /** AI online dimatikan untuk sesi ini bila belum dikonfigurasi / saldo habis / situs statis. */
  const aiOffRef = useRef<string | null>(bimoBackend() === "static" ? "static_site" : null);

  // Riwayat percakapan & status bimbingan per siswa
  useEffect(() => {
    setMessages(loadHistory(owner));
    tutorRef.current = loadTutorState(owner, EMPTY_TUTOR);
  }, [owner]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, notice]);

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
    setLoading(true);

    const push = (reply: StoredMessage) => {
      const withReply = [...next, reply];
      setMessages(withReply);
      saveHistory(owner, withReply);
      playSfx("star");
    };

    /** BIMO Tutor Offline: gratis, tanpa internet — cadangan bila AI online tidak tersedia. */
    const answerOffline = (reason: string | null) => {
      const r = tutorReply(tutorRef.current, content);
      tutorRef.current = r.state;
      saveTutorState(owner, r.state);
      if (reason) setNotice(OFFLINE_NOTICE[reason] ?? OFFLINE_NOTICE.default);
      push({ id: newId(), role: "assistant", content: r.reply, step: r.step, offline: true, at: new Date().toISOString() });
    };

    try {
      if (aiOffRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 450)); // jeda kecil agar terasa seperti berpikir
        answerOffline(aiOffRef.current);
        return;
      }
      const res = await askBimo(
        next.map(({ role, content: c }) => ({ role, content: c })),
        pageContext(pathname),
      );
      push({ id: newId(), role: "assistant", content: res.reply, step: res.step, at: new Date().toISOString() });
    } catch (e) {
      const code = e instanceof BimoClientError ? e.code : "network_error";
      // Pertanyaan ditolak filter keamanan Gemini → jawab sopan, tanpa pindah ke mode offline
      if (code === "blocked") {
        push({ id: newId(), role: "assistant", content: (e as BimoClientError).message, step: 0, at: new Date().toISOString() });
        return;
      }
      // Masalah konfigurasi/saldo tidak akan hilang sendiri → pakai mode offline selama sesi ini
      if (["not_configured", "static_site", "invalid_key", "unauthorized"].includes(code)) aiOffRef.current = code;
      answerOffline(code);
    } finally {
      setLoading(false);
    }
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
    tutorRef.current = EMPTY_TUTOR;
    setMessages([]);
    setNotice(null);
  };

  const lastBimo = [...messages].reverse().find((m) => m.role === "assistant");
  const offlineMode = Boolean(lastBimo?.offline);

  return (
    <div
      className="speech-in pointer-events-auto fixed inset-x-2 bottom-24 z-50 flex max-h-[72vh] flex-col overflow-hidden rounded-3xl border border-ice/40 bg-deep/95 shadow-[0_0_50px_-12px_rgba(98,229,245,0.8)] backdrop-blur sm:inset-x-auto sm:bottom-28 sm:right-6 sm:w-[400px]"
      role="dialog"
      aria-label="Chat dengan BIMO AI"
    >
      {/* Kepala panel */}
      <div className="flex items-center gap-3 border-b border-ice/15 bg-gradient-to-r from-royal/60 to-deep/80 px-4 py-3">
        <Bimo mood={loading ? "thinking" : "happy"} action={loading ? "think" : "idle"} talking={loading} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-hud text-sm font-black tracking-wider">BIMO AI</p>
          <p className="truncate text-[11px] text-soft/60">{loading ? "Bimo sedang berpikir..." : offlineMode ? "Mode Offline · gratis" : "Asisten belajar Keliling Lingkaran"}</p>
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
        {notice && (
          <p className="flex items-start gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold" role="status">
            <WifiOff size={14} className="mt-0.5 shrink-0" /> {notice}
          </p>
        )}

        {messages.length === 0 && (
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
              {m.offline && <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-soft/50"><WifiOff size={10} /> Mode Offline</span>}
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
