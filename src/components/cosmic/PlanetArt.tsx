"use client";

import { useId, type ReactNode } from "react";

export type PlanetVariant = "aqua" | "ringed" | "violet" | "ice" | "lava" | "jungle" | "rose" | "station" | "sun" | "moon";

interface PlanetArtProps {
  variant: PlanetVariant;
  size?: number | string;
  /** Permukaan planet berputar perlahan. */
  spin?: boolean;
  /** Planet terkunci: redup & abu-abu. */
  dim?: boolean;
  className?: string;
  title?: string;
}

interface Palette {
  light: string;
  mid: string;
  dark: string;
  glow: string;
}

const PALETTES: Record<Exclude<PlanetVariant, "station">, Palette> = {
  aqua: { light: "#B9FBFF", mid: "#2BB6D6", dark: "#0A3A66", glow: "#62E5F5" },
  ringed: { light: "#9CC4FF", mid: "#2F6BE0", dark: "#0E2160", glow: "#318BFF" },
  violet: { light: "#E3D9FF", mid: "#8D7CFF", dark: "#2E1A6B", glow: "#8D7CFF" },
  ice: { light: "#FFFFFF", mid: "#A8ECFF", dark: "#2E7DB0", glow: "#BDF4FF" },
  lava: { light: "#FFF1B0", mid: "#FFB13B", dark: "#8A2A0B", glow: "#FFD76A" },
  jungle: { light: "#C9FFD9", mid: "#36B37E", dark: "#0B4A55", glow: "#5BE3A1" },
  rose: { light: "#FFE0F0", mid: "#FF7FB8", dark: "#6B1A4A", glow: "#FF8FC7" },
  sun: { light: "#FFFBE0", mid: "#FFD76A", dark: "#FF8A1E", glow: "#FFC845" },
  moon: { light: "#F3F7FF", mid: "#AEB9D6", dark: "#4B5779", glow: "#C9D8F5" },
};

/** Satu "ubin" permukaan selebar 100 unit; digambar 2× agar bisa digeser terus-menerus. */
function SurfaceTile({ variant, p, x }: { variant: PlanetVariant; p: Palette; x: number }) {
  const g = (children: ReactNode) => <g transform={`translate(${x} 0)`}>{children}</g>;
  switch (variant) {
    case "aqua":
      return g(
        <>
          <path d="M0 30 q25 -10 50 0 t50 0" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M0 62 q25 10 50 0 t50 0" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="30" cy="46" rx="14" ry="7" fill={p.dark} opacity="0.35" />
          <ellipse cx="78" cy="76" rx="10" ry="5" fill={p.dark} opacity="0.3" />
        </>,
      );
    case "ringed":
      return g(
        <>
          <rect x="0" y="28" width="100" height="7" fill={p.light} opacity="0.35" />
          <rect x="0" y="48" width="100" height="10" fill={p.dark} opacity="0.35" />
          <rect x="0" y="68" width="100" height="6" fill={p.light} opacity="0.3" />
        </>,
      );
    case "violet":
      return g(
        <>
          <path d="M0 26 q25 6 50 0 t50 0 v8 q-25 6 -50 0 t-50 0z" fill={p.light} opacity="0.35" />
          <path d="M0 50 q25 -6 50 0 t50 0 v10 q-25 -6 -50 0 t-50 0z" fill={p.dark} opacity="0.4" />
          <path d="M0 74 q25 5 50 0 t50 0 v6 q-25 5 -50 0 t-50 0z" fill={p.light} opacity="0.3" />
          <ellipse cx="62" cy="56" rx="9" ry="5" fill="#FF8FC7" opacity="0.75" />
        </>,
      );
    case "ice":
      return g(
        <>
          <path d="M8 40 l14 8 l-4 14 M40 30 l10 16 l16 -4 M70 60 l12 10 l-6 12" stroke="#2E7DB0" strokeOpacity="0.45" strokeWidth="2" fill="none" />
          <circle cx="26" cy="70" r="5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="84" cy="36" r="4" fill="#FFFFFF" opacity="0.6" />
        </>,
      );
    case "lava":
      return g(
        <>
          <path d="M4 34 l18 10 l10 -6 l14 14 M50 70 l16 -10 l12 8 l18 -6 M30 82 l10 -12" stroke="#FFF1B0" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9" />
          <circle cx="70" cy="34" r="7" fill={p.dark} opacity="0.45" />
          <circle cx="20" cy="60" r="5" fill={p.dark} opacity="0.4" />
        </>,
      );
    case "jungle":
      return g(
        <>
          <path d="M6 36 q10 -12 24 -6 q12 6 6 18 q-8 10 -22 4 q-12 -6 -8 -16z" fill="#2E8B57" opacity="0.9" />
          <path d="M56 58 q14 -8 28 0 q10 8 0 18 q-14 8 -26 0 q-10 -8 -2 -18z" fill="#3FA96A" opacity="0.9" />
          <path d="M60 22 q8 -4 16 2 q4 6 -4 9 q-8 2 -12 -4z" fill="#2E8B57" opacity="0.85" />
          <path d="M0 50 q25 -8 50 0 t50 0" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="3" fill="none" />
        </>,
      );
    case "rose":
      return g(
        <>
          <rect x="0" y="34" width="100" height="8" fill={p.light} opacity="0.35" />
          <rect x="0" y="58" width="100" height="12" fill={p.dark} opacity="0.3" />
          <circle cx="34" cy="52" r="4" fill="#FFFFFF" opacity="0.5" />
        </>,
      );
    case "sun":
      return g(
        <>
          <circle cx="24" cy="34" r="8" fill="#FFF6C2" opacity="0.6" />
          <circle cx="70" cy="62" r="11" fill="#FFB13B" opacity="0.55" />
          <circle cx="44" cy="80" r="6" fill="#FFF6C2" opacity="0.5" />
        </>,
      );
    case "moon":
      return g(
        <>
          <circle cx="28" cy="38" r="8" fill={p.dark} opacity="0.35" />
          <circle cx="66" cy="64" r="11" fill={p.dark} opacity="0.3" />
          <circle cx="76" cy="30" r="5" fill={p.dark} opacity="0.3" />
        </>,
      );
    default:
      return null;
  }
}

