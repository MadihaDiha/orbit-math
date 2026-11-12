"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Satellite, Timer } from "lucide-react";
import { orbitSet, scoreOrbit } from "@/lib/games";
import { formatNumber, parseNumberInput } from "@/lib/math";
import type { GameFinish } from "./GameShell";

const STAGE_NAMES = { 1: "Tahap 1 · Diameter → Keliling", 2: "Tahap 2 · Jari-jari → Keliling", 3: "Tahap 3 · Keliling → Diameter" } as const;

export function OrbitCalculation({ onFinish }: { onFinish: (r: GameFinish) => void }) {
  const [problems] = useState(() => orbitSet());
  const [i, setI] = useState(0);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ReturnType<typeof scoreOrbit> | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (feedback) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [feedback, i]);

  const p = problems[i];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (feedback) return;
    const n = parseNumberInput(raw);
    if (n === null) {
      setError("Masukkan angka (gunakan koma untuk desimal).");
      return;
    }
    setError(null);
    const res = scoreOrbit(n, p.answer, seconds);
    setFeedback(res);
    setScore((s) => s + res.points);
    if (res.exact) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (i + 1 >= problems.length) {
      onFinish({ score, correct, total: problems.length });
      return;
    }
    setI(i + 1);
    setRaw("");
    setFeedback(null);
    setSeconds(0);
  };

  const orbitPct = ((i + (feedback ? 1 : 0)) / problems.length) * 360;

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div className="panel-hud flex flex-col items-center justify-center p-5">
        <svg viewBox="0 0 200 200" className="w-full max-w-[220px]" aria-hidden="true">
          <circle cx="100" cy="100" r="30" fill="#318BFF" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#62E5F5" strokeOpacity="0.2" strokeWidth="3" strokeDasharray="4 6" />
          <path
            d={`M100 22 A78 78 0 ${orbitPct > 180 ? 1 : 0} 1 ${100 + 78 * Math.sin((orbitPct * Math.PI) / 180)} ${100 - 78 * Math.cos((orbitPct * Math.PI) / 180)}`}
            fill="none"
            stroke="#FFD76A"
            strokeWidth="5"
            strokeLinecap="round"
            style={{ display: orbitPct >= 360 ? "none" : undefined }}
          />
          {orbitPct >= 360 && <circle cx="100" cy="100" r="78" fill="none" stroke="#FFD76A" strokeWidth="5" />}
          <g transform={`rotate(${orbitPct} 100 100)`} style={{ transition: "transform 0.8s ease" }}>
            <circle cx="100" cy="22" r="9" fill="#FFD76A" />
          </g>
        </svg>
        <p className="mt-2 font-hud text-sm font-bold text-gold">SKOR {score}</p>
        <p className="text-xs text-soft/60">Satelit mengorbit seiring jawaban tepatmu</p>
      </div>

      <div key={i} className="panel animate-slide-up space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="chip border-gold/40 bg-gold/10 text-gold">{STAGE_NAMES[p.stage]}</span>
          <span>Orbit {i + 1}/{problems.length}</span>
          <span className={`ml-auto flex items-center gap-1 ${seconds <= 30 ? "text-ice" : "text-soft/50"}`}><Timer size={14} /> {seconds}s {seconds <= 30 ? "(bonus aktif)" : ""}</span>
        </div>
        <p className="flex gap-2 text-lg font-bold"><Satellite className="mt-1 shrink-0 text-ice" size={20} /> {p.prompt}</p>
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <input
            autoFocus
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            disabled={Boolean(feedback)}
            placeholder="jawabanmu"
            aria-label="Jawaban"
            className={`input max-w-[220px] font-hud text-lg ${error ? "input-error" : ""}`}
          />
          <span className="font-bold text-soft/70">{p.unit}</span>
          {!feedback && <button type="submit" className="btn-cyan">Kirim</button>}
        </form>
        {error && <p className="field-error">{error}</p>}
        {feedback && (
          <div className="animate-pop-in rounded-2xl bg-white/5 p-4 text-sm">
            <p className={`font-bold ${feedback.exact ? "text-emerald-200" : feedback.close ? "text-gold" : "text-rose-200"}`}>
              {feedback.exact ? `Orbit stabil! +${feedback.points} poin` : feedback.close ? `Hampir tepat! +${feedback.points} poin` : "Orbit meleset."}
            </p>
            <p className="mt-1 text-soft/85">Jawaban: {formatNumber(p.answer)} {p.unit}. {p.explanation}</p>
            <button type="button" onClick={next} className="btn-primary mt-3">{i + 1 >= problems.length ? "Lihat hasil" : "Orbit berikutnya"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
