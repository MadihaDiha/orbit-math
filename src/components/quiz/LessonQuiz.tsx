"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Play, RotateCcw, Send } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { scoreMessage } from "@/lib/bimo-lines";
import type { GivenAnswer, QuizResult, StartedQuiz } from "@/lib/types";
import { QuestionInput, isAnswered } from "./QuestionInput";
import { ReviewList } from "./ReviewList";
import { BimoSays } from "@/components/bimo/BimoSays";
import { ErrorPanel, Spinner } from "@/components/ui/Spinner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useReward } from "@/components/reward/RewardProvider";

/** Mini quiz di akhir materi. Dinilai server setelah semua soal dijawab. */
export function LessonQuiz({ quizSlug, bestScore, onPassed }: { quizSlug: string; bestScore: number; onPassed: (score: number) => void }) {
  const { celebrate } = useReward();
  const [quiz, setQuiz] = useState<StartedQuiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, GivenAnswer>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setAnswers({});
    setIndex(0);
    try {
      setQuiz(await rpc.startQuiz(quizSlug));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!quiz) return;
    setBusy(true);
    try {
      const res = await rpc.submitQuiz(quiz.session_id, answers);
      setResult(res);
      setQuiz(null);
      celebrate({ xp: res.xp_earned, achievements: res.new_achievements });
      if (res.passed) onPassed(res.score);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorPanel message={error} onRetry={start} />;

  if (result) {
    const msg = scoreMessage(result.score, result.pass_score);
    return (
      <div className="space-y-5">
        <div className="panel-hud p-6 text-center">
          <p className="eyebrow">Hasil mini quiz</p>
          <p className="mt-1 font-hud text-5xl font-black text-gold">{result.score}</p>
          <p className="text-sm text-soft/70">{result.correct}/{result.total} benar · minimal {result.pass_score}</p>
          <div className="mx-auto mt-4 max-w-md text-left">
            <BimoSays mood={msg.mood} size={72}>
              {result.passed ? "Mini quiz lulus! Tekan tombol Selesaikan Misi di bawah untuk membuka wilayah berikutnya." : msg.text}
            </BimoSays>
          </div>
          <button type="button" onClick={start} className="btn-ghost mt-4"><RotateCcw size={16} /> Ulangi mini quiz</button>
        </div>
        <ReviewList items={result.review} />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="panel-hud flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="font-bold">Siap menguji pemahamanmu?</p>
          <p className="text-sm text-soft/70">Jawab semua soal, lalu kumpulkan. Nilai minimal 60 untuk menyelesaikan misi.{bestScore > 0 ? ` Nilai terbaikmu: ${bestScore}.` : ""}</p>
        </div>
        <button type="button" onClick={start} disabled={busy} className="btn-cyan">
          {busy ? <Spinner /> : <Play size={18} />} Mulai Mini Quiz
        </button>
      </div>
    );
  }

  const q = quiz.questions[index];
  const total = quiz.questions.length;
  const answeredCount = quiz.questions.filter((qq) => isAnswered(qq, answers[String(qq.id)])).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold">
        <span>Soal {index + 1}/{total}</span>
        <span className="text-soft/60">{answeredCount}/{total} terjawab</span>
      </div>
      <ProgressBar value={answeredCount} max={total} />
      <div key={q.id} className="panel animate-slide-up p-5 sm:p-6">
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
            <button type="button" onClick={submit} disabled={busy || answeredCount < total} className="btn-gold">
              {busy ? <Spinner /> : <Send size={16} />} Kumpulkan
            </button>
          )}
        </div>
        {index === total - 1 && answeredCount < total && <p className="mt-3 text-right text-xs text-gold/90">Jawab semua soal dulu sebelum mengumpulkan.</p>}
      </div>
    </div>
  );
}
