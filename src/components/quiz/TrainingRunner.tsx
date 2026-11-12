"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { pickLine, scoreMessage } from "@/lib/bimo-lines";
import type { CheckResult, GivenAnswer, QuizResult, StartedQuiz } from "@/lib/types";
import { QuestionInput, isAnswered } from "./QuestionInput";
import { ReviewList } from "./ReviewList";
import { BimoSays } from "@/components/bimo/BimoSays";
import { ErrorPanel, LoadingPanel, Spinner } from "@/components/ui/Spinner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useReward } from "@/components/reward/RewardProvider";

/** Training Zone: umpan balik langsung per soal (dinilai server), lalu rekap. */
export function TrainingRunner({ slug }: { slug: string }) {
  const { celebrate } = useReward();
  const [quiz, setQuiz] = useState<StartedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GivenAnswer>>({});
  const [current, setCurrent] = useState<GivenAnswer | null>(null);
  const [feedback, setFeedback] = useState<CheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const start = useCallback(async () => {
    setError(null);
    setQuiz(null);
    setResult(null);
    setIndex(0);
    setAnswers({});
    setCurrent(null);
    setFeedback(null);
    setCorrectCount(0);
    try {
      setQuiz(await rpc.startQuiz(slug));
    } catch (e) {
      setError(friendlyError(e));
    }
  }, [slug]);

  useEffect(() => {
    start();
  }, [start]);

  if (error) return <ErrorPanel message={error} onRetry={start} />;
  if (!quiz) return <LoadingPanel text="Menyiapkan soal latihan..." />;

  const q = quiz.questions[index];
  const total = quiz.questions.length;

  const check = async () => {
    if (!current) return;
    setBusy(true);
    try {
      const res = await rpc.checkAnswer(quiz.session_id, q.id, current);
      setFeedback(res);
      setAnswers((a) => ({ ...a, [String(q.id)]: current }));
      if (res.is_correct) setCorrectCount((c) => c + 1);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (index < total - 1) {
      setIndex(index + 1);
      setCurrent(null);
      setFeedback(null);
      return;
    }
    setBusy(true);
    try {
      const res = await rpc.submitQuiz(quiz.session_id, answers);
      setResult(res);
      celebrate({ xp: res.xp_earned, achievements: res.new_achievements });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    const msg = scoreMessage(result.score, result.pass_score);
    return (
      <div className="space-y-6">
        <div className="panel animate-pop-in p-6 text-center sm:p-8">
          <p className="eyebrow">Rekap latihan</p>
          <p className="mt-2 font-hud text-6xl font-black text-gold glow-text">{result.score}</p>
          <p className="mt-1 text-soft/70">{result.correct} dari {result.total} soal benar · Nilai lulus {result.pass_score}</p>
          {result.xp_earned > 0 && <p className="chip mx-auto mt-3 border-gold/50 bg-gold/15 text-gold">+{result.xp_earned} XP</p>}
          <div className="mx-auto mt-6 max-w-lg text-left">
            <BimoSays mood={msg.mood}>{msg.text}</BimoSays>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={start} className="btn-primary"><RotateCcw size={18} /> Latihan lagi (soal baru)</button>
            <Link href="/training" className="btn-ghost">Pilih level lain</Link>
          </div>
        </div>
        <h3 className="font-hud text-xl font-black">Pembahasan</h3>
        <ReviewList items={result.review} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 text-sm font-bold">
        <span>Soal {index + 1} / {total}</span>
        <span className="text-emerald-200">✓ {correctCount} benar</span>
      </div>
      <ProgressBar value={index + (feedback ? 1 : 0)} max={total} />

      <div key={q.id} className="panel animate-slide-up p-5 sm:p-7">
        <QuestionInput question={q} value={current} onChange={setCurrent} disabled={Boolean(feedback) || busy} correct={feedback?.correct_answer ?? null} autoFocus />

        {feedback && (
          <div className={`mt-6 animate-pop-in rounded-3xl border p-4 ${feedback.is_correct ? "border-emerald-300/40 bg-emerald-400/10" : "border-rose-300/40 bg-rose-400/10"}`}>
            <BimoSays mood={feedback.is_correct ? "proud" : "oops"} size={72} float={false}>
              <span className="block">{pickLine(feedback.is_correct ? "correct" : "wrong", q.id)}</span>
              <span className="mt-2 block font-normal text-soft/90">
                <span className="font-bold text-ice">{feedback.is_correct ? "Kenapa benar: " : "Langkah yang seharusnya: "}</span>
                {feedback.explanation}
              </span>
            </BimoSays>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!feedback ? (
            <button type="button" onClick={check} disabled={!isAnswered(q, current) || busy} className="btn-cyan">
              {busy ? <Spinner /> : <ShieldCheck size={18} />} Periksa Jawaban
            </button>
          ) : (
            <button type="button" onClick={next} disabled={busy} className="btn-primary">
              {busy ? <Spinner /> : null}
              {index < total - 1 ? "Soal berikutnya" : "Lihat rekap"} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
