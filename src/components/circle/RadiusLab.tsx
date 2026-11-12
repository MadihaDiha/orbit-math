"use client";

import { useState } from "react";
import { PI_OPTIONS, circumferenceFromRadius, diameterFromRadius, formatNumber, piLabel, piValue, suggestPi, type PiChoice } from "@/lib/math";

/** Pengatur jari-jari: lingkaran, diameter, dan keliling berubah otomatis. */
export function RadiusLab() {
  const [r, setR] = useState(7);
  const [pi, setPi] = useState<PiChoice>("22/7");

  const d = diameterFromRadius(r);
  const k = circumferenceFromRadius(r, piValue(pi));
  const px = 18 + (r / 21) * 82; // radius visual 18..100
  const pct = ((r - 1) / 20) * 100;

  return (
    <div className="grid items-center gap-6 lg:grid-cols-2">
      <div className="panel-hud grid-hud p-4">
        <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[340px]" role="img" aria-label={`Lingkaran berjari-jari ${r}`}>
          <circle cx="120" cy="120" r="104" fill="none" stroke="#62E5F5" strokeOpacity="0.1" strokeDasharray="2 6" />
          <circle cx="120" cy="120" r={px} fill="#1D55A6" fillOpacity="0.35" stroke="#FFD76A" strokeWidth="4" style={{ transition: "r 0.25s ease" }} />
          <line x1={120 - px} y1="120" x2={120 + px} y2="120" stroke="#318BFF" strokeWidth="3" strokeDasharray="6 4" style={{ transition: "all 0.25s ease" }} />
          <line x1="120" y1="120" x2="120" y2={120 - px} stroke="#62E5F5" strokeWidth="4" strokeLinecap="round" style={{ transition: "all 0.25s ease" }} />
          <circle cx="120" cy="120" r="4.5" fill="#FFD76A" />
          <text x="128" y={120 - px / 2} fontSize="13" fontWeight="900" fill="#62E5F5">r</text>
          <text x={120 + px / 2} y="136" fontSize="13" fontWeight="900" fill="#318BFF" textAnchor="middle">d</text>
          <text x="120" y="232" fontSize="12" fontWeight="800" fill="#FFD76A" textAnchor="middle">K</text>
        </svg>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-end justify-between">
            <label htmlFor="radius-slider" className="label mb-0">Jari-jari (r)</label>
            <span className="font-hud text-3xl font-black text-ice">{formatNumber(r)} <span className="text-base text-soft/60">cm</span></span>
          </div>
          <input
            id="radius-slider"
            type="range"
            min={1}
            max={21}
            step={0.5}
            value={r}
            onChange={(e) => setR(Number(e.target.value))}
            className="range-orbit mt-3"
            style={{ backgroundSize: `${pct}% 100%` }}
            aria-valuetext={`${r} cm`}
          />
          <div className="mt-1 flex justify-between text-xs text-soft/50">
            <span>1 cm</span>
            <span>21 cm</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PI_OPTIONS.map((o) => (
            <button key={o.value} type="button" onClick={() => setPi(o.value)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${pi === o.value ? "bg-nebula text-navy" : "border border-nebula/40 text-soft/80"}`}>
              {o.label}
            </button>
          ))}
        </div>
        {suggestPi(r) !== pi && pi !== "exact" && (
          <p className="text-xs text-gold/90">Tips BIMO: untuk r = {formatNumber(r)}, π = {piLabel(suggestPi(r))} membuat hitungan lebih mudah.</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="panel p-4">
            <p className="eyebrow">Diameter</p>
            <p className="mt-1 font-hud text-2xl font-black text-neon">{formatNumber(d)} cm</p>
            <p className="mt-2 text-xs text-soft/70">d = 2 × r = 2 × {formatNumber(r)}</p>
          </div>
          <div className="panel p-4">
            <p className="eyebrow">Keliling</p>
            <p className="mt-1 font-hud text-2xl font-black text-gold">{formatNumber(k)} cm</p>
            <p className="mt-2 text-xs text-soft/70">K = 2 × {piLabel(pi)} × {formatNumber(r)}</p>
          </div>
        </div>
        <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-soft/80">
          Perhatikan: jika r dijadikan 2 kali lipat, diameter dan keliling juga menjadi 2 kali lipat. Keliling selalu ≈ {formatNumber(piValue(pi), 4)} × diameter.
        </p>
      </div>
    </div>
  );
}
