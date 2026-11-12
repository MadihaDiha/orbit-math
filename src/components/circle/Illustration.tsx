import type { ReactNode } from "react";
import { CircleDiagram, type CircleElement, ANATOMY_ELEMENTS } from "./CircleDiagram";
import { ObjectIcon } from "@/components/cosmic/ObjectIcon";

const SCENES = ["wheel", "garden", "table", "track", "clock", "ribbon", "coin", "plate"];

/**
 * Ilustrasi berbasis kunci teks (dipakai di soal dari database & konten materi).
 *   anatomy:<unsur> | circle-r:<label> | circle-d:<label> | circle-k
 *   compare-shapes | pi-unroll | formula-link | <objek>:<label>
 */
export function Illustration({ name, className = "" }: { name: string | null | undefined; className?: string }) {
  if (!name) return null;
  const idx = name.indexOf(":");
  const key = idx === -1 ? name : name.slice(0, idx);
  const label = idx === -1 ? undefined : name.slice(idx + 1);

  let content: ReactNode = null;

  if (key === "anatomy" && label && (ANATOMY_ELEMENTS as string[]).includes(label)) {
    content = <CircleDiagram highlight={label as CircleElement} />;
  } else if (key === "circle-r") {
    content = <CircleDiagram highlight="radius" label={label ? `r = ${label.replace(/^r\s*=\s*/, "")}` : "r"} />;
  } else if (key === "circle-d") {
    content = <CircleDiagram highlight="diameter" label={label ? (label.includes("=") ? label : `d = ${label}`) : "d"} />;
  } else if (key === "circle-k") {
    content = <CircleDiagram highlight="circumference" label="Keliling (K)" />;
  } else if (key === "compare-shapes") {
    content = <CompareShapes />;
  } else if (key === "pi-unroll") {
    content = <PiUnroll />;
  } else if (key === "formula-link") {
    content = <FormulaLink />;
  } else if (SCENES.includes(key)) {
    content = (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full" />
          <ObjectIcon name={key} size={120} />
        </div>
        {label && <span className="chip text-sm">{label}</span>}
      </div>
    );
  }

  if (!content) return null;
  return <div className={`mx-auto w-full max-w-[260px] ${className}`}>{content}</div>;
}

function CompareShapes() {
  const items = [
    { label: "Persegi", el: <rect x="8" y="8" width="44" height="44" rx="2" />, ok: false },
    { label: "Segitiga", el: <path d="M30 6 L54 52 L6 52 Z" />, ok: false },
    { label: "Oval", el: <ellipse cx="30" cy="30" rx="26" ry="17" />, ok: false },
    { label: "Lingkaran", el: <circle cx="30" cy="30" r="24" />, ok: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label} className={`flex flex-col items-center rounded-2xl border p-2 ${it.ok ? "border-ice/70 bg-ice/10" : "border-white/10 bg-white/5"}`}>
          <svg viewBox="0 0 60 60" width="64" height="64" fill={it.ok ? "#62E5F5" : "#318BFF"} fillOpacity={it.ok ? 0.6 : 0.35} stroke={it.ok ? "#62E5F5" : "#C9D8F5"} strokeWidth="2.5">
            {it.el}
          </svg>
          <span className={`text-xs font-bold ${it.ok ? "text-ice" : "text-soft/70"}`}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function PiUnroll() {
  return (
    <svg viewBox="0 0 260 150" width="100%" role="img" aria-label="Keliling dibentangkan sekitar 3,14 kali diameter">
      <circle cx="40" cy="50" r="30" fill="#102B59" stroke="#FFD76A" strokeWidth="4" />
      <line x1="10" y1="50" x2="70" y2="50" stroke="#318BFF" strokeWidth="3" />
      <text x="40" y="44" textAnchor="middle" fontSize="11" fill="#F3F7FF" fontWeight="800">d</text>
      {/* keliling dibentangkan */}
      <line x1="10" y1="110" x2="198.4" y2="110" stroke="#FFD76A" strokeWidth="5" strokeLinecap="round" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={10 + i * 60} y1="124" x2={70 + i * 60} y2="124" stroke="#318BFF" strokeWidth="4" />
          <text x={40 + i * 60} y="140" textAnchor="middle" fontSize="11" fill="#C9D8F5" fontWeight="800">d</text>
        </g>
      ))}
      <line x1="190" y1="124" x2="198.4" y2="124" stroke="#62E5F5" strokeWidth="4" />
      <text x="214" y="114" fontSize="12" fill="#FFD76A" fontWeight="900">K</text>
      <text x="206" y="140" fontSize="10" fill="#62E5F5" fontWeight="800">+0,14d</text>
      <text x="110" y="40" fontSize="12" fill="#F3F7FF" fontWeight="800">K ≈ 3,14 × d</text>
      <text x="110" y="58" fontSize="11" fill="#C9D8F5">keliling dibentangkan</text>
    </svg>
  );
}

function FormulaLink() {
  const box = "rounded-xl border border-ice/30 bg-navy/70 px-3 py-2 text-center font-hud text-sm font-bold";
  return (
    <div className="flex flex-col items-center gap-1.5 text-soft">
      <div className={box}>π = K ÷ d</div>
      <span className="text-xs text-ice">kalikan d</span>
      <div className={`${box} text-ice`}>K = π × d</div>
      <span className="text-xs text-ice">ganti d = 2 × r</span>
      <div className={`${box} text-gold`}>K = 2 × π × r</div>
    </div>
  );
}
