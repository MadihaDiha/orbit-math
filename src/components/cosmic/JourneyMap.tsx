"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Star } from "lucide-react";
import { MISSIONS } from "@/content/missions";
import { PLANETS } from "@/content/planets";
import { missionStates, type JourneyFlags, type MissionState } from "@/lib/progress";
import type { LessonProgressRow } from "@/lib/types";
import { playSfx } from "@/lib/sound";
import { NodeArt, PlanetDialog, type PlanetDialogInfo } from "./PlanetDialog";

interface JourneyNode {
  key: string;
  label: string;
  status: MissionState;
  current: boolean;
  stars?: number;
  info: PlanetDialogInfo;
}

/** Menyusun 9 titik perjalanan: Pre-test → 6 planet → Stasiun Final → Post-test. */
export function buildJourneyNodes(progress: LessonProgressRow[], journey: JourneyFlags): JourneyNode[] {
  const states = missionStates(progress, journey);
  const byId = new Map(progress.map((p) => [p.lesson_id, p]));
  const nodes: Omit<JourneyNode, "current">[] = [];

  nodes.push({
    key: "pretest",
    label: "Pre-test",
    status: journey.pretest ? "completed" : "available",
    info: {
      title: "Landasan Peluncuran",
      subtitle: "Pre-test",
      description: journey.pretest
        ? `Pre-test selesai dengan nilai ${journey.pretest.score}. Nilai ini akan dibandingkan dengan post-test.`
        : "Sebelum berangkat, uji pengetahuan awalmu dulu. 10 soal pilihan ganda — tidak menakutkan, kok!",
      variant: "launch",
      status: journey.pretest ? "completed" : "available",
      href: "/pretest",
      cta: journey.pretest ? "Lihat hasil pre-test" : "Mulai Pre-test",
    },
  });

  for (const m of MISSIONS) {
    const planet = PLANETS[m.id - 1];
    const s = states[m.id];
    nodes.push({
      key: `m${m.id}`,
      label: planet.name.replace("Planet ", ""),
      status: s,
      stars: byId.get(m.id)?.stars,
      info: {
        title: planet.name,
        subtitle: `${m.code} · ${m.planet}`,
        description: planet.short,
        items: m.objectives.slice(0, 3),
        variant: planet.variant,
        status: s,
        stars: byId.get(m.id)?.stars ?? 0,
        href: `/missions/${m.slug}`,
        cta: s === "completed" ? "Kunjungi lagi" : s === "in_progress" ? "Lanjutkan misi" : "Masuki misi",
        lockedHint: m.id === 1 ? "Kerjakan Pre-test dulu, ya! Setelah itu planet ini langsung terbuka." : `Taklukkan ${PLANETS[m.id - 2].name} dulu untuk membuka planet ini.`,
      },
    });
  }

  const postUnlocked = states[7] === "completed";
  const postStatus: MissionState = journey.posttest ? "completed" : postUnlocked ? "available" : "locked";
  nodes.push({
    key: "posttest",
    label: "Post-test",
    status: postStatus,
    info: {
      title: "Portal Pulang",
      subtitle: "Post-test",
      description: journey.posttest
        ? `Post-test terakhir: nilai ${journey.posttest.score}. Lihat perkembanganmu di halaman Hasil Akhir.`
        : "Misi terakhir: buktikan semua yang sudah kamu pelajari, lalu bandingkan dengan nilai pre-test-mu!",
      variant: "portal",
      status: postStatus,
      href: journey.posttest ? "/results" : "/posttest",
      cta: journey.posttest ? "Lihat Hasil Akhir" : "Mulai Post-test",
      lockedHint: "Selesaikan Stasiun Final untuk membuka Portal Pulang.",
    },
  });

  const currentIdx = nodes.findIndex((n) => n.status !== "completed" && n.status !== "locked");
  return nodes.map((n, i) => ({ ...n, current: i === currentIdx }));
}

type Pt = [number, number];

const DESKTOP: { w: number; h: number; pts: Pt[]; node: number } = {
  w: 1120,
  h: 460,
  node: 96,
  pts: [[70, 330], [200, 165], [330, 320], [455, 150], [580, 310], [705, 150], [830, 310], [955, 160], [1060, 330]],
};
const MOBILE: { w: number; h: number; pts: Pt[]; node: number } = {
  w: 360,
  h: 1240,
  node: 96,
  pts: [[90, 80], [270, 210], [90, 340], [270, 470], [90, 600], [270, 730], [90, 860], [270, 990], [130, 1130]],
};

/** Catmull-Rom → kurva Bézier: jalur mulus yang melewati setiap planet. */
function segments(pts: Pt[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    out.push(`M${p1[0]} ${p1[1]} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`);
  }
  return out;
}

