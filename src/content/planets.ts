import { Circle, Earth, GraduationCap, Pi, RotateCw, Ruler, Sigma, type LucideIcon } from "lucide-react";
import type { PlanetVariant } from "@/components/cosmic/PlanetArt";

/** Identitas visual 6 planet materi + Stasiun Final. */
export interface PlanetInfo {
  id: number;
  name: string;
  variant: PlanetVariant;
  color: string;
  icon: LucideIcon;
  short: string;
}

export const PLANETS: PlanetInfo[] = [
  { id: 1, name: "Planet Pengenalan Lingkaran", variant: "aqua", color: "#62E5F5", icon: Circle, short: "Mengenal pengertian, ciri, dan bentuk lingkaran." },
  { id: 2, name: "Planet Unsur Lingkaran", variant: "ringed", color: "#318BFF", icon: Ruler, short: "Titik pusat, jari-jari, diameter, busur, tali busur, juring, tembereng." },
  { id: 3, name: "Planet Rahasia Pi", variant: "violet", color: "#8D7CFF", icon: Pi, short: "Menemukan π: perbandingan keliling dan diameter (3,14 dan 22/7)." },
  { id: 4, name: "Planet Keliling Lingkaran", variant: "ice", color: "#A8ECFF", icon: RotateCw, short: "Konsep keliling dan satu putaran penuh roda." },
  { id: 5, name: "Planet Rumus Rahasia", variant: "lava", color: "#FFD76A", icon: Sigma, short: "Rumus K = π × d dan K = 2 × π × r, beserta perhitungannya." },
  { id: 6, name: "Planet Tantangan Galaxy", variant: "jungle", color: "#5BE3A1", icon: Earth, short: "Soal cerita & penerapan keliling dalam kehidupan sehari-hari." },
  { id: 7, name: "Stasiun Final", variant: "station", color: "#FFD76A", icon: GraduationCap, short: "Pengulangan seluruh materi sebelum Post-test." },
];

export function planetFor(id: number): PlanetInfo {
  return PLANETS[id - 1];
}
