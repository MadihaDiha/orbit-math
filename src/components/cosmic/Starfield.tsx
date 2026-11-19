"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { PlanetArt, type PlanetVariant } from "./PlanetArt";

/** Angka acak deterministik (aman untuk SSR & hydration). */
function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hash(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 100000;
  return h;
}

const STAR_RAND = seeded(42);
const STARS = Array.from({ length: 170 }, (_, i) => ({
  x: STAR_RAND() * 100,
  y: STAR_RAND() * 100,
  r: STAR_RAND() < 0.8 ? 0.9 + STAR_RAND() * 0.9 : 2 + STAR_RAND() * 1.2,
  delay: STAR_RAND() * 4,
  layer: i % 3,
}));

const VARIANTS: PlanetVariant[] = ["aqua", "ringed", "violet", "ice", "lava", "jungle", "rose", "moon"];

/**
 * Latar galaksi untuk SEMUA halaman: bintang berkedip (3 lapis), bintang berkilau,
 * nebula, meteor sesekali, partikel bercahaya, dan planet kecil melayang.
 * Dekorasi bervariasi per halaman, identitas visual tetap sama. Ringan: hanya CSS.
 */
export function Starfield() {
  const pathname = usePathname() || "/";
  const deco = useMemo(() => {
    const r = seeded(hash(pathname.split("/")[1] || "home") + 11);
    const pick = () => VARIANTS[Math.floor(r() * VARIANTS.length)];
    return {
      planets: [
        { v: pick(), size: 70 + r() * 40, left: `${-2 + r() * 8}%`, top: `${58 + r() * 20}%` },
        { v: pick(), size: 40 + r() * 30, left: `${82 + r() * 10}%`, top: `${12 + r() * 18}%` },
      ],
      sparkles: Array.from({ length: 7 }, () => ({ left: `${r() * 100}%`, top: `${r() * 100}%`, delay: `${r() * 4}s`, size: 10 + r() * 12 })),
      meteors: Array.from({ length: 3 }, (_, i) => ({ left: `${45 + r() * 55}%`, top: `${r() * 40}%`, delay: `${i * 3 + r() * 3}s` })),
      particles: Array.from({ length: 14 }, () => ({ left: `${r() * 100}%`, delay: `${r() * 14}s`, size: 2 + r() * 3, hue: r() < 0.5 ? "#62E5F5" : "#8D7CFF" })),
      nebulaShift: r() * 30,
    };
  }, [pathname]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Nebula biru & ungu */}
      <div
        className="absolute -left-1/4 top-[-20%] h-[70vh] w-[80vw] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(141,124,255,0.45), transparent)", transform: `translateX(${deco.nebulaShift}px)` }}
      />
      <div className="absolute -right-1/4 bottom-[-25%] h-[70vh] w-[70vw] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(49,139,255,0.5), transparent)" }} />
      <div className="absolute left-1/3 top-1/3 h-[40vh] w-[40vw] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(98,229,245,0.4), transparent)" }} />

      {/* Bintang kecil berkedip */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.layer === 2 ? "#62E5F5" : s.layer === 1 ? "#F3F7FF" : "#8D7CFF"}
            opacity={s.layer === 0 ? 0.65 : 0.95}
            className="animate-twinkle"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>

      {/* Bintang besar berkilau */}
      {deco.sparkles.map((s, i) => (
        <svg key={i} viewBox="0 0 24 24" width={s.size} height={s.size} className="sparkle absolute" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#FFF6D0" />
        </svg>
      ))}

      {/* Meteor sesekali */}
      {deco.meteors.map((m, i) => (
        <span key={i} className="meteor" style={{ left: m.left, top: m.top, animationDelay: m.delay }} />
      ))}

      {/* Partikel bercahaya naik perlahan */}
      {deco.particles.map((p, i) => (
        <span
          key={i}
          className="particle absolute bottom-0 rounded-full"
          style={{ left: p.left, width: p.size, height: p.size, background: p.hue, boxShadow: `0 0 8px ${p.hue}`, animationDelay: p.delay }}
        />
      ))}

      {/* Planet kecil melayang di sudut */}
      {deco.planets.map((p, i) => (
        <div key={i} className="drift absolute opacity-60" style={{ left: p.left, top: p.top, animationDelay: `${i * -7}s` }}>
          <PlanetArt variant={p.v} size={p.size} />
        </div>
      ))}

      {/* Orbit dekoratif */}
      <div className="absolute -right-24 top-24 h-64 w-64 animate-spin-slow rounded-full border border-ice/10">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-gold shadow-[0_0_14px_#FFD76A]" />
      </div>
    </div>
  );
}