/** Ilustrasi planet (SVG) dengan permukaan berputar, bayangan 3D, dan atmosfer bercahaya. */
export function PlanetArt({ variant, size = 120, spin = true, dim = false, className = "", title }: PlanetArtProps) {
  const uid = useId().replace(/:/g, "");
  if (variant === "station") return <StationArt size={size} dim={dim} className={className} title={title} uid={uid} />;

  const p = PALETTES[variant];
  const ringed = variant === "ringed" || variant === "rose";
  const isSun = variant === "sun";

  return (
    <svg
      viewBox="-20 -20 140 140"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`overflow-visible ${isSun ? "sun-glow" : ""} ${className}`}
      style={dim ? { filter: "grayscale(0.7) brightness(0.7)" } : undefined}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`b${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="45%" stopColor={p.mid} />
          <stop offset="100%" stopColor={p.dark} />
        </radialGradient>
        <radialGradient id={`s${uid}`} cx="30%" cy="25%" r="85%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#020816" stopOpacity={isSun ? 0.1 : 0.65} />
        </radialGradient>
        <radialGradient id={`a${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor={p.glow} stopOpacity="0" />
          <stop offset="86%" stopColor={p.glow} stopOpacity={isSun ? 0.7 : 0.35} />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`c${uid}`}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>

      {/* atmosfer */}
      <circle cx="50" cy="50" r={isSun ? 62 : 54} fill={`url(#a${uid})`} />
      {isSun &&
        Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M50 -6 L54 8 L46 8 Z" fill="#FFD76A" opacity="0.55" transform={`rotate(${i * 30} 50 50)`} />
        ))}

      {/* cincin belakang */}
      {ringed && (
        <ellipse cx="50" cy="50" rx="64" ry="14" fill="none" stroke={variant === "rose" ? "#FFD6EA" : "#FFD76A"} strokeOpacity="0.55" strokeWidth="5" transform="rotate(-18 50 50)" />
      )}

      <circle cx="50" cy="50" r="40" fill={`url(#b${uid})`} />
      <g clipPath={`url(#c${uid})`}>
        <g className={spin ? "planet-surface" : undefined} style={{ animationDuration: isSun ? "30s" : undefined }}>
          <SurfaceTile variant={variant} p={p} x={0} />
          <SurfaceTile variant={variant} p={p} x={100} />
        </g>
        {variant === "ice" && (
          <>
            <ellipse cx="50" cy="12" rx="26" ry="9" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="50" cy="90" rx="22" ry="7" fill="#FFFFFF" opacity="0.8" />
          </>
        )}
      </g>
      {/* bayangan & kilau */}
      <circle cx="50" cy="50" r="40" fill={`url(#s${uid})`} />
      <ellipse cx="36" cy="30" rx="12" ry="7" fill="#FFFFFF" opacity="0.28" transform="rotate(-30 36 30)" />

      {/* cincin depan (setengah bawah menutupi planet) */}
      {ringed && (
        <path
          d="M-14 50 A64 14 0 0 0 114 50"
          fill="none"
          stroke={variant === "rose" ? "#FFD6EA" : "#FFD76A"}
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(-18 50 50)"
        />
      )}
    </svg>
  );
}

function StationArt({ size, dim, className, title, uid }: { size: number | string; dim: boolean; className: string; title?: string; uid: string }) {
  return (
    <svg
      viewBox="-20 -20 140 140"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`overflow-visible ${className}`}
      style={dim ? { filter: "grayscale(0.7) brightness(0.7)" } : undefined}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`g${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#FFD76A" stopOpacity="0" />
          <stop offset="85%" stopColor="#FFD76A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFD76A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="60" fill={`url(#g${uid})`} />
      <g className="orbit-spin" style={{ animationDuration: "40s", transformBox: "view-box", transformOrigin: "50px 50px" }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#C9D8F5" strokeWidth="7" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#62E5F5" strokeWidth="2" strokeDasharray="6 8" />
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            <rect x="46" y="10" width="8" height="30" rx="3" fill="#AEB9D6" />
            <rect x="40" y="2" width="20" height="12" rx="3" fill="#8D7CFF" />
          </g>
        ))}
      </g>
      <rect x="-8" y="44" width="30" height="12" rx="2" fill="#1D55A6" stroke="#62E5F5" strokeWidth="1.5" />
      <rect x="78" y="44" width="30" height="12" rx="2" fill="#1D55A6" stroke="#62E5F5" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="18" fill="#F3F7FF" stroke="#C9D8F5" strokeWidth="3" />
      <circle cx="50" cy="50" r="10" fill="#0B1E44" stroke="#FFD76A" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="4" fill="#FFD76A" className="animate-twinkle" />
    </svg>
  );
}
