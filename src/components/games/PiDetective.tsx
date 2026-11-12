"use client";

import { useState } from "react";
import { FileSearch, Lock, Search } from "lucide-react";
import { PI_CASES, scorePiCase, shuffle } from "@/lib/games";
import type { GameFinish } from "./GameShell";

export function PiDetective({ onFinish }: { onFinish: (r: GameFinish) => void }) {
  const [cases] = useState(() => shuffle(PI_CASES));
  const [i, setI] = useState(0);
  const [opened, setOpened] = useState(1);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);

  const c = cases[i];
  const potential = scorePiCase(opened, true);

  const choose = (idx: number) => {
    if (answer !== null) return;
    setAnswer(idx);
    if (idx === c.answer) {
      setScore((s) => s + scorePiCase(opened, true));
      setSolved((n) => n + 1);
    }
  };

  const next = () => {
    if (i + 1 >= cases.length) {
      onFinish({
        score,
        correct: solved,
        total: cases.length,
        story: solved === cases.length ? "Semua kasus terpecahkan! Kamu detektif π sejati!" : `Kamu memecahkan ${solved} dari ${cases.length} kasus. Ingat: π = K ÷ d ≈ 3,14 ≈ 22/7.`,
      });
      return;
    }
    setI(i + 1);
    setOpened(1);
    setAnswer(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="panel-hud flex items-center gap-4 px-4 py-3 font-hud text-sm font-bold">
        <span>BERKAS {i + 1}/{cases.length}</span>
        <span className="text-gold">SKOR {score}</span>
        <span className="ml-auto text-nebula">Nilai kasus: {answer === null ? potential : "-"}</span>
      </div>

      <div key={i} className="panel animate-pop-in overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 bg-nebula/15 px-5 py-4">
          <FileSearch className="text-nebula" />
          <h3 className="font-hud text-lg font-black">{c.title}</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {c.clues.map((clue, idx) => {
              const isOpen = idx < opened;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isOpen || answer !== null}
                  onClick={() => setOpened(idx + 1)}
                  className={`min-h-[110px] rounded-2xl border p-4 text-left text-sm transition ${
                    isOpen ? "animate-pop-in border-nebula/50 bg-nebula/10" : "border-dashed border-soft/20 bg-white/5 hover:border-nebula/60"
                  }`}
                >
                  <span className="mb-2 flex items-center gap-1.5 font-hud text-xs font-bold text-nebula">
                    {isOpen ? <Search size={14} /> : <Lock size={14} />} PETUNJUK {idx + 1}
                  </span>
                  {isOpen ? clue : <span className="text-soft/50">Ketuk untuk membuka (−10 poin)</span>}
                </button>
              );
            })}
          </div>

          <p className="font-bold">{c.question}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.options.map((opt, idx) => {
              const state = answer !== null ? (idx === c.answer ? "choice-correct" : idx === answer ? "choice-wrong" : "opacity-50") : "";
              return (
                <button key={idx} type="button" onClick={() => choose(idx)} disabled={answer !== null} className={`choice ${state}`}>
                  {opt}
                </button>
              );
            })}
          </div>

          {answer !== null && (
            <div className="animate-slide-up rounded-2xl bg-white/5 p-4 text-sm">
              <p className={`font-bold ${answer === c.answer ? "text-emerald-200" : "text-rose-200"}`}>
                {answer === c.answer ? `Kasus ditutup! +${scorePiCase(opened, true)} poin` : "Kasus belum terpecahkan."}
              </p>
              <p className="mt-1 text-soft/85">{c.explanation}</p>
              <button type="button" onClick={next} className="btn-primary mt-3">{i + 1 >= cases.length ? "Lihat hasil" : "Berkas berikutnya"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
