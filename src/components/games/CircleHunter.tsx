"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ScanSearch, Timer } from "lucide-react";
import { hunterRound, scoreHunterRound } from "@/lib/games";
import { OBJECT_INFO } from "@/lib/objects";
import { ObjectIcon } from "@/components/cosmic/ObjectIcon";
import type { GameFinish } from "./GameShell";

const ROUNDS = 5;
const TIME = 25;
const isCircle = (o: string) => OBJECT_INFO[o]?.circle ?? false;

export function CircleHunter({ onFinish }: { onFinish: (r: GameFinish) => void }) {
  const [round, setRound] = useState(0);
  const [objects, setObjects] = useState<string[]>(() => hunterRound());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [time, setTime] = useState(TIME);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [roundPts, setRoundPts] = useState(0);

  const check = useCallback(() => {
    if (checked) return;
    const r = scoreHunterRound(objects, selected, isCircle);
    setScore((s) => s + r.score);
    setCorrect((c) => c + r.correct);
    setRoundPts(r.score);
    setChecked(true);
  }, [checked, objects, selected]);

  useEffect(() => {
    if (checked) return;
    if (time <= 0) {
      check();
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, checked, check]);

  const next = () => {
    if (round + 1 >= ROUNDS) {
      onFinish({ score, correct, total: ROUNDS * 4 });
      return;
    }
    setRound(round + 1);
    setObjects(hunterRound());
    setSelected(new Set());
    setChecked(false);
    setTime(TIME);
  };

  const toggle = (o: string) => {
    if (checked) return;
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(o)) n.delete(o);
      else n.add(o);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      <div className="panel-hud flex flex-wrap items-center gap-4 px-4 py-3 font-hud text-sm font-bold">
        <span>RONDE {round + 1}/{ROUNDS}</span>
        <span className="text-gold">SKOR {score}</span>
        <span className={`ml-auto flex items-center gap-1 ${time <= 5 && !checked ? "animate-pulse text-rose-300" : "text-ice"}`}><Timer size={16} /> {time}s</span>
      </div>
      <p className="text-center font-semibold text-soft/80"><ScanSearch className="mr-1 inline" size={18} /> Ketuk semua benda berbentuk <span className="text-ice">lingkaran</span>!</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {objects.map((o) => {
          const sel = selected.has(o);
          const circ = isCircle(o);
          const state = checked
            ? circ
              ? sel ? "border-emerald-300 bg-emerald-400/15" : "border-gold bg-gold/10"
              : sel ? "border-rose-300 bg-rose-400/15" : "border-white/10 opacity-60"
            : sel ? "border-ice bg-royal/40 ring-2 ring-ice/50" : "border-ice/15 bg-navy/40 hover:border-ice/50";
          return (
            <button key={o} type="button" onClick={() => toggle(o)} aria-pressed={sel} className={`relative flex flex-col items-center gap-2 rounded-3xl border p-3 transition ${state}`}>
              {sel && !checked && <Check className="absolute right-2 top-2 text-ice" size={18} />}
              <ObjectIcon name={o} size={72} />
              <span className="text-sm font-bold">{OBJECT_INFO[o].name}</span>
              {checked && <span className="text-xs leading-snug text-soft/75">{OBJECT_INFO[o].why}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {checked ? (
          <p className="font-bold text-gold">Ronde ini: +{roundPts} poin. {roundPts === 40 ? "Sempurna!" : "Kuning = lingkaran yang terlewat."}</p>
        ) : (
          <p className="text-sm text-soft/60">{selected.size} objek dipilih</p>
        )}
        {checked ? (
          <button type="button" onClick={next} className="btn-primary">{round + 1 >= ROUNDS ? "Lihat hasil" : "Ronde berikutnya"}</button>
        ) : (
          <button type="button" onClick={check} className="btn-cyan">Periksa</button>
        )}
      </div>
    </div>
  );
}
