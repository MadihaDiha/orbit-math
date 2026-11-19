"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight, Map, Rocket, Trophy } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { pickLine } from "@/lib/bimo-lines";
import { playSfx } from "@/lib/sound";
import type { CheckResult, GivenAnswer, QuizResult, StartedQuiz } from "@/lib/types";
import type { TestResult } from "@/lib/progress";
import { Bimo } from "@/components/bimo/Bimo";
import { Illustration } from "@/components/circle/Illustration";
import { ErrorPanel, Spinner } from "@/components/ui/Spinner";
import { useReward } from "@/components/reward/RewardProvider";

type Kind = "pretest" | "posttest";
type Stage = "briefing" | "question" | "result";

const COPY: Record<Kind, { title: string; badge: string; lines: string[]; button: string }> = {
  pretest: {
    title: "Misi Pertama: Cek Pengetahuan Awal",
    badge: "PRE-TEST",
    lines: [
      "Sebelum kita berangkat, yuk uji pengetahuanmu dulu!",
      "Tenang saja, ini bukan ujian yang menakutkan. Bimo hanya ingin tahu sejauh mana kamu sudah mengenal lingkaran.",
    ],
    button: "MULAI PRE-TEST",
  },
  posttest: {
    title: "Misi Terakhir: Pulang ke Bumi",
    badge: "POST-TEST",
    lines: [
      "Kamu sudah menjelajahi semua planet. Sekarang saatnya misi pulang!",
      "Soalnya mirip dengan pre-test. Kita lihat seberapa jauh kamu berkembang!",
    ],
    button: "MULAI POST-TEST",
  },
};

const LETTERS = ["A", "B", "C", "D"];

