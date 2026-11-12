"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Play, RotateCcw, Trophy } from "lucide-react";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { getGame } from "@/lib/games";
import type { GameResult } from "@/lib/types";
import { BimoSays } from "@/components/bimo/BimoSays";
import { Spinner } from "@/components/ui/Spinner";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { useReward } from "@/components/reward/RewardProvider";

export interface GameFinish {
  score: number;
  correct: number;
  total: number;
  story?: string;
}

type Phase = "intro" | "play" | "saving" | "result";

/** Kerangka permainan: petunjuk → bermain → simpan skor (server) → hasil → main lagi. */
export function GameShell({ slug, intro, children }: { slug: string; intro?: ReactNode; children: (finish: (r: GameFinish) => void) => ReactNode }) {
  const game = getGame(slug);
  const { celebrate } = useReward();
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [local, setLocal] = useState<GameFinish | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!game) return null;

  const finish = async (r: GameFinish) => {
    setLocal(r);
    setPhase("saving");
    setError(null);
    try {
      const res = await rpc.submitGame(slug, r.score, r.correct, r.total);
      setResult(res);
      celebrate({ xp: res.xp_earned, achievements: res.new_achievements });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setPhase("result");
    }
  };

  const replay = () => {
    setResult(null);
    setLocal(null);
    setRound((n) => n + 1);
    setPhase("play");
  };

  if (phase === "intro") {
    return (
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="panel space-y-5 p-6 sm:p-8">
          <div>
            <p className="eyebrow" style={{ color: game.color }}>Petunjuk misi</p>
            <h2 className="mt-1 font-hud text-3xl font-black">{game.title}</h2>
            <p className="mt-1 text-soft/75">{game.tagline}</p>
          </div>
          {intro}
          <div>
            <h3 className="mb-2 font-bold text-ice">Aturan permainan</h3>
            <ol className="space-y-2">
              {game.rules.map((r, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-white/5 px-4 py-2.5 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black text-navy" style={{ background: game.color }}>{i + 1}</span>
                  {r}
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-soft/60">Skor maksimal {game.maxScore} · Target misi {game.passScore} poin</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPhase("play")} className="btn-primary"><Play size={18} /> Mulai bermain</button>
            <Link href="/playground" className="btn-ghost"><ArrowLeft size={16} /> Playground</Link>
          </div>
        </div>
        <BimoSays mood="wave" size={110}>
          Siap, penjelajah? Baca aturannya dulu, ya. Kalau bingung, ingat rumus andalan kita: K = π × d!
        </BimoSays>
      </div>
    );
  }

  if (phase === "saving") {
    return (
      <div className="panel flex min-h-[260px] flex-col items-center justify-center gap-3 p-8 text-ice">
        <Spinner size={32} />
        <p className="font-hud text-sm tracking-widest">Mengirim skor ke stasiun...</p>
      </div>
    );
  }

  if (phase === "result" && local) {
    const score = result?.score ?? local.score;
    const max = result?.max_score ?? game.maxScore;
    const cleared = result?.cleared ?? score >= game.passScore;
    return (
      <div className="panel mx-auto max-w-2xl animate-pop-in p-6 text-center sm:p-8">
        <p className="eyebrow">Hasil akhir</p>
        <h2 className="mt-1 font-hud text-2xl font-black">{cleared ? "MISI BERHASIL!" : "Misi belum tuntas"}</h2>
        <div className="my-6 flex justify-center">
          <ProgressRing value={(score / max) * 100} size={160} stroke={12} color={cleared ? "#FFD76A" : game.color}>
            <span>
              <span className="block font-hud text-4xl font-black">{score}</span>
              <span className="text-xs text-soft/60">dari {max}</span>
            </span>
          </ProgressRing>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="chip">{local.correct}/{local.total} benar</span>
          {result && <span className="chip"><Trophy size={14} /> Terbaik {result.best_score}</span>}
          {result && result.xp_earned > 0 && <span className="chip border-gold/50 bg-gold/15 text-gold">+{result.xp_earned} XP</span>}
        </div>
        {error && <p className="mt-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">Skor belum tersimpan: {error}</p>}
        <div className="mx-auto mt-6 max-w-md text-left">
          <BimoSays mood={cleared ? "proud" : "oops"} size={76}>
            {local.story ?? (cleared ? "LUAR BIASA! Kamu menuntaskan misi permainan ini!" : `Target ${game.passScore} poin belum tercapai. Ayo main lagi — kamu pasti makin jago!`)}
          </BimoSays>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={replay} className="btn-primary"><RotateCcw size={18} /> Main lagi</button>
          <Link href="/playground" className="btn-ghost">Permainan lain</Link>
        </div>
      </div>
    );
  }

  return <div key={round}>{children(finish)}</div>;
}
