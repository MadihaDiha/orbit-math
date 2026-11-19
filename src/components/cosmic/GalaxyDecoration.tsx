"use client";

import { usePathname } from "next/navigation";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { isPrivatePath } from "@/lib/routes";

/**
 * GalaxyDecoration — lapisan dekorasi TAMBAHAN di belakang konten (pointer-events: none).
 * Tidak mengubah komponen lain: hanya menambah bintang, meteor/komet, roket, pesawat,
 * satelit, alien, UFO, asteroid, planet mini, bulan, kristal, lubang hitam, dan bola energi.
 * Posisi diacak per halaman (deterministik → aman untuk SSR), ditempatkan di tepi & area kosong.
 */

function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function hash(text: string) {
  let h = 17;
  for (let i = 0; i < text.length; i++) h = (h * 33 + text.charCodeAt(i)) % 1000003;
  return h;
}

// ------------------------------------------------------------ ilustrasi
function Rocket({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 60 100" width={size * 0.6} height={size} aria-hidden="true" className="overflow-visible">
      <path d="M24 82 Q30 112 36 82 Z" fill="#FFD76A" className="bimo-flame" />
      <path d="M26 82 Q30 98 34 82 Z" fill="#FFF6D0" className="bimo-flame" />
      <path d="M30 4 C46 20 46 56 42 80 H18 C14 56 14 20 30 4 Z" fill="#F3F7FF" stroke="#C9D8F5" strokeWidth="2" />
      <path d="M30 4 C38 12 42 22 43 30 H17 C18 22 22 12 30 4 Z" fill="#FF5C7A" />
      <circle cx="30" cy="46" r="8" fill="#0B1E44" stroke="#62E5F5" strokeWidth="3" />
      <circle cx="27" cy="43" r="2.5" fill="#FFFFFF" opacity="0.7" />
      <path d="M18 62 L6 84 L18 78 Z M42 62 L54 84 L42 78 Z" fill="#8D7CFF" />
      <rect x="27" y="66" width="6" height="14" rx="3" fill="#318BFF" />
    </svg>
  );
}

function Spaceship({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 60" width={size} height={size / 2} aria-hidden="true" className="overflow-visible">
      <path d="M0 30 L-22 24 L-22 36 Z" fill="#62E5F5" className="bimo-flame" style={{ filter: "drop-shadow(0 0 6px #62E5F5)" }} />
      <path d="M8 30 C20 10 70 6 112 30 C70 54 20 50 8 30 Z" fill="#C9D8F5" stroke="#F3F7FF" strokeWidth="2" />
      <path d="M40 30 C50 14 80 14 96 30 Z" fill="#0B1E44" stroke="#62E5F5" strokeWidth="2.5" />
      <path d="M30 40 L18 58 L48 44 Z M30 20 L18 2 L48 16 Z" fill="#8D7CFF" />
      <circle cx="24" cy="30" r="3" fill="#FFD76A" className="deco-blink" />
    </svg>
  );
}

function Capsule({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
      <path d="M40 74 L32 88 L48 88 Z" fill="#FFD76A" className="bimo-flame" />
      <path d="M14 66 L22 18 Q40 6 58 18 L66 66 Z" fill="#F3F7FF" stroke="#C9D8F5" strokeWidth="2" />
      <rect x="12" y="62" width="56" height="10" rx="4" fill="#1D55A6" />
      <circle cx="40" cy="38" r="12" fill="#0B1E44" stroke="#FFD76A" strokeWidth="3" />
      <circle cx="36" cy="34" r="3" fill="#62E5F5" opacity="0.8" />
    </svg>
  );
}

function Satellite({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 70" width={size} height={size * 0.58} aria-hidden="true">
      <g fill="#1D55A6" stroke="#62E5F5" strokeWidth="1.5">
        <rect x="2" y="22" width="36" height="26" rx="2" />
        <rect x="82" y="22" width="36" height="26" rx="2" />
      </g>
      <path d="M2 35 H38 M14 22 V48 M26 22 V48 M82 35 H118 M94 22 V48 M106 22 V48" stroke="#62E5F5" strokeOpacity="0.6" strokeWidth="1" />
      <rect x="38" y="33" width="44" height="4" fill="#AEB9D6" />
      <rect x="46" y="18" width="28" height="34" rx="6" fill="#F3F7FF" stroke="#C9D8F5" strokeWidth="2" />
      <circle cx="60" cy="30" r="5" fill="#FFD76A" className="deco-blink" />
      <path d="M60 18 V6" stroke="#C9D8F5" strokeWidth="2" />
      <path d="M50 6 Q60 -2 70 6" fill="none" stroke="#C9D8F5" strokeWidth="2.5" />
    </svg>
  );
}

