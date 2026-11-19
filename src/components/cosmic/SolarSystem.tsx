"use client";

import { PlanetArt, type PlanetVariant } from "./PlanetArt";

const ORBITS: { variant: PlanetVariant; radius: number; size: number; duration: number; phase: number }[] = [
  { variant: "moon", radius: 15, size: 7, duration: 18, phase: 0.1 },
  { variant: "lava", radius: 21, size: 9, duration: 26, phase: 0.55 },
  { variant: "aqua", radius: 27.5, size: 10, duration: 34, phase: 0.3 },
  { variant: "rose", radius: 34, size: 9, duration: 44, phase: 0.8 },
  { variant: "ringed", radius: 40.5, size: 13, duration: 56, phase: 0.15 },
  { variant: "ice", radius: 46, size: 9, duration: 70, phase: 0.62 },
  { variant: "violet", radius: 50.5, size: 8, duration: 86, phase: 0.38 },
];

/**
 * Tata surya: matahari bersinar di tengah dan 7 planet berbeda yang mengorbit perlahan.
 * Ukuran dalam persen sehingga mengikuti lebar wadah (responsif).
 */
export function SolarSystem({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      {ORBITS.map((o) => (
        <div
          key={o.variant}
          className="orbit-spin absolute left-1/2 top-1/2 rounded-full border border-ice/15"
          style={{
            width: `${o.radius * 2}%`,
            height: `${o.radius * 2}%`,
            marginLeft: `-${o.radius}%`,
            marginTop: `-${o.radius}%`,
            animationDuration: `${o.duration}s`,
            animationDelay: `-${o.phase * o.duration}s`,
          }}
        >
          <div
            className="orbit-counter absolute left-1/2 top-0"
            style={{
              width: `${(o.size / (o.radius * 2)) * 100}%`,
              aspectRatio: "1",
              marginLeft: `-${(o.size / (o.radius * 2)) * 50}%`,
              marginTop: `-${(o.size / (o.radius * 2)) * 50}%`,
              animationDuration: `${o.duration}s`,
              animationDelay: `-${o.phase * o.duration}s`,
            }}
          >
            <PlanetArt variant={o.variant} size="100%" />
          </div>
        </div>
      ))}
      {/* Matahari */}
      <div className="absolute left-1/2 top-1/2 w-[22%] -translate-x-1/2 -translate-y-1/2">
        <PlanetArt variant="sun" size="100%" />
      </div>
    </div>
  );
}
