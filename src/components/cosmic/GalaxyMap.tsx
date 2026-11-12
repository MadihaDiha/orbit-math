import Link from "next/link";
import { Check, Lock, Star } from "lucide-react";
import { MISSIONS } from "@/content/missions";
import type { MissionState } from "@/lib/data";

const POS: Record<number, { x: number; y: number; size: number }> = {
  1: { x: 9, y: 70, size: 74 },
  2: { x: 24, y: 34, size: 82 },
  3: { x: 40, y: 66, size: 78 },
  4: { x: 54, y: 28, size: 86 },
  5: { x: 68, y: 64, size: 90 },
  6: { x: 81, y: 30, size: 84 },
  7: { x: 92, y: 72, size: 100 },
};

const STATE_LABEL: Record<MissionState, string> = {
  locked: "Terkunci",
  available: "Siap dijelajahi",
  in_progress: "Sedang dijelajahi",
  completed: "Selesai",
};

function PlanetOrb({ id, state, size }: { id: number; state: MissionState; size: number }) {
  const m = MISSIONS[id - 1];
  const [a, b] = m.colors;
  const locked = state === "locked";
  return (
    <span
      className={`relative grid place-items-center rounded-full transition duration-300 group-hover:scale-110 ${locked ? "grayscale" : ""} ${state === "available" || state === "in_progress" ? "animate-pulse-glow" : ""}`}
      style={{
        width: size,
        height: size,
        background: locked ? "radial-gradient(circle at 30% 30%, #3a4a6b, #142445 70%)" : `radial-gradient(circle at 30% 28%, #ffffff 0%, ${a} 22%, ${b} 70%, #07152F 100%)`,
        boxShadow: locked ? "none" : `0 0 40px -6px ${a}`,
      }}
    >
      {id % 2 === 1 && !locked && <span className="absolute inset-[-14%] rounded-full border-2 border-white/30" style={{ transform: "rotateX(70deg) rotate(-20deg)" }} />}
      <span className="font-hud text-lg font-black text-white drop-shadow">{locked ? <Lock size={20} /> : String(id).padStart(2, "0")}</span>
      {state === "completed" && (
        <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-gold text-navy shadow-lg"><Check size={16} strokeWidth={3} /></span>
      )}
    </span>
  );
}

export function GalaxyMap({ states, stars = {}, compact = false }: { states: Record<number, MissionState>; stars?: Record<number, number>; compact?: boolean }) {
  const ids = MISSIONS.map((m) => m.id);
  const path = ids.map((id, i) => `${i === 0 ? "M" : "L"}${POS[id].x} ${POS[id].y}`).join(" ");
  const lastDone = Math.max(0, ...ids.filter((id) => states[id] === "completed"));
  const donePath = ids.filter((id) => id <= Math.min(7, lastDone + 1)).map((id, i) => `${i === 0 ? "M" : "L"}${POS[id].x} ${POS[id].y}`).join(" ");

  return (
    <>
      {/* Desktop/tablet: peta galaksi */}
      <div className={`relative hidden w-full md:block ${compact ? "aspect-[2.6/1]" : "aspect-[2.1/1]"}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d={path} fill="none" stroke="#62E5F5" strokeOpacity="0.25" strokeWidth="0.4" strokeDasharray="1 1.2" vectorEffect="non-scaling-stroke" />
          {lastDone > 0 && <path d={donePath} fill="none" stroke="#FFD76A" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />}
        </svg>
        {MISSIONS.map((m) => {
          const s = states[m.id] ?? "locked";
          const p = POS[m.id];
          const size = compact ? p.size * 0.75 : p.size;
          const content = (
            <>
              <PlanetOrb id={m.id} state={s} size={size} />
              <span className="mt-2 block whitespace-nowrap text-center">
                <span className={`block font-hud text-[11px] font-bold ${s === "locked" ? "text-soft/40" : "text-ice"}`}>{m.planet}</span>
                {!compact && <span className={`block text-xs ${s === "locked" ? "text-soft/35" : "text-soft/70"}`}>{STATE_LABEL[s]}</span>}
                {s === "completed" && (
                  <span className="mt-0.5 flex justify-center gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <Star key={n} size={11} className={n <= (stars[m.id] ?? 0) ? "fill-gold text-gold" : "text-soft/25"} />
                    ))}
                  </span>
                )}
              </span>
            </>
          );
          return (
            <div key={m.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {s === "locked" ? (
                <div className="flex cursor-not-allowed flex-col items-center" title={`Selesaikan Misi ${m.id - 1} untuk membuka`} aria-label={`${m.planet} terkunci`}>
                  {content}
                </div>
              ) : (
                <Link href={`/missions/${m.slug}`} className="group flex flex-col items-center focus-visible:outline-none" aria-label={`Misi ${m.id}: ${m.title} — ${STATE_LABEL[s]}`}>
                  {content}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Ponsel: lintasan vertikal */}
      <ol className="relative space-y-3 md:hidden">
        <span className="absolute bottom-6 left-[38px] top-6 w-0.5 bg-gradient-to-b from-ice/50 via-neon/30 to-nebula/30" aria-hidden="true" />
        {MISSIONS.map((m) => {
          const s = states[m.id] ?? "locked";
          const inner = (
            <div className={`relative flex items-center gap-4 rounded-3xl border p-3 ${s === "locked" ? "border-white/5 bg-white/[0.02]" : "border-ice/15 bg-deep/50"}`}>
              <PlanetOrb id={m.id} state={s} size={52} />
              <div className="min-w-0 flex-1">
                <p className={`font-hud text-[11px] font-bold ${s === "locked" ? "text-soft/40" : "text-ice"}`}>{m.code} · {m.planet}</p>
                <p className={`truncate font-bold ${s === "locked" ? "text-soft/40" : ""}`}>{m.title}</p>
                <p className="text-xs text-soft/55">{STATE_LABEL[s]}</p>
              </div>
            </div>
          );
          return (
            <li key={m.id}>
              {s === "locked" ? inner : <Link href={`/missions/${m.slug}`} className="block">{inner}</Link>}
            </li>
          );
        })}
      </ol>
    </>
  );
}