function Station({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <g className="deco-spin" style={{ transformOrigin: "60px 60px", animationDuration: "60s" }}>
        <circle cx="60" cy="60" r="44" fill="none" stroke="#C9D8F5" strokeWidth="8" />
        <circle cx="60" cy="60" r="44" fill="none" stroke="#62E5F5" strokeWidth="2" strokeDasharray="5 9" />
        {[0, 120, 240].map((a) => (
          <rect key={a} x="56" y="16" width="8" height="30" fill="#AEB9D6" transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="16" fill="#F3F7FF" stroke="#8D7CFF" strokeWidth="3" />
      <circle cx="60" cy="60" r="6" fill="#62E5F5" className="animate-twinkle" />
    </svg>
  );
}

function Alien({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true" className="overflow-visible">
      {/* antena */}
      <path d="M38 22 Q32 8 26 6 M62 22 Q68 8 74 6" stroke="#5BE3A1" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="6" r="5" fill="#FFD76A" className="animate-twinkle" />
      <circle cx="74" cy="6" r="5" fill="#FF8FC7" className="animate-twinkle" />
      {/* lengan melambai */}
      <g className="deco-wave" style={{ transformOrigin: "78px 66px" }}>
        <path d="M76 66 Q92 52 94 36" stroke="#5BE3A1" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="94" cy="34" r="6" fill="#5BE3A1" />
      </g>
      <path d="M24 66 Q12 76 12 88" stroke="#5BE3A1" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* badan & kepala */}
      <ellipse cx="50" cy="84" rx="24" ry="20" fill="#3FCF8E" />
      <ellipse cx="50" cy="44" rx="34" ry="28" fill="#5BE3A1" />
      {/* mata besar */}
      <ellipse cx="36" cy="44" rx="11" ry="13" fill="#FFFFFF" />
      <ellipse cx="64" cy="44" rx="11" ry="13" fill="#FFFFFF" />
      <g className="bimo-blink" style={{ transformOrigin: "50px 46px", transformBox: "view-box" }}>
        <circle cx="38" cy="46" r="6.5" fill="#07152F" />
        <circle cx="66" cy="46" r="6.5" fill="#07152F" />
        <circle cx="40" cy="43" r="2.2" fill="#FFFFFF" />
        <circle cx="68" cy="43" r="2.2" fill="#FFFFFF" />
      </g>
      <path d="M42 60 Q50 67 58 60" stroke="#07152F" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="58" r="4" fill="#FF8FC7" opacity="0.6" />
      <circle cx="74" cy="58" r="4" fill="#FF8FC7" opacity="0.6" />
    </svg>
  );
}

function Ufo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 140 120" width={size} height={size * 0.86} aria-hidden="true" className="overflow-visible">
      <path d="M50 54 L20 120 H120 L90 54 Z" fill="url(#ufoBeam)" className="deco-beam" />
      <defs>
        <linearGradient id="ufoBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62E5F5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#62E5F5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="34" rx="24" ry="22" fill="#62E5F5" opacity="0.5" />
      <ellipse cx="70" cy="34" rx="18" ry="16" fill="#B9FBFF" opacity="0.6" />
      <circle cx="70" cy="34" r="8" fill="#5BE3A1" />
      <circle cx="67" cy="32" r="2" fill="#07152F" />
      <circle cx="74" cy="32" r="2" fill="#07152F" />
      <ellipse cx="70" cy="48" rx="62" ry="14" fill="#AEB9D6" stroke="#F3F7FF" strokeWidth="2" />
      <ellipse cx="70" cy="44" rx="46" ry="6" fill="#C9D8F5" />
      {[24, 46, 70, 94, 116].map((x, i) => (
        <circle key={x} cx={x} cy={50} r="4" fill={["#FFD76A", "#FF8FC7", "#62E5F5", "#5BE3A1", "#8D7CFF"][i]} className="deco-blink" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
}

function Asteroid({ size, tone = 0 }: { size: number; tone?: number }) {
  const fill = ["#7A6F8F", "#6B7C99", "#8A7466"][tone % 3];
  return (
    <svg viewBox="0 0 60 50" width={size} height={size * 0.83} aria-hidden="true">
      <path d="M8 18 L20 4 L42 6 L56 20 L52 40 L32 48 L12 42 L4 30 Z" fill={fill} stroke="#C9D8F5" strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="22" cy="20" r="5" fill="#000" opacity="0.2" />
      <circle cx="38" cy="30" r="7" fill="#000" opacity="0.18" />
      <circle cx="40" cy="14" r="3" fill="#000" opacity="0.2" />
    </svg>
  );
}

function RingPlanet({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="-20 -10 140 120" width={size} height={size * 0.86} aria-hidden="true" className="overflow-visible">
      <ellipse cx="50" cy="50" rx="62" ry="13" fill="none" stroke="#FFD76A" strokeOpacity="0.5" strokeWidth="4" transform="rotate(-15 50 50)" />
      <circle cx="50" cy="50" r="32" fill={color} />
      <path d="M22 40 Q50 32 78 40 M20 58 Q50 66 80 58" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="4" fill="none" />
      <circle cx="50" cy="50" r="32" fill="url(#rpShade)" />
      <defs>
        <radialGradient id="rpShade" cx="35%" cy="30%" r="80%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#020816" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <path d="M-12 50 A62 13 0 0 0 112 50" fill="none" stroke="#FFD76A" strokeWidth="4" transform="rotate(-15 50 50)" />
    </svg>
  );
}

function Moon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <circle cx="30" cy="30" r="26" fill="#DDE5F7" />
      <circle cx="20" cy="22" r="5" fill="#AEB9D6" />
      <circle cx="38" cy="36" r="7" fill="#AEB9D6" />
      <circle cx="40" cy="18" r="3" fill="#AEB9D6" />
      <path d="M30 4 A26 26 0 0 1 30 56 A20 26 0 0 0 30 4 Z" fill="#07152F" opacity="0.25" />
    </svg>
  );
}

function Crystal({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 60 80" width={size * 0.75} height={size} aria-hidden="true">
      <path d="M30 2 L50 26 L30 78 L10 26 Z" fill="#8D7CFF" opacity="0.85" />
      <path d="M30 2 L50 26 L30 34 Z" fill="#E3D9FF" opacity="0.9" />
      <path d="M30 2 L10 26 L30 34 Z" fill="#B9A8FF" />
      <path d="M10 26 L30 34 L30 78 Z" fill="#5B47D6" opacity="0.8" />
    </svg>
  );
}

function BlackHole({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="bhDisk" cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor="#000" />
          <stop offset="45%" stopColor="#FFB13B" stopOpacity="0.9" />
          <stop offset="62%" stopColor="#8D7CFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8D7CFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="deco-spin" style={{ transformOrigin: "50px 50px", animationDuration: "18s" }}>
        <ellipse cx="50" cy="50" rx="48" ry="48" fill="url(#bhDisk)" />
        <path d="M50 8 A42 42 0 0 1 92 50" stroke="#FFD76A" strokeOpacity="0.5" strokeWidth="2" fill="none" />
        <path d="M50 92 A42 42 0 0 1 8 50" stroke="#62E5F5" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      </g>
      <circle cx="50" cy="50" r="15" fill="#020410" />
    </svg>
  );
}

function EnergyOrb({ size, color }: { size: number; color: string }) {
  return (
    <span
      className="deco-glow block rounded-full"
      style={{ width: size, height: size, background: `radial-gradient(circle at 35% 30%, #FFFFFF, ${color} 45%, transparent 72%)`, "--glow": color } as CSSProperties}
    />
  );
}

function OrbitingMoonPlanet({ size }: { size: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-[22%] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #FFE0F0, #FF7FB8 50%, #6B1A4A)", boxShadow: "0 0 24px -4px #FF8FC7" }} />
      <div className="deco-orbit absolute inset-0 rounded-full border border-dashed border-white/20">
        <span className="absolute -top-1.5 left-1/2 block h-3 w-3 -translate-x-1/2 rounded-full bg-[#DDE5F7] shadow-[0_0_8px_#F3F7FF]" />
      </div>
    </div>
  );
}

function StarShape({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
    </svg>
  );
}

// ------------------------------------------------------------ penempatan
interface Slot {
  left: string;
  top: string;
  mobile: boolean; // tampil juga di ponsel?
}

/** Titik-titik di tepi & area kosong (sudut, sisi kiri/kanan, bawah). */
const SLOTS: Slot[] = [
  { left: "1.5%", top: "12%", mobile: true },
  { left: "90%", top: "14%", mobile: true },
  { left: "0.5%", top: "34%", mobile: false },
  { left: "93%", top: "36%", mobile: false },
  { left: "2%", top: "58%", mobile: true },
  { left: "91%", top: "60%", mobile: false },
  { left: "3%", top: "82%", mobile: false },
  { left: "89%", top: "84%", mobile: true },
  { left: "24%", top: "93%", mobile: false },
  { left: "68%", top: "92%", mobile: false },
  { left: "40%", top: "4%", mobile: false },
  { left: "74%", top: "3%", mobile: false },
];

/**
 * Halaman belajar (konten lebar): objek besar hanya menempel di TEPI layar agar tidak
 * berada di belakang teks/soal. Ukuran mengecil di layar < 1536px (lihat .deco-edge di CSS).
 */
const EDGE_SLOTS: { side: "left" | "right"; top: string }[] = [
  { side: "left", top: "16%" },
  { side: "right", top: "20%" },
  { side: "left", top: "40%" },
  { side: "right", top: "46%" },
  { side: "left", top: "64%" },
  { side: "right", top: "70%" },
  { side: "left", top: "86%" },
  { side: "right", top: "90%" },
];

type Piece = { node: ReactNode; anim: "float" | "spin" | "glow"; tilt?: number };

export function GalaxyDecoration() {
  const pathname = usePathname() || "/";
  const edge = isPrivatePath(pathname);
  const layout = useMemo(() => {
    const r = seeded(hash(pathname.split("/").slice(0, 3).join("/")) + 3);
    const pieces: Piece[] = [
      { node: <Rocket size={64} />, anim: "float", tilt: -18 },
      { node: <Satellite size={86} />, anim: "float", tilt: 12 },
      { node: <Alien size={62} />, anim: "float" },
      { node: <Station size={70} />, anim: "float" },
      { node: <RingPlanet size={78} color="#318BFF" />, anim: "float" },
      { node: <Moon size={38} />, anim: "float" },
      { node: <Crystal size={44} />, anim: "glow", tilt: 8 },
      { node: <BlackHole size={74} />, anim: "float" },
      { node: <Capsule size={46} />, anim: "float", tilt: 14 },
      { node: <OrbitingMoonPlanet size={70} />, anim: "float" },
      { node: <Asteroid size={40} tone={0} />, anim: "spin" },
      { node: <EnergyOrb size={34} color="#62E5F5" />, anim: "glow" },
    ];
    // acak urutan slot agar setiap halaman terlihat berbeda
    const order = SLOTS.map((s, i) => ({ s, k: r(), i })).sort((a, b) => a.k - b.k);
    const placed = pieces.map((p, i) => ({ ...p, slot: order[i].s, delay: -r() * 7, scale: 0.8 + r() * 0.45 }));
    const stars = Array.from({ length: 34 }, () => ({
      left: `${r() * 100}%`,
      top: `${r() * 100}%`,
      size: 6 + r() * 14,
      color: ["#FFFFFF", "#62E5F5", "#FFD76A", "#B9D4FF", "#8D7CFF"][Math.floor(r() * 5)],
      delay: `${r() * 5}s`,
      shape: r() < 0.55,
    }));
    const asteroids = Array.from({ length: 5 }, (_, i) => ({
      left: edge ? `${r() < 0.5 ? r() * 1.5 : 97 + r() * 1.5}%` : `${r() < 0.5 ? r() * 9 : 88 + r() * 10}%`,
      top: `${10 + r() * 80}%`,
      size: edge ? 12 + r() * 12 : 14 + r() * 22,
      tone: i,
      dur: `${20 + r() * 30}s`,
    }));
    const comets = Array.from({ length: 2 }, (_, i) => ({ left: `${60 + r() * 40}%`, top: `${5 + r() * 30}%`, delay: `${3 + i * 7 + r() * 4}s` }));
    const meteors = Array.from({ length: 3 }, (_, i) => ({ left: `${40 + r() * 60}%`, top: `${r() * 55}%`, delay: `${1.5 + i * 4.5 + r() * 3}s`, w: 80 + r() * 140 }));
    const ufoTop = `${18 + r() * 45}%`;
    const shipTop = `${20 + r() * 55}%`;
    const edgePlaced = pieces.slice(0, EDGE_SLOTS.length).map((p, i) => ({ ...p, slot: EDGE_SLOTS[i], delay: -r() * 7 }));
    return { placed, edgePlaced, stars, asteroids, comets, meteors, ufoTop, shipTop };
  }, [pathname, edge]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Nebula bercahaya tambahan */}
      <div className="absolute right-[-8%] top-[30%] h-[38vh] w-[30vw] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(255,143,199,0.35), transparent)" }} />
      <div className="absolute bottom-[8%] left-[-6%] h-[34vh] w-[28vw] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(91,227,161,0.25), transparent)" }} />

      {/* Bintang beragam: empat sudut, emas, biru, berkedip bergantian & bercahaya */}
      {layout.stars.map((s, i) =>
        s.shape ? (
          <span key={i} className="sparkle absolute" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
            <StarShape size={s.size} color={s.color} />
          </span>
        ) : (
          <span
            key={i}
            className="absolute animate-twinkle rounded-full"
            style={{ left: s.left, top: s.top, width: s.size / 3, height: s.size / 3, background: s.color, boxShadow: `0 0 ${s.size / 2}px ${s.color}`, animationDelay: s.delay }}
          />
        ),
      )}

      {/* Meteor bervariasi & komet berekor panjang */}
      {layout.meteors.map((m, i) => (
        <span key={`m${i}`} className="meteor" style={{ left: m.left, top: m.top, width: m.w, animationDelay: m.delay, animationDuration: `${8 + i * 2}s` }} />
      ))}
      {layout.comets.map((c, i) => (
        <span key={`c${i}`} className="deco-comet" style={{ left: c.left, top: c.top, animationDelay: c.delay }} />
      ))}

      {/* Asteroid kecil berputar di tepi */}
      {layout.asteroids.map((a, i) => (
        <span key={`a${i}`} className="deco-spin absolute opacity-70" style={{ left: a.left, top: a.top, animationDuration: a.dur }}>
          <Asteroid size={a.size} tone={a.tone} />
        </span>
      ))}

      {/* Objek besar menempel di tepi (halaman belajar) */}
      {edge &&
        layout.edgePlaced.map((p, i) => (
          <div key={`e${i}`} className={`deco-edge deco-edge-${p.slot.side} absolute`} style={{ top: p.slot.top, [p.slot.side]: 2 }}>
            <div
              className={p.anim === "float" ? "deco-float" : p.anim === "spin" ? "deco-spin" : "deco-glow"}
              style={{ animationDelay: `${p.delay}s`, "--tilt": `${p.tilt ?? 0}deg` } as CSSProperties}
            >
              {p.node}
            </div>
          </div>
        ))}

      {/* Objek besar di sudut & sisi halaman (halaman pembuka & publik) */}
      {!edge && layout.placed.map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.slot.mobile ? "" : "hidden md:block"} opacity-80`}
          style={{ left: p.slot.left, top: p.slot.top, transform: `scale(${p.scale})` }}
        >
          <div
            className={p.anim === "float" ? "deco-float" : p.anim === "spin" ? "deco-spin" : "deco-glow"}
            style={{ animationDelay: `${p.delay}s`, "--tilt": `${p.tilt ?? 0}deg` } as CSSProperties}
          >
            {p.node}
          </div>
        </div>
      ))}

      {/* UFO bergerak perlahan kiri → kanan dengan cahaya dari bawah */}
      <div className={`deco-ufo absolute left-0 ${edge ? "opacity-50" : "opacity-85"}`} style={{ top: layout.ufoTop }}>
        <div className="deco-float">
          <Ufo size={78} />
        </div>
      </div>

      {/* Roket yang sesekali melintasi layar */}
      <div className={`deco-rocket-cross absolute bottom-0 left-0 ${edge ? "opacity-60" : ""}`} style={{ animationDelay: "6s" }}>
        <Rocket size={46} />
      </div>

      {/* Pesawat penjelajah galaksi melintas */}
      <div className={`deco-ship-cross absolute left-0 hidden md:block ${edge ? "opacity-50" : ""}`} style={{ top: layout.shipTop, animationDelay: "14s" }}>
        <div style={{ transform: "scaleX(-1)" }}>
          <Spaceship size={84} />
        </div>
      </div>
    </div>
  );
}