/** Pre-test / Post-test bergaya misi luar angkasa: kartu soal, progres roket, umpan balik langsung. */
export function PrePostTest({ kind, pretest }: { kind: Kind; pretest?: TestResult | null }) {
  const copy = COPY[kind];
  const { celebrate } = useReward();
  const [stage, setStage] = useState<Stage>("briefing");
  const [quiz, setQuiz] = useState<StartedQuiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GivenAnswer>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<CheckResult | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    playSfx("whoosh");
    setBusy(true);
    setError(null);
    try {
      setQuiz(await rpc.startQuiz(kind));
      setStage("question");
      setIndex(0);
      setAnswers({});
      setCorrectSoFar(0);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const choose = async (i: number) => {
    if (!quiz || feedback || busy) return;
    const q = quiz.questions[index];
    const given: GivenAnswer = { index: i };
    setPicked(i);
    setBusy(true);
    try {
      const res = await rpc.checkAnswer(quiz.session_id, q.id, given);
      setFeedback(res);
      setAnswers((a) => ({ ...a, [String(q.id)]: given }));
      if (res.is_correct) setCorrectSoFar((c) => c + 1);
      playSfx(res.is_correct ? "correct" : "wrong");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (!quiz) return;
    playSfx("click");
    if (index < quiz.questions.length - 1) {
      setIndex(index + 1);
      setPicked(null);
      setFeedback(null);
      return;
    }
    setBusy(true);
    try {
      const res = await rpc.submitQuiz(quiz.session_id, answers);
      setResult(res);
      setStage("result");
      celebrate({ xp: res.xp_earned, achievements: res.new_achievements });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorPanel message={error} onRetry={() => { setError(null); setStage("briefing"); setFeedback(null); setPicked(null); }} />;

  // ------------------------------------------------------------- briefing
  if (stage === "briefing") {
    return (
      <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <Bimo mood="wave" action="wave" talking size={210} float />
        </div>
        <div className="space-y-5">
          {copy.lines.map((l, i) => (
            <p key={l} className="speech-in rounded-3xl border border-ice/35 bg-gradient-to-br from-royal/50 to-deep/85 px-5 py-4 text-lg font-bold leading-relaxed" style={{ animationDelay: `${i * 0.5}s` }}>
              <span className="mb-1 block font-hud text-[10px] tracking-[0.3em] text-ice">BIMO</span>
              {l}
            </p>
          ))}
          <div className="panel-hud grid-hud flex flex-wrap items-center gap-4 p-5">
            <span className="chip border-gold/50 bg-gold/15 text-gold">{copy.badge}</span>
            <div className="min-w-0 flex-1">
              <p className="font-hud text-lg font-black">{copy.title}</p>
              <p className="text-sm text-soft/70">10 soal pilihan ganda · umpan balik setiap jawaban · nilai disimpan untuk dibandingkan</p>
            </div>
            <button type="button" onClick={start} disabled={busy} className="btn-gold btn-glow btn-press px-7 py-3.5 text-base">
              {busy ? <Spinner /> : <Rocket size={20} />} {copy.button}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------- result
  if (stage === "result" && result) {
    const isPost = kind === "posttest";
    const diff = isPost && pretest ? result.score - pretest.score : null;
    return (
      <div className="panel mx-auto max-w-3xl animate-pop-in p-6 text-center sm:p-10">
        <Bimo mood={result.score >= 70 || !isPost ? "proud" : "happy"} action="cheer" size={150} className="mx-auto block" />
        <p className="eyebrow mt-3">{copy.badge} selesai</p>
        <h2 className="font-hud text-3xl font-black">Nilai {isPost ? "Post-test" : "Pre-test"}: <span className="text-gold glow-text">{result.score}</span></h2>
        <p className="mt-1 text-soft/70">{result.correct} dari {result.total} soal benar</p>

        {isPost && pretest && (
          <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
            <ScoreBar label="Pre-test" score={pretest.score} color="from-nebula to-royal" />
            <ScoreBar label="Post-test" score={result.score} color="from-ice to-gold" />
            <p className={`text-center font-hud font-black ${diff! > 0 ? "text-emerald-300" : diff === 0 ? "text-ice" : "text-gold"}`}>
              {diff! > 0 ? `Naik ${diff} poin! Luar biasa!` : diff === 0 ? "Nilainya sama — tetap konsisten!" : "Belum naik, coba ulangi planet yang sulit lalu kerjakan lagi."}
            </p>
          </div>
        )}

        <p className="mx-auto mt-5 max-w-xl rounded-2xl bg-white/5 px-4 py-3 font-semibold">
          {isPost
            ? result.passed
              ? "Hebat! Kamu berhasil pulang dengan selamat membawa banyak ilmu!"
              : "Kamu sudah berusaha keras! Pelajari lagi planet yang sulit, lalu coba post-test sekali lagi."
            : "Terima kasih! Sekarang Planet Pengenalan Lingkaran sudah terbuka. Ayo kita berangkat!"}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isPost ? (
            <Link href="/results" className="btn-gold btn-glow btn-press px-7 py-3"><Trophy size={18} /> Lihat Hasil Akhir</Link>
          ) : (
            <Link href="/missions/circle-station" className="btn-gold btn-glow btn-press px-7 py-3"><Rocket size={18} /> Berangkat ke Planet 1</Link>
          )}
          <Link href="/galaxy" className="btn-ghost px-6 py-3"><Map size={18} /> Peta Galaksi</Link>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- question
  if (!quiz) return null;
  const q = quiz.questions[index];
  const total = quiz.questions.length;
  const options = Array.isArray(q.options) ? q.options : [];
  const correctIndex = feedback && "index" in feedback.correct_answer ? feedback.correct_answer.index : null;
  const progress = ((index + (feedback ? 1 : 0)) / total) * 100;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* progres roket */}
      <div className="panel-hud px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span className="font-hud text-ice">{copy.badge} · SOAL {index + 1}/{total}</span>
          <span className="text-emerald-200">✓ {correctSoFar} benar</span>
        </div>
        <div className="relative h-3 rounded-full bg-navy/80 ring-1 ring-ice/20">
          <div className="h-full rounded-full bg-gradient-to-r from-nebula via-neon to-ice transition-[width] duration-700" style={{ width: `${progress}%` }} />
          <span className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-700" style={{ left: `calc(${progress}% - 14px)` }} aria-hidden="true">
            <Rocket size={26} className="rotate-45 text-gold drop-shadow-[0_0_8px_#FFD76A]" />
          </span>
        </div>
        <div className="mt-2 flex justify-between">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < index + (feedback ? 1 : 0) ? "bg-gold" : "bg-white/20"}`} />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_200px]">
        <div key={q.id} className="panel animate-slide-up p-5 sm:p-7">
          <span className="chip">{q.topic}</span>
          <p className="mt-3 text-xl font-bold leading-relaxed">{q.prompt}</p>
          {q.illustration && (
            <div className="panel-hud grid-hud mt-4 p-3">
              <Illustration name={q.illustration} />
            </div>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {options.map((opt, i) => {
              const isPicked = picked === i;
              const isCorrect = correctIndex === i;
              const state = feedback
                ? isCorrect
                  ? "border-emerald-300 bg-emerald-400/20 text-emerald-50 scale-[1.02]"
                  : isPicked
                    ? "border-rose-300 bg-rose-400/20 text-rose-50 animate-shake"
                    : "opacity-50"
                : "hover:-translate-y-1 hover:border-ice hover:bg-royal/40";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={Boolean(feedback) || busy}
                  onClick={() => choose(i)}
                  className={`btn-press flex items-center gap-3 rounded-2xl border-2 border-ice/20 bg-navy/60 px-4 py-4 text-left font-bold transition duration-200 ${state}`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon to-nebula font-hud text-lg font-black text-white">
                    {isPicked && busy ? <Spinner size={16} /> : LETTERS[i]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className={`mt-5 animate-pop-in rounded-2xl border p-4 ${feedback.is_correct ? "border-emerald-300/50 bg-emerald-400/10" : "border-rose-300/40 bg-rose-400/10"}`}>
              <p className="font-bold">{pickLine(feedback.is_correct ? "correct" : "wrong", q.id)}</p>
              <p className="mt-1 text-sm text-soft/85"><span className="font-bold text-ice">Penjelasan: </span>{feedback.explanation}</p>
              <button type="button" onClick={next} disabled={busy} className="btn-primary btn-press mt-4">
                {busy ? <Spinner /> : null}
                {index < total - 1 ? "Soal berikutnya" : "Selesaikan misi"} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="hidden flex-col items-center gap-3 lg:flex">
          <Bimo
            key={`${index}-${feedback ? (feedback.is_correct ? "y" : "n") : "t"}`}
            mood={feedback ? (feedback.is_correct ? "proud" : "oops") : "thinking"}
            action={feedback ? (feedback.is_correct ? "hop" : "nod") : "think"}
            size={180}
            float
          />
          <p className="text-center text-sm font-semibold text-soft/75">
            {feedback ? (feedback.is_correct ? "Yeay, benar!" : "Ayo, kamu pasti bisa!") : "Hmm... Bimo ikut berpikir!"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="font-hud">{score}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-navy/80 ring-1 ring-ice/15">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

/**
 * Menahan tampilan "sudah selesai" sampai halaman dibuka ulang, supaya layar hasil
 * pre-test tidak langsung tertutup ketika data progres diperbarui setelah submit.
 */
export function PretestGate({ alreadyDone, doneView }: { alreadyDone: boolean; doneView: ReactNode }) {
  const [initiallyDone] = useState(alreadyDone);
  if (initiallyDone) return <>{doneView}</>;
  return <PrePostTest kind="pretest" />;
}
