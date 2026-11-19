"use client";

import { useMemo, useState } from "react";
import { Check, Lock, Star } from "lucide-react";
import { MISSIONS } from "@/content/missions";
import { PLANETS } from "@/content/planets";
import { missionStates, type JourneyFlags, type MissionState } from "@/lib/progress";
import type { LessonProgressRow } from "@/lib/types";
import { playSfx } from "@/lib/sound";
import { PlanetArt } from "./PlanetArt";
import { PlanetDialog, type PlanetDialogInfo } from "./PlanetDialog";

const STATUS_LABEL: Record<MissionState, string> = {
  locked: "Terkunci",
  available: "Siap dijelajahi",
  in_progress: "Sedang dijelajahi",
  completed: "Ditaklukkan",
};

const ANGLES = [-150, -90, -30, 30, 90, 150];

/** Enam planet materi tersusun seperti tata surya mini. */
export function PlanetSystem({ progress, journey }: { progress: LessonProgressRow[]; journey: JourneyFlags }) {
  const states = useMemo(() => missionStates(progress, journey), [progress, journey]);
  const stars = useMemo(() => new Map(progress.map((p) => [p.lesson_id, p.stars])), [progress]);
  const [picked, setPicked] = useState<PlanetDialogInfo | null>(null);

  const planets = PLANETS.slice(0, 6).map((p) => {
    const m = MISSIONS[p.id - 1];
    const s = states[p.id];
    const info: PlanetDialogInfo = {
      title: p.name,
      subtitle: `${m.code} · ${m.planet}`,
      description: p.short,
      items: m.objectives.slice(0, 3),
      variant: p.variant,
      status: s,
      stars: stars.get(p.id) ?? 0,
      href: `/missions/${m.slug}`,
      cta: s === "completed" ? "Kunjungi lagi" : "Masuki misi",
      lockedHint: p.id === 1 ? "Kerjakan Pre-test dulu, ya!" : `Taklukkan ${PLANETS[p.id - 2].name} dulu.`,
    };
    return { p, s, info };
  });

  const open = (info: PlanetDialogInfo) => {
    playSfx("select");
    setPicked(info);
  };

  return (
    <>
      {/* Desktop: tata surya mini */}
      <div className="relative mx-auto hidden aspect-[16/10] w-full max-w-5xl md:block">
        <div className="absolute left-1/2 top-1/2 h-[78%] w-[86%] -translate-x-1/2 -translate-y-1/2">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden="true">
            <ellipse cx="50" cy="50" rx="49.5" ry="49.5" fill="none" stroke="#62E5F5" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="6 10" vectorEffect="non-scaling-stroke">
              <animate attributeName="stroke-dashoffset" from="0" to="-160" dur="12s" repeatCount="indefinite" />
            </ellipse>
          </svg>
        </div>
        <div className="absolute left-1/2 top-1/2 h-[46%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-nebula/20" />
        <div className="absolute left-1/2 top-1/2 w-[17%] -translate-x-1/2 -translate-y-1/2 text-center">
          <PlanetArt variant="sun" size="100%" />
          <p className="-mt-2 font-hud text-xs font-bold tracking-widest text-gold">GALAKSI LINGKARAN</p>
        </div>

        {planets.map(({ p, s, info }, i) => {
          const a = (ANGLES[i] * Math.PI) / 180;
          const left = 50 + Math.cos(a) * 41;
          const top = 50 + Math.sin(a) * 37;
          const locked = s === "locked";
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => open(info)}
              className="group absolute flex w-[19%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center focus-visible:outline-none"
              style={{ left: `${left}%`, top: `${top}%` }}
              aria-label={`${p.name} — ${STATUS_LABEL[s]}`}
            >
              <span className={`relative block w-[66%] transition duration-300 group-hover:-translate-y-1 group-hover:scale-110 ${s === "in_progress" || s === "available" ? "animate-pulse-glow rounded-full" : ""}`}>
                <PlanetArt variant={p.variant} size="100%" dim={locked} />
                <span className="absolute -bottom-1 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border-2 border-navy text-navy shadow-lg" style={{ background: locked ? "#4B5779" : p.color }}>
                  {locked ? <Lock size={14} /> : <Icon size={16} strokeWidth={2.6} />}
                </span>
                {s === "completed" && (
                  <span className="absolute right-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-gold text-navy shadow-[0_0_14px_#FFD76A]">
                    <Check size={15} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className={`mt-3 font-hud text-[12px] font-black leading-tight ${locked ? "text-soft/45" : "text-soft"}`} style={{ color: locked ? undefined : p.color }}>
                {p.name}
              </span>
              <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-soft/60">{p.short}</span>
              <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-soft/70">
                {s === "completed"
                  ? [1, 2, 3].map((n) => <Star key={n} size={11} className={n <= (stars.get(p.id) ?? 0) ? "fill-gold text-gold" : "text-soft/25"} />)
                  : STATUS_LABEL[s]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ponsel: planet bertingkat */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:hidden">
        {planets.map(({ p, s, info }) => {
          const locked = s === "locked";
          const Icon = p.icon;
          return (
            <button key={p.id} type="button" onClick={() => open(info)} className="group flex flex-col items-center text-center active:scale-95">
              <span className={`relative block w-28 ${s === "in_progress" || s === "available" ? "animate-pulse-glow rounded-full" : ""}`}>
                <PlanetArt variant={p.variant} size="100%" dim={locked} />
                <span className="absolute -bottom-1 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full border-2 border-navy text-navy" style={{ background: locked ? "#4B5779" : p.color }}>
                  {locked ? <Lock size={14} /> : <Icon size={16} strokeWidth={2.6} />}
                </span>
                {s === "completed" && (
                  <span className="absolute right-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-gold text-navy">
                    <Check size={15} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="mt-3 font-hud text-xs font-black" style={{ color: locked ? "rgba(243,247,255,0.45)" : p.color }}>{p.name}</span>
              <span className="text-[11px] text-soft/60">{STATUS_LABEL[s]}</span>
            </button>
          );
        })}
      </div>

      {picked && <PlanetDialog info={picked} onClose={() => setPicked(null)} />}
    </>
  );
}
