import type { LessonProgressRow } from "@/lib/types";

export type MissionState = "locked" | "available" | "in_progress" | "completed";

/** Status 7 misi berdasarkan progres: misi n terbuka jika misi n-1 selesai. */
export function missionStates(progress: LessonProgressRow[]): Record<number, MissionState> {
  const byId = new Map(progress.map((p) => [p.lesson_id, p]));
  const out: Record<number, MissionState> = {};
  for (let id = 1; id <= 7; id++) {
    const p = byId.get(id);
    const unlocked = id === 1 || byId.get(id - 1)?.status === "completed";
    out[id] = p?.status === "completed" ? "completed" : !unlocked ? "locked" : p ? "in_progress" : "available";
  }
  return out;
}
