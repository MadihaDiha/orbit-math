"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, GraduationCap, Rocket, Star } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { BIMO_LINES } from "@/lib/bimo-lines";
import { LessonQuiz } from "@/components/quiz/LessonQuiz";
import { BimoSays } from "@/components/bimo/BimoSays";
import { Spinner } from "@/components/ui/Spinner";
import { useReward } from "@/components/reward/RewardProvider";

/** Menandai misi sedang dipelajari (sekali, idempotent di server). */
export function OpenLessonTracker({ slug }: { slug: string }) {
  useEffect(() => {
    rpc.openLesson(slug).catch(() => undefined);
  }, [slug]);
  return null;
}

interface Props {
  slug: string;
  lessonId: number;
  quizSlug: string;
  bestScore: number;
  completed: boolean;
  stars: number;
  nextSlug: string | null;
  nextTitle: string | null;
}

/** Mini quiz + tombol Selesaikan Misi + tombol Misi Berikutnya. */
export function MissionFinish({ slug, lessonId, quizSlug, bestScore, completed, stars, nextSlug, nextTitle }: Props) {
  const { celebrate, notify } = useReward();
  const [best, setBest] = useState(bestScore);
  const [done, setDone] = useState(completed);
  const [starCount, setStarCount] = useState(stars);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canComplete = best >= 60;

  const complete = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await rpc.completeLesson(slug);
      setDone(true);
      setStarCount(res.stars);
      celebrate({
        xp: res.xp_earned,
        achievements: res.new_achievements,
        message: res.already_completed ? (res.xp_earned === 0 ? "Misi diulang — progres tetap aman." : undefined) : BIMO_LINES.missionDone,
      });
      if (!res.already_completed && res.next_slug) notify(BIMO_LINES.newRegion);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <LessonQuiz quizSlug={quizSlug} bestScore={best} onPassed={(score) => setBest((b) => Math.max(b, score))} />

      <div className="panel-hud flex flex-col gap-5 p-6 md:flex-row md:items-center">
        <div className="flex-1">
          {done ? (
            <BimoSays mood="proud" size={80} float={false}>
              {BIMO_LINES.missionDone}
              <span className="mt-1 flex gap-1">
                {[1, 2, 3].map((n) => (
                  <Star key={n} size={18} className={n <= starCount ? "fill-gold text-gold" : "text-soft/25"} />
                ))}
              </span>
            </BimoSays>
          ) : canComplete ? (
            <BimoSays mood="happy" size={80} float={false}>Mini quiz sudah lulus. Tekan &ldquo;Selesaikan Misi&rdquo; untuk mengklaim XP dan membuka wilayah baru!</BimoSays>
          ) : (
            <BimoSays mood="thinking" size={80} float={false}>Selesaikan mini quiz dengan nilai minimal 60 untuk menyelesaikan misi ini.</BimoSays>
          )}
          {error && <p className="mt-3 text-sm font-bold text-rose-200">{error}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
          <button type="button" onClick={complete} disabled={!canComplete || busy} className={done ? "btn-ghost" : "btn-gold"}>
            {busy ? <Spinner /> : done ? <CheckCircle2 size={18} /> : <Rocket size={18} />} {done ? "Misi selesai ✓ (perbarui bintang)" : "Selesaikan Misi"}
          </button>
          {lessonId === 7 ? (
            <Link href="/exam" className="btn-primary"><GraduationCap size={18} /> Final Examination</Link>
          ) : nextSlug && done ? (
            <Link href={`/missions/${nextSlug}`} className="btn-primary">Misi berikutnya: {nextTitle} <ArrowRight size={18} /></Link>
          ) : (
            <span className="btn-ghost cursor-not-allowed opacity-50" aria-disabled="true" title="Selesaikan misi ini dulu">Misi berikutnya <ArrowRight size={18} /></span>
          )}
        </div>
      </div>
    </div>
  );
}
