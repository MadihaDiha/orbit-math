"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/math";

const R = 30; // jari-jari visual (px)
const X0 = 50;
const GROUND = 150;
const CIRC = 2 * Math.PI * R;
const DURATION = 3200; // ms per putaran

/** Simulasi roda menggelinding: jarak satu putaran = keliling roda. */
export function RotationSimulator() {
  const [turns, setTurns] = useState(1);
  const [radiusCm, setRadiusCm] = useState(35);
  const [progress, setProgress] = useState(0); // 0..turns
  const [running, setRunning] = useState(false);
  const frame = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = null;
    last.current = null;
  }, []);

  useEffect(() => {
    if (!running) {
      stop();
      return;
    }
    const tick = (t: number) => {
      if (last.current == null) last.current = t;
      const dt = t - last.current;
      last.current = t;
      setProgress((p) => {
        const next = Math.min(turns, p + dt / DURATION);
        if (next >= turns) setRunning(false);
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return stop;
  }, [running, turns, stop]);

  const reset = () => {
    setRunning(false);
    setProgress(0);
  };

  const start = () => {
    if (progress >= turns) setProgress(0);
    setRunning(true);
  };

  const cx = X0 + progress * CIRC;
  const angle = progress * 360;
  const theta = progress * 2 * Math.PI;
  const marker = { x: cx - R * Math.sin(theta), y: GROUND - R + R * Math.cos(theta) };

  // jejak titik merah (sikloid)
  const trail: string[] = [];
  const steps = Math.max(2, Math.floor(progress * 60));
  for (let i = 0; i <= steps; i++) {
    const p = (progress * i) / steps;
    const th = p * 2 * Math.PI;
    const x = X0 + p * CIRC - R * Math.sin(th);
    const y = GROUND - R + R * Math.cos(th);
    trail.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  const kCm = 2 * (22 / 7) * radiusCm;
  const done = progress >= turns;
  const fullTurns = Math.floor(progress + 1e-9);

  return (
    <div className="space-y-5">
      <div className="panel-hud overflow-hidden p-3">
        <svg viewBox="0 0 680 190" className="w-full" role="img" aria-label="Simulasi roda berputar">
          <line x1="20" y1={GROUND} x2="660" y2={GROUND} stroke="#C9D8F5" strokeOpacity="0.35" strokeWidth="2" />
          {Array.from({ length: turns + 1 }, (_, i) => (
            <g key={i}>
              <line x1={X0 + i * CIRC} y1={GROUND - 6} x2={X0 + i * CIRC} y2={GROUND + 14} stroke="#62E5F5" strokeWidth="2" />
              <text x={X0 + i * CIRC} y={GROUND + 30} textAnchor="middle" fontSize="12" fill="#62E5F5" fontWeight="800">
                {i === 0 ? "start" : `${i}K`}
              </text>
            </g>
          ))}
          {/* jarak yang ditempuh */}
          <line x1={X0} y1={GROUND + 2} x2={cx} y2={GROUND + 2} stroke="#FFD76A" strokeWidth="6" strokeLinecap="round" />
          <path d={trail.join(" ")} fill="none" stroke="#FF5C7A" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="4 4" />

          <g transform={`rotate(${angle} ${cx} ${GROUND - R})`}>
            <circle cx={cx} cy={GROUND - R} r={R} fill="#1B2A44" stroke="#FFD76A" strokeWidth="5" />
            {[0, 45, 90, 135].map((a) => (
              <line key={a} x1={cx - R + 6} y1={GROUND - R} x2={cx + R - 6} y2={GROUND - R} stroke="#C9D8F5" strokeWidth="2" transform={`rotate(${a} ${cx} ${GROUND - R})`} />
            ))}
            <circle cx={cx} cy={GROUND - R} r="5" fill="#318BFF" />
          </g>
          <circle cx={marker.x} cy={marker.y} r="6" fill="#FF5C7A" stroke="#fff" strokeWidth="2" />
          <text x={cx} y={GROUND - 2 * R - 12} textAnchor="middle" fontSize="12" fill="#F3F7FF" fontWeight="800">
            {Math.round(angle)}°
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={start} disabled={running} className="btn-primary">
          <Play size={18} /> Mulai
        </button>
        <button type="button" onClick={() => setRunning(false)} disabled={!running} className="btn-ghost">
          <Pause size={18} /> Jeda
        </button>
        <button type="button" onClick={reset} className="btn-ghost">
          <RotateCcw size={18} /> Ulangi
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm font-bold">
          Putaran
          <select value={turns} onChange={(e) => { setTurns(Number(e.target.value)); reset(); }} className="input w-20 py-2">
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          r roda
          <select value={radiusCm} onChange={(e) => { setRadiusCm(Number(e.target.value)); reset(); }} className="input w-28 py-2">
            {[7, 14, 21, 28, 35].map((n) => (
              <option key={n} value={n}>{n} cm</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="eyebrow">Putaran</p>
          <p className="mt-1 font-hud text-2xl font-black">{formatNumber(progress, 2)} / {turns}</p>
        </div>
        <div className="panel p-4">
          <p className="eyebrow">Keliling roda</p>
          <p className="mt-1 font-hud text-2xl font-black text-gold">{formatNumber(kCm)} cm</p>
          <p className="text-xs text-soft/60">K = 2 × 22/7 × {radiusCm}</p>
        </div>
        <div className="panel p-4">
          <p className="eyebrow">Jarak ditempuh</p>
          <p className="mt-1 font-hud text-2xl font-black text-ice">{formatNumber(progress * kCm)} cm</p>
          <p className="text-xs text-soft/60">= putaran × K</p>
        </div>
      </div>

      <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${done ? "bg-gold/15 text-gold" : "bg-white/5 text-soft/80"}`} aria-live="polite">
        {done
          ? `Satu putaran penuh tercapai ${turns > 1 ? `${turns} kali` : ""}! Jarak = ${turns} × ${formatNumber(kCm)} = ${formatNumber(turns * kCm)} cm. Tanpa tergelincir, jarak 1 putaran = keliling roda.`
          : fullTurns > 0
            ? `${fullTurns} putaran penuh = ${formatNumber(fullTurns * kCm)} cm. Perhatikan garis emas sepanjang ${fullTurns}K!`
            : "Titik merah menyentuh tanah di awal. Saat ia menyentuh tanah lagi, roda tepat berputar satu kali."}
      </p>
    </div>
  );
}
