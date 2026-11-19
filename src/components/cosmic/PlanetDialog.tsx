"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, Lock, Rocket, Star, X } from "lucide-react";
import { PlanetArt, type PlanetVariant } from "./PlanetArt";
import { Bimo } from "@/components/bimo/Bimo";

export interface PlanetDialogInfo {
  title: string;
  subtitle: string;
  description: string;
  variant: PlanetVariant | "launch" | "portal";
  status: "locked" | "available" | "in_progress" | "completed";
  stars?: number;
  href: string;
  cta: string;
  lockedHint?: string;
  items?: string[];
}

const STATUS: Record<PlanetDialogInfo["status"], { label: string; cls: string }> = {
  locked: { label: "Terkunci", cls: "border-white/20 bg-white/5 text-soft/60" },
  available: { label: "Siap dijelajahi", cls: "border-ice/50 bg-ice/15 text-ice" },
  in_progress: { label: "Sedang dijelajahi", cls: "border-nebula/60 bg-nebula/20 text-nebula" },
  completed: { label: "Selesai", cls: "border-gold/60 bg-gold/15 text-gold" },
};

export function NodeArt({ variant, size, dim }: { variant: PlanetDialogInfo["variant"]; size: number | string; dim?: boolean }) {
  if (variant === "launch") return <LaunchPadArt size={size} dim={dim} />;
  if (variant === "portal") return <PortalArt size={size} dim={dim} />;
  return <PlanetArt variant={variant} size={size} dim={dim} />;
}

/** Info planet saat diketuk: nama, materi, status, tombol masuk misi. */
export function PlanetDialog({ info, onClose }: { info: PlanetDialogInfo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const st = STATUS[info.status];
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="planet-title">
      <button type="button" className="absolute inset-0 bg-navy/75 backdrop-blur-sm" onClick={onClose} aria-label="Tutup" />
      <div className="panel relative w-full max-w-md animate-pop-in overflow-hidden p-6 text-center">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-full p-2 text-soft/60 hover:bg-white/10" aria-label="Tutup">
          <X size={18} />
        </button>
        <div className="mx-auto -mt-2 w-40">
          <NodeArt variant={info.variant} size="100%" dim={info.status === "locked"} />
        </div>
        <p className="eyebrow mt-2">{info.subtitle}</p>
        <h3 id="planet-title" className="mt-1 font-hud text-2xl font-black">{info.title}</h3>
        <span className={`chip mx-auto mt-3 ${st.cls}`}>
          {info.status === "completed" ? <CheckCircle2 size={14} /> : info.status === "locked" ? <Lock size={14} /> : null} {st.label}
        </span>
        {info.status === "completed" && info.stars !== undefined && (
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3].map((n) => (
              <Star key={n} size={20} className={n <= (info.stars ?? 0) ? "fill-gold text-gold" : "text-soft/25"} />
            ))}
          </div>
        )}
        <p className="mt-4 text-soft/85">{info.description}</p>
        {info.items && (
          <ul className="mt-3 space-y-1 text-left text-sm text-soft/75">
            {info.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ice" /> {it}
              </li>
            ))}
          </ul>
        )}
        {info.status === "locked" ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-left text-sm">
            <Bimo mood="thinking" size={48} />
            <p>{info.lockedHint ?? "Selesaikan misi sebelumnya untuk membuka planet ini."}</p>
          </div>
        ) : (
          <Link href={info.href} className="btn-gold btn-glow btn-press mt-6 w-full py-3 text-base">
            <Rocket size={18} /> {info.cta}
          </Link>
        )}
      </div>
    </div>
  );
}

/** Landasan peluncuran (node Pre-test). */
export function LaunchPadArt({ size, dim }: { size: number | string; dim?: boolean }) {
  return (
    <svg viewBox="-20 -20 140 140" width={size} height={size} aria-hidden="true" className="overflow-visible" style={dim ? { filter: "grayscale(0.8) brightness(0.6)" } : undefined}>
      <circle cx="50" cy="50" r="58" fill="#62E5F5" opacity="0.12" />
      <ellipse cx="50" cy="92" rx="44" ry="10" fill="#1D55A6" stroke="#62E5F5" strokeWidth="2" />
      <rect x="20" y="84" width="60" height="8" rx="3" fill="#102B59" />
      <g className="animate-float">
        <path d="M50 6 C66 22 66 52 62 70 H38 C34 52 34 22 50 6 Z" fill="#F3F7FF" stroke="#C9D8F5" strokeWidth="2" />
        <circle cx="50" cy="36" r="8" fill="#0B1E44" stroke="#62E5F5" strokeWidth="2.5" />
        <path d="M38 56 L26 74 L38 70 Z M62 56 L74 74 L62 70 Z" fill="#8D7CFF" />
        <path d="M43 70 Q50 92 57 70 Z" fill="#FFD76A" className="bimo-flame" />
      </g>
    </svg>
  );
}

/** Portal bintang (node Post-test: misi pulang). */
export function PortalArt({ size, dim }: { size: number | string; dim?: boolean }) {
  return (
    <svg viewBox="-20 -20 140 140" width={size} height={size} aria-hidden="true" className="overflow-visible" style={dim ? { filter: "grayscale(0.8) brightness(0.6)" } : undefined}>
      <circle cx="50" cy="50" r="60" fill="#FFD76A" opacity="0.1" />
      <g className="orbit-spin" style={{ animationDuration: "12s", transformBox: "view-box", transformOrigin: "50px 50px" }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#8D7CFF" strokeWidth="6" strokeDasharray="20 10" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#62E5F5" strokeWidth="3" strokeDasharray="8 8" />
      </g>
      <circle cx="50" cy="50" r="26" fill="#102B59" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#FFD76A" strokeWidth="3" />
      <path d="M50 30 L54.6 43.6 L69 44 L57.5 52.6 L61.8 66.4 L50 58 L38.2 66.4 L42.5 52.6 L31 44 L45.4 43.6 Z" fill="#FFD76A" className="animate-twinkle" />
    </svg>
  );
}
