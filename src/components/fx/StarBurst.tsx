"use client";

import type { CSSProperties } from "react";

const COLORS = ["#FFD76A", "#62E5F5", "#8D7CFF", "#FF8FC7", "#5BE3A1", "#F3F7FF"];

/** Ledakan bintang & confetti (CSS murni, dibersihkan otomatis oleh pemanggil). */
export function StarBurst({ seed }: { seed: number }) {
  const pieces = Array.from({ length: 46 }, (_, i) => {
    const angle = (i / 46) * Math.PI * 2 + ((seed * 7 + i) % 10) / 10;
    const dist = 140 + ((seed * 13 + i * 37) % 220);
    return {
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist - 60}px`,
      rot: `${((seed + i) * 47) % 360}deg`,
      color: COLORS[i % COLORS.length],
      star: i % 3 === 0,
      size: 8 + ((i * 5 + seed) % 10),
      delay: `${(i % 6) * 0.03}s`,
    };
  });
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="burst-piece"
          style={{ "--dx": p.dx, "--dy": p.dy, "--rot": p.rot, animationDelay: p.delay } as CSSProperties}
        >
          {p.star ? (
            <svg viewBox="0 0 24 24" width={p.size + 6} height={p.size + 6}>
              <path d="M12 1 L14.9 8.6 L23 9.2 L16.8 14.4 L18.8 22.4 L12 18 L5.2 22.4 L7.2 14.4 L1 9.2 L9.1 8.6 Z" fill={p.color} />
            </svg>
          ) : (
            <span className="block rounded-sm" style={{ width: p.size, height: p.size * 0.5, background: p.color }} />
          )}
        </span>
      ))}
    </div>
  );
}
