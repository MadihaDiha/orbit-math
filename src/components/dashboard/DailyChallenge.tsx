"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Zap } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import type { DailyChallenge as Daily, GivenAnswer } from "@/lib/types";
import { QuestionInput, isAnswered } from "@/components/quiz/QuestionInput";
import { Spinner } from "@/components/ui/Spinner";
import { useReward } from "@/components/reward/RewardProvider";

/** Tantangan harian: satu soal per hari, satu kesempatan, +30 XP jika benar. */
export function DailyChallenge() {
  const { celebrate } = useReward();
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<GivenAnswer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDaily(await rpc.getDaily());
      setError(null);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!answer || !daily) return;
    setBusy(true);
    try {
      const res = await rpc.submitDaily(answer);
      setDaily({ ...daily, done: true, is_correct: res.is_correct, correct_answer: res.correct_answer, explanation: res.explanation });
      celebrate({ xp: res.xp_earned, achievements: res.new_achievements, message: res.is_correct ? "Tantangan harian berhasil!" : undefined });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel p-5" aria-labelledby="daily-title">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="text-gold" size={20} />
        <h2 id="daily-title" className="font-hud text-lg font-black">Tantangan Harian</h2>
        <span className="chip ml-auto border-gold/40 bg-gold/10 text-gold">+30 XP</span>
      </div>
      {loading ? (
        <div className="flex justify-center py-6 text-ice"><Spinner size={24} /></div>
      ) : error ? (
        <p className="text-sm text-rose-200">{error}</p>
      ) : !daily ? (
        <p className="text-sm text-soft/70">Belum ada tantangan hari ini.</p>
      ) : (
        <div className="space-y-4">
          <QuestionInput question={daily.question} value={answer} onChange={setAnswer} disabled={daily.done || busy} correct={daily.done ? daily.correct_answer : null} />
          {daily.done ? (
            <div className={`rounded-2xl p-3 text-sm ${daily.is_correct ? "bg-emerald-400/10 text-emerald-100" : "bg-rose-400/10 text-rose-100"}`}>
              <p className="flex items-center gap-2 font-bold"><CalendarCheck size={16} /> {daily.is_correct ? "Kamu berhasil hari ini!" : "Belum tepat, tetap semangat!"} Kembali lagi besok.</p>
              {daily.explanation && <p className="mt-1 text-soft/85">{daily.explanation}</p>}
            </div>
          ) : (
            <button type="button" onClick={submit} disabled={!isAnswered(daily.question, answer) || busy} className="btn-gold w-full">
              {busy ? <Spinner /> : <Zap size={16} />} Kirim jawaban (1 kesempatan)
            </button>
          )}
        </div>
      )}
    </section>
  );
}
