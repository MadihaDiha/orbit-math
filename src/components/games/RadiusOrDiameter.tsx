"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { segmentRound, type SegmentKind, type SegmentRound } from "@/lib/games";
import type { GameFinish } from "./GameShell";

const ROUNDS = 10;
const LABELS: Record<SegmentKind, string> = { radius: "Jari-jari", diameter: "Diameter", chord: "Tali busur" };
const WHY: Record<SegmentKind, string> = {
  radius: "Garis ini berangkat dari titik pusat ke tepi lingkaran → jari-jari.",
  diameter: "Garis ini melewati titik pusat dan menghubungkan dua titik di tepi → diameter (= 2 × r).",
  chord: "Garis ini menghubungkan dua titik di tepi TANPA melewati pusat → tali busur.",
};

function Segment({ round }: { round: SegmentRound }) {
  const C = 120;
  const R = 90;
  const a = (round.angle * Math.PI) / 180;
  const p = (ang: number) => ({ x: C + R * Math.cos(ang), y: C + R * Math.sin(ang) });
  let x1: number, y1: number, x2: number, y2: number;
  if (round.kind === "radius") {
    const e = p(a);
    [x1, y1, x2, y2] = [C, C, e.x, e.y];
  } else if (round.kind === "diameter") {
    const e1 = p(a);
    const e2 = p(a + Math.PI);
    [x1, y1, x2, y2] = [e1.x, e1.y, e2.x, e2.y];
  } else {
    const e1 = p(a);
    const e2 = p(a + (100 * Math.PI) / 180);
    [x1, y1, x2, y2] = [e1.x, e1.y, e2.x, e2.y];
  }
  return (
    <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[300px]" role="img" aria-label="Lingkaran dengan satu garis menyala">
      <circle cx={C} cy={C} r={R} fill="#102B59" fillOpacity="0.6" stroke="#C9D8F5" strokeWidth="3" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD76A" strokeWidth="6" strokeLinecap="round" className="animate-twinkle" />
      <circle cx={x1} cy={y1} r="5" fill="#FFD76A" />
      <circle cx={x2} cy={y2} r="5" fill="#FFD76A" />
      <circle cx={C} cy={C} r="5" fill="#62E5F5" />
      <text x={C + 8} y={C + 18} fontSize="11" fill="#62E5F5" fontWeight="800">pusat</text>
    </svg>
  );
}

export function RadiusOrDiameter({ onFinish }: { onFinish: (r: GameFinish) => void }) {
  const [i, setI] = useState(0);
  const [round, setRound] = useState<SegmentRound>(() => segmentRound());
  const [answer, setAnswer] = useState<SegmentKind | null>(null);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const choose = (k: SegmentKind) => {
    if (answer) return;
    setAnswer(k);
    if (k === round.kind) {
      setCorrect((c) => c + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
    } else setCombo(0);
  };

  const next = () => {
    if (i + 1 >= ROUNDS) {
      onFinish({ score: correct * 10, correct, total: ROUNDS, story: `Combo terpanjangmu: ${bestCombo} jawaban beruntun! Kunci utamanya: lihat apakah garis melewati titik pusat.` });
      return;
    }
    setI(i + 1);
    setRound(segmentRound());
    setAnswer(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="panel-hud flex items-center gap-4 px-4 py-3 font-hud text-sm font-bold">
        <span>SINYAL {i + 1}/{ROUNDS}</span>
        <span className="text-gold">SKOR {correct * 10}</span>
        <span className={`ml-auto flex items-center gap-1 ${combo >= 3 ? "text-gold" : "text-ice"}`}><Flame size={16} /> COMBO ×{combo}</span>
      </div>
      <div key={i} className="panel animate-pop-in p-5">
        <Segment round={round} />
        <p className="mt-2 text-center font-bold">Garis kuning yang menyala adalah …</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["radius", "diameter", "chord"] as SegmentKind[]).map((k) => {
            const state = answer ? (k === round.kind ? "choice-correct" : k === answer ? "choice-wrong" : "opacity-50") : "";
            return (
              <button key={k} type="button" onClick={() => choose(k)} disabled={Boolean(answer)} className={`choice justify-center text-center text-sm sm:text-base ${state}`}>
                {LABELS[k]}
              </button>
            );
          })}
        </div>
        {answer && (
          <div className="mt-4 animate-slide-up rounded-2xl bg-white/5 p-4 text-sm">
            <p className={`font-bold ${answer === round.kind ? "text-emerald-200" : "text-rose-200"}`}>
              {answer === round.kind ? "Tepat! +10 poin" : `Ups, itu ${LABELS[round.kind]}.`}
            </p>
            <p className="mt-1 text-soft/85">{WHY[round.kind]}</p>
            <button type="button" onClick={next} className="btn-primary mt-3">{i + 1 >= ROUNDS ? "Lihat hasil" : "Sinyal berikutnya"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