function Layout({ layout, nodes, onPick, compact }: { layout: typeof DESKTOP; nodes: JourneyNode[]; onPick: (n: JourneyNode) => void; compact: boolean }) {
  const segs = useMemo(() => segments(layout.pts), [layout]);
  const full = useMemo(() => segs.map((s, i) => (i === 0 ? s : s.replace(/^M[^C]+/, ""))).join(" "), [segs]);
  const refs = useRef<(SVGPathElement | null)[]>([]);
  const [fraction, setFraction] = useState<number | null>(null);
  const target = Math.max(0, nodes.findIndex((n) => n.current) === -1 ? nodes.length - 1 : nodes.findIndex((n) => n.current));

  useEffect(() => {
    const lens = refs.current.map((p) => p?.getTotalLength() ?? 0);
    const total = lens.reduce((a, b) => a + b, 0);
    const upTo = lens.slice(0, target).reduce((a, b) => a + b, 0);
    // pesawat berhenti tepat sebelum planet tujuan
    setFraction(total > 0 ? Math.max(0, Math.min(1, (upTo - (target > 0 ? 78 : 0)) / total)) : 0);
  }, [target, segs]);

  const nodePct = (layout.node / layout.w) * 100;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${layout.w} / ${layout.h}` }}>
      <svg viewBox={`0 0 ${layout.w} ${layout.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {segs.map((d, i) => {
          const done = nodes[i].status === "completed";
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="#62E5F5" strokeOpacity={done ? 0 : 0.28} strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" ref={(el) => { refs.current[i] = el; }} />
              {done && <path d={d} fill="none" stroke="#FFD76A" strokeWidth="5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #FFD76A)" }} />}
            </g>
          );
        })}
        {/* bintang di sepanjang jalur */}
        {layout.pts.slice(0, -1).map((p, i) => {
          const q = layout.pts[i + 1];
          const x = (p[0] + q[0]) / 2 + (i % 2 ? 14 : -14);
          const y = (p[1] + q[1]) / 2 + (i % 2 ? -18 : 18);
          return (
            <path
              key={i}
              d={`M${x} ${y - 9} L${x + 2.6} ${y - 2.6} L${x + 9} ${y} L${x + 2.6} ${y + 2.6} L${x} ${y + 9} L${x - 2.6} ${y + 2.6} L${x - 9} ${y} L${x - 2.6} ${y - 2.6} Z`}
              fill={nodes[i].status === "completed" ? "#FFD76A" : "#C9D8F5"}
              opacity={nodes[i].status === "completed" ? 1 : 0.4}
              className="animate-twinkle"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          );
        })}
        {/* pesawat astronot mengikuti jalur sampai planet saat ini */}
        {fraction !== null && (
          <g key={fraction} style={{ filter: "drop-shadow(0 0 8px rgba(98,229,245,0.8))" }}>
            <ellipse cx="0" cy="0" rx="20" ry="9" fill="#F3F7FF" stroke="#C9D8F5" strokeWidth="2" />
            <circle cx="7" cy="-1" r="5" fill="#0B1E44" stroke="#62E5F5" strokeWidth="2" />
            <path d="M-12 -7 L-20 -16 L-6 -8 Z M-12 7 L-20 16 L-6 8 Z" fill="#8D7CFF" />
            <path d="M-20 -4 L-34 0 L-20 4 Z" fill="#FFD76A" className="bimo-flame" />
            <animateMotion dur="2.6s" fill="freeze" rotate="auto" keyPoints={`0;${fraction.toFixed(4)}`} keyTimes="0;1" calcMode="linear" path={full} />
          </g>
        )}
      </svg>

      {nodes.map((n, i) => {
        const [x, y] = layout.pts[i];
        const locked = n.status === "locked";
        return (
          <button
            key={n.key}
            type="button"
            onClick={() => onPick(n)}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus-visible:outline-none"
            style={{ left: `${(x / layout.w) * 100}%`, top: `${(y / layout.h) * 100}%`, width: `${nodePct * (compact ? 0.85 : 1)}%` }}
            aria-label={`${n.info.title} — ${n.status === "completed" ? "selesai" : locked ? "terkunci" : "terbuka"}`}
          >
            <span
              className={`relative block w-full rounded-full transition duration-300 group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-ice ${
                n.current ? "animate-pulse-glow" : ""
              } ${locked ? "opacity-70" : ""}`}
            >
              <NodeArt variant={n.info.variant} size="100%" dim={locked} />
              {n.status === "completed" && (
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-gold text-navy shadow-[0_0_14px_#FFD76A]">
                  <Check size={16} strokeWidth={3} />
                </span>
              )}
              {n.current && <span className="absolute -inset-2 rounded-full border-2 border-ice/70" />}
            </span>
            <span className={`mt-1 whitespace-nowrap rounded-full px-2 py-0.5 text-center font-hud text-[10px] font-bold sm:text-[11px] ${locked ? "text-soft/40" : n.current ? "bg-ice/20 text-ice" : "text-soft/85"}`}>
              {n.label}
            </span>
            {n.status === "completed" && n.stars !== undefined && (
              <span className="flex gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star key={s} size={10} className={s <= (n.stars ?? 0) ? "fill-gold text-gold" : "text-soft/25"} />
                ))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Peta Galaxy Journey (desktop: horizontal, ponsel: vertikal). */
export function JourneyMap({ progress, journey, compact = false }: { progress: LessonProgressRow[]; journey: JourneyFlags; compact?: boolean }) {
  const nodes = useMemo(() => buildJourneyNodes(progress, journey), [progress, journey]);
  const [picked, setPicked] = useState<JourneyNode | null>(null);
  const pick = (n: JourneyNode) => {
    playSfx("select");
    setPicked(n);
  };

  return (
    <>
      <div className="hidden md:block">
        <Layout layout={DESKTOP} nodes={nodes} onPick={pick} compact={compact} />
      </div>
      <div className="mx-auto max-w-sm md:hidden">
        <Layout layout={MOBILE} nodes={nodes} onPick={pick} compact={false} />
      </div>
      {picked && <PlanetDialog info={picked.info} onClose={() => setPicked(null)} />}
    </>
  );
}
