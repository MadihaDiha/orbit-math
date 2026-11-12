"use client";

import { useState } from "react";
import { BatteryCharging, Shield, Zap } from "lucide-react";
import { rescueChallenge, type RescueChallenge } from "@/lib/games";
import { formatNumber } from "@/lib/math";
import { Bimo } from "@/components/bimo/Bimo";
import type { GameFinish } from "./GameShell";

const NEEDED = 5;
const SHIELDS = 3;

export function BimoSpaceRescue({ onFinish }: { onFinish: (r: GameFinish) => void }) {
  const [story, setStory] = useState(true);
  const [ch, setCh] = useState<RescueChallenge>(() => rescueChallenge());
  const [energy, setEnergy] = useState(0);
  const [shields, setShields] = useState(SHIELDS);
  const [attempts, setAttempts] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [boost, setBoost] = useState(false);

  const correctPick = picked !== null && ch.options[picked] === ch.answer;
  const finished = energy >= NEEDED || shields <= 0;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setAttempts((a) => a + 1);
    if (ch.options[i] === ch.answer) {
      setEnergy((e) => e + 1);
      setBoost(true);
      setTimeout(() => setBoost(false), 900);
    } else setShields((s) => s - 1);
  };

  const next = () => {
    if (finished) {
      const win = energy >= NEEDED;
      onFinish({
        score: energy * 20,
        correct: energy,
        total: attempts,
        story: win
          ? "Energi 100%! Pesawat BIMO berhasil kembali ke stasiun luar angkasa. Terima kasih, penyelamat galaksi!"
          : `Perisai habis di energi ${energy * 20}%. Tim penyelamat menarik pesawat BIMO. Ayo coba lagi!`,
      });
      return;
    }
    setCh(rescueChallenge());
    setPicked(null);
  };

  if (story) {
    return (
      <div className="panel mx-auto max-w-2xl space-y-5 p-6 text-center sm:p-8">
        <Bimo mood="oops" size={130} className="mx-auto block" float />
        <h3 className="font-hud text-2xl font-black">Darurat di Sektor Orion!</h3>
        <p className="text-soft/85">
          &ldquo;Tolong! Pesawatku kehabisan energi di tengah sabuk asteroid. Aku butuh 5 sel energi untuk pulang ke stasiun. Setiap sel hanya bisa diaktifkan dengan jawaban keliling lingkaran yang benar. Kamu mau membantuku?&rdquo;
        </p>
        <button type="button" onClick={() => setStory(false)} className="btn-gold"><Zap size={18} /> Ayo selamatkan BIMO!</button>
      </div>
    );
  }

  const progressPct = (energy / NEEDED) * 100;

  return (
    <div className="space-y-4">
      <div className="panel-hud relative overflow-hidden p-4">
        <div className="mb-3 flex flex-wrap items-center gap-4 font-hud text-sm font-bold">
          <span className="flex items-center gap-1 text-emerald-300"><BatteryCharging size={16} /> ENERGI {energy * 20}%</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: SHIELDS }, (_, i) => (
              <Shield key={i} size={18} className={i < shields ? "fill-ice/40 text-ice" : "text-soft/20"} />
            ))}
          </span>
        </div>
        {/* jalur pesawat menuju stasiun */}
        <div className="relative h-24">
          <div className="absolute left-0 right-12 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
          <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-300 to-ice transition-all duration-700" style={{ width: `calc((100% - 3rem) * ${progressPct / 100})` }} />
          <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-700" style={{ left: `calc((100% - 3rem) * ${progressPct / 100} - 1.5rem)` }}>
            <div className={boost ? "animate-pop-in" : ""}>
              <svg viewBox="0 0 64 40" width="64" height="40" aria-label="Pesawat BIMO">
                {boost && <path d="M2 20 L14 14 L14 26 Z" fill="#FFD76A" />}
                <path d="M14 12 L46 12 Q60 20 46 28 L14 28 Z" fill="#F3F7FF" stroke="#318BFF" strokeWidth="2" />
                <circle cx="40" cy="20" r="5" fill="#62E5F5" />
                <path d="M20 12 L14 4 L26 12 Z M20 28 L14 36 L26 28 Z" fill="#318BFF" />
              </svg>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2" aria-label="Stasiun luar angkasa">
            <svg viewBox="0 0 48 48" width="48" height="48">
              <circle cx="24" cy="24" r="12" fill="#1D55A6" stroke="#62E5F5" strokeWidth="2" />
              <rect x="0" y="21" width="48" height="6" fill="#62E5F5" opacity="0.6" />
              <circle cx="24" cy="24" r="4" fill="#FFD76A" />
            </svg>
          </div>
        </div>
      </div>

      <div key={attempts} className="panel animate-slide-up space-y-4 p-5 sm:p-6">
        <p className="eyebrow">Tantangan sel energi #{energy + 1}</p>
        <p className="text-lg font-bold">{ch.prompt}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ch.options.map((opt, i) => {
            const state = picked !== null ? (opt === ch.answer ? "border-emerald-300 bg-emerald-400/15" : i === picked ? "border-rose-300 bg-rose-400/15 animate-shake" : "opacity-50") : "hover:-translate-y-1 hover:border-emerald-300/70";
            return (
              <button key={i} type="button" onClick={() => choose(i)} disabled={picked !== null} className={`flex flex-col items-center gap-2 rounded-3xl border border-emerald-300/25 bg-navy/50 p-4 transition ${state}`}>
                <BatteryCharging className="text-emerald-300" />
                <span className="font-hud text-xl font-black">{formatNumber(opt)}</span>
                <span className="text-xs text-soft/60">{ch.unit}</span>
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="flex animate-pop-in flex-wrap items-center gap-4 rounded-2xl bg-white/5 p-4">
            <Bimo mood={correctPick ? "proud" : "oops"} size={60} />
            <div className="min-w-0 flex-1 text-sm">
              <p className={`font-bold ${correctPick ? "text-emerald-200" : "text-rose-200"}`}>
                {correctPick ? "Sel energi aktif! Pesawat melaju!" : "Sel energi korsleting! Perisai berkurang."}
              </p>
              <p className="text-soft/85">{ch.explanation}</p>
            </div>
            <button type="button" onClick={next} className="btn-primary">{finished ? "Lihat hasil misi" : "Tantangan berikutnya"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
