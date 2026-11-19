import type { LessonProgressRow } from "@/lib/types";

export type MissionState = "locked" | "available" | "in_progress" | "completed";

export interface TestResult {
  score: number;
  correct_count: number;
  total: number;
  created_at: string;
}

/** Status perjalanan galaksi: pre-test → 7 misi → post-test. */
export interface JourneyFlags {
  pretest: TestResult | null;
  /** Post-test terbaru (boleh diulang). */
  posttest: TestResult | null;
  /** Post-test dengan nilai tertinggi. */
  posttestBest: TestResult | null;
}

export const EMPTY_JOURNEY: JourneyFlags = { pretest: null, posttest: null, posttestBest: null };

/**
 * Status 7 misi. Misi 1 terbuka setelah Pre-test dikerjakan;
 * misi n terbuka jika misi n-1 selesai. (Sama dengan private.is_lesson_unlocked di SQL.)
 */
export function missionStates(progress: LessonProgressRow[], journey: Pick<JourneyFlags, "pretest">): Record<number, MissionState> {
  const byId = new Map(progress.map((p) => [p.lesson_id, p]));
  const out: Record<number, MissionState> = {};
  for (let id = 1; id <= 7; id++) {
    const p = byId.get(id);
    const unlocked = id === 1 ? Boolean(journey.pretest) : byId.get(id - 1)?.status === "completed";
    out[id] = p?.status === "completed" ? "completed" : !unlocked ? "locked" : p ? "in_progress" : "available";
  }
  return out;
}

export type JourneyStep = "pretest" | "mission" | "posttest" | "results";

/** Langkah berikutnya yang disarankan untuk siswa. */
export function nextStep(progress: LessonProgressRow[], journey: JourneyFlags): { step: JourneyStep; missionId?: number } {
  if (!journey.pretest) return { step: "pretest" };
  const states = missionStates(progress, journey);
  for (let id = 1; id <= 7; id++) if (states[id] !== "completed") return { step: "mission", missionId: id };
  if (!journey.posttest) return { step: "posttest" };
  return { step: "results" };
}

/** Persentase perjalanan: pre-test (1) + 7 misi + post-test (1) = 9 langkah. */
export function journeyPercent(progress: LessonProgressRow[], journey: JourneyFlags): number {
  const done = (journey.pretest ? 1 : 0) + progress.filter((p) => p.status === "completed").length + (journey.posttest ? 1 : 0);
  return Math.round((done / 9) * 100);
}

/** Dari daftar percobaan (terbaru dulu), susun JourneyFlags. */
export function buildJourney(attempts: (TestResult & { kind: string })[]): JourneyFlags {
  const sorted = [...attempts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const pre = sorted.filter((a) => a.kind === "pretest");
  const post = sorted.filter((a) => a.kind === "posttest");
  const strip = (a?: TestResult & { kind: string }): TestResult | null =>
    a ? { score: a.score, correct_count: a.correct_count, total: a.total, created_at: a.created_at } : null;
  return {
    pretest: strip(pre[pre.length - 1]), // pre-test pertama
    posttest: strip(post[0]),
    posttestBest: strip([...post].sort((a, b) => b.score - a.score)[0]),
  };
}
