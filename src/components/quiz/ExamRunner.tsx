"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Flag, ListChecks, Play, RotateCcw, Send } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { scoreMessage } from "@/lib/bimo-lines";
import type { GivenAnswer, QuizResult, StartedQuiz } from "@/lib/types";
import { QuestionInput, describeAnswer, isAnswered } from "./QuestionInput";
import { ReviewList } from "./ReviewList";
import { BimoSays } from "@/components/bimo/BimoSays";
import { Bimo } from "@/components/bimo/Bimo";
import { ErrorPanel, Spinner } from "@/components/ui/Spinner";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { useReward } from "@/components/reward/RewardProvider";

type Phase = "setup" | "running" | "review" | "result";

const COUNTS = [10, 15, 20];

function formatClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Final Examination: navigasi nomor, tandai soal, periksa ulang, kumpulkan, pembahasan. */
export function ExamRunner() {
  const { celebrate } = useReward();
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(20);
  const [useTimer, setUseTimer] = useState(true);
  const [quiz, setQuiz] = useState<StartedQuiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GivenAnswer>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [remaining, setRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      const limit = useTimer ? Math.round(count * 90) : undefined; // 1,5 menit per soal
      const started = await rpc.startQuiz("exam", count, limit);
      setQuiz(started);
      setAnswers({});
      setFlags(new Set());
      setIndex(0);
      setRemaining(started.time_limit_seconds);
      setPhase("running");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = useCallback(async () => {
    if (!quiz || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    try {
      const res = await rpc.submitQuiz(quiz.session_id, answers);
      setResult(res);
      setPhase("result");
      celebrate({ xp: res.xp_earned, achievements: res.new_achievements });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }, [quiz, answers, celebrate]);

  // Timer (opsional) — otomatis mengumpulkan saat waktu habis.
  useEffect(() => {
    if ((phase !== "running" && phase !== "review") || remaining === null) return;
    if (remaining <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [phase, remaining, submit]);

  // Peringatan saat meninggalkan halaman ketika evaluasi berlangsung.
  useEffect(() => {
    if (phase !== "running" && phase !== "review") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  if (error) return <ErrorPanel message={error} onRetry={() => { setError(null); setPhase("setup"); }} />;

  if (phase === "setup") {
    return (
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
        <div className="panel space-y-5 p-6">
          <div>
            <p className="label">Jumlah soal</p>
            <div className="flex gap-2">
              {COUNTS.map((c) => (
                <button key={c} type="button" onClick={() => setCount(c)} className={`choice w-auto justify-center px-5 ${count === c ? "choice-selected" : ""}`} aria-pressed={count === c}>
                  {c} soal
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/5 p-4">
            <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} className="h-5 w-5 accent-[#62E5F5]" />
            <span>
              <span className="font-bold">Gunakan timer</span>
              <span className="block text-sm text-soft/70">{useTimer ? `${Math.round(count * 1.5)} menit (1,5 menit per soal). Jawaban otomatis terkumpul saat waktu habis.` : "Tanpa batas waktu."}</span>
            </span>
          </label>
          <ul className="space-y-1.5 text-sm text-soft/80">
            <li>• Soal diambil acak dari seluruh materi (pilihan ganda, isian, identifikasi, perhitungan, soal cerita).</li>
            <li>• Kunci jawaban tidak ditampilkan selama evaluasi berlangsung.</li>
            <li>• Kamu bisa menandai soal dan memeriksa ulang sebelum mengumpulkan.</li>
            <li>• Nilai lulus 70. Hasil & pembahasan tersimpan di riwayat.</li>
          </ul>
          <button type="button" onClick={begin} disabled={busy} className="btn-gold w-full sm:w-auto">
            {busy ? <Spinner /> : <Play size={18} />} Mulai Final Examination
          </button>
        </div>
        <div className="hidden lg:block">
          <Bimo mood="wave" size={180} float />
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const msg = scoreMessage(result.score, result.pass_score);
    const wrong = result.review.filter((r) => !r.is_correct).length;
    return (
      <div className="space-y-6">
        <div className="panel animate-pop-in grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <ProgressRing value={result.score} size={150} stroke={12} color={result.passed ? "#FFD76A" : "#62E5F5"}>
            <span>
              <span className="block font-hud text-4xl font-black">{result.score}</span>
              <span className="text-xs text-soft/60">nilai</span>
            </span>
          </ProgressRing>
          <div className="space-y-3">
            <p className="eyebrow">{result.passed ? "Misi berhasil" : "Misi belum berhasil"}</p>
            <h3 className="font-hud text-2xl font-black">{result.passed ? "Galaxy Champion!" : "Ayo coba lagi, penjelajah!"}</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="chip border-emerald-300/40 bg-emerald-400/10 text-emerald-200">✓ {result.correct} benar</span>
              <span className="chip border-rose-300/40 bg-rose-400/10 text-rose-200">✗ {wrong} salah</span>
              <span className="chip">Nilai lulus {result.pass_score}</span>
              {result.xp_earned > 0 && <span className="chip border-gold/50 bg-gold/15 text-gold">+{result.xp_earned} XP</span>}
            </div>
            <BimoSays mood={msg.mood} size={64} float={false}>{msg.text}</BimoSays>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => { setResult(null); setPhase("setup"); }} className="btn-primary"><RotateCcw size={16} /> Ulangi evaluasi</button>
              <Link href="/history" className="btn-ghost">Lihat riwayat</Link>
            </div>
          </div>
        </div>
        <h3 className="font-hud text-xl font-black">Pembahasan</h3>
        <ReviewList items={result.review} />
      </div>
    );
  }

  if (!quiz) return null;
  const total = quiz.questions.length;
  const answeredCount = quiz.questions.filter((q) => isAnswered(q, answers[String(q.id)])).length;
  const lowTime = remaining !== null && remaining <= 60;

  const header = (
    <div className="panel-hud sticky top-16 z-20 flex flex-wrap items-center gap-3 px-4 py-3 sm:top-20">
      <span className="font-hud text-sm font-bold">{answeredCount}/{total} terjawab</span>
      <ProgressBar value={answeredCount} max={total} className="min-w-[120px] flex-1" />
      {remaining !== null && (
        <span className={`flex items-center gap-1.5 font-hud text-lg font-black ${lowTime ? "animate-pulse text-rose-300" : "text-ice"}`} aria-live={lowTime ? "assertive" : "off"}>
          <Clock size={18} /> {formatClock(Math.max(0, remaining))}
        </span>
      )}
    </div>
  );

  if (phase === "review") {
    return (
      <div className="space-y-5">
        {header}
        <div className="panel p-5 sm:p-6">
          <h3 className="font-hud text-xl font-black">Periksa kembali jawabanmu</h3>
          <p className="mt-1 text-sm text-soft/70">Ketuk nomor untuk mengubah jawaban. Kunci jawaban baru muncul setelah dikumpulkan.</p>
          <ul className="mt-4 divide-y divide-white/5">
            {quiz.questions.map((q, i) => {
              const a = answers[String(q.id)];
              const done = isAnswered(q, a);
              return (
                <li key={q.id}>
                  <button type="button" onClick={() => { setIndex(i); setPhase("running"); }} className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/5">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${done ? "bg-neon" : "bg-rose-500/30 text-rose-100"}`}>{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{q.prompt}</span>
                      <span className={`block truncate text-xs ${done ? "text-soft/60" : "text-rose-200"}`}>{done ? describeAnswer(q, a) : "Belum dijawab"}</span>
                    </span>
                    {flags.has(q.id) && <Flag size={16} className="text-gold" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {answeredCount < total && <p className="mt-4 rounded-xl bg-gold/10 px-3 py-2 text-sm text-gold">Masih ada {total - answeredCount} soal kosong. Soal kosong dihitung salah.</p>}
          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setPhase("running")} className="btn-ghost"><ArrowLeft size={16} /> Kembali mengerjakan</button>
            <button type="button" onClick={submit} disabled={busy} className="btn-gold">{busy ? <Spinner /> : <Send size={16} />} Kumpulkan sekarang</button>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[index];
  return (
    <div className="space-y-5">
      {header}
      <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
        <div key={q.id} className="panel animate-slide-up p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-hud text-sm font-bold text-ice">SOAL {index + 1}</span>
            <button
              type="button"
              onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; })}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${flags.has(q.id) ? "bg-gold text-navy" : "border border-gold/40 text-gold"}`}
              aria-pressed={flags.has(q.id)}
            >
              <Flag size={14} /> {flags.has(q.id) ? "Ditandai" : "Tandai ragu"}
            </button>
          </div>
          <QuestionInput
            question={q}
            value={answers[String(q.id)] ?? null}
            onChange={(v) =>
              setAnswers((a) => {
                const copy = { ...a };
                if (v) copy[String(q.id)] = v;
                else delete copy[String(q.id)];
                return copy;
              })
            }
          />
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0} className="btn-ghost"><ArrowLeft size={16} /> Sebelumnya</button>
            {index < total - 1 ? (
              <button type="button" onClick={() => setIndex(index + 1)} className="btn-primary">Berikutnya <ArrowRight size={16} /></button>
            ) : (
              <button type="button" onClick={() => setPhase("review")} className="btn-gold"><ListChecks size={16} /> Periksa & Kumpulkan</button>
            )}
          </div>
        </div>

        <aside className="panel h-fit p-4">
          <p className="eyebrow mb-3">Navigasi soal</p>
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((qq, i) => {
              const done = isAnswered(qq, answers[String(qq.id)]);
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Soal ${i + 1}${done ? ", terjawab" : ""}${flags.has(qq.id) ? ", ditandai" : ""}`}
                  aria-current={i === index}
                  className={`relative aspect-square rounded-xl text-sm font-black transition ${i === index ? "ring-2 ring-ice" : ""} ${done ? "bg-neon text-white" : "bg-white/5 text-soft/70 hover:bg-white/10"}`}
                >
                  {i + 1}
                  {flags.has(qq.id) && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold" />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1 text-xs text-soft/60">
            <p><span className="mr-1 inline-block h-3 w-3 rounded bg-neon align-middle" /> terjawab</p>
            <p><span className="mr-1 inline-block h-3 w-3 rounded-full bg-gold align-middle" /> ditandai ragu</p>
          </div>
          <button type="button" onClick={() => setPhase("review")} className="btn-ghost mt-4 w-full text-sm"><ListChecks size={16} /> Periksa semua</button>
        </aside>
      </div>
    </div>
  );
}
