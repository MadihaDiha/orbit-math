/** Ambang XP per level. HARUS sama dengan private.level_for_xp() di SQL. */
export const LEVELS = [
  { level: 1, minXp: 0, title: "Space Cadet" },
  { level: 2, minXp: 150, title: "Orbit Rookie" },
  { level: 3, minXp: 400, title: "Star Pilot" },
  { level: 4, minXp: 800, title: "Nebula Navigator" },
  { level: 5, minXp: 1400, title: "Galaxy Commander" },
  { level: 6, minXp: 2200, title: "Cosmic Legend" },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export function levelForXp(xp: number): LevelInfo {
  let current: LevelInfo = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) current = l;
  return current;
}

export function levelProgress(xp: number) {
  const current = levelForXp(xp);
  const next: LevelInfo | null = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  if (!next) return { current, next, percent: 100, xpIntoLevel: xp - current.minXp, xpNeeded: 0 };
  const span = next.minXp - current.minXp;
  const into = xp - current.minXp;
  return {
    current,
    next,
    percent: Math.min(100, Math.round((into / span) * 100)),
    xpIntoLevel: into,
    xpNeeded: next.minXp - xp,
  };
}
