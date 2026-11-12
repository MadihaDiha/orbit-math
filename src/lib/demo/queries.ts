import { BANK_ACHIEVEMENTS } from "@/content/questionBank";
import { missionStates } from "@/lib/progress";
import type { AchievementRow, LessonProgressRow, Profile } from "@/lib/types";
import type { AchievementsData, DashboardData, ExamData, PlaygroundData, ProfileData, TrainingData } from "@/lib/view-types";
import type { DemoState } from "./store";

/** Turunan data halaman dari state Mode Demo (setara query Supabase di lib/data.ts). */
export function demoProgress(s: DemoState): LessonProgressRow[] {
  return Object.values(s.lessons);
}

function badges(s: DemoState): AchievementRow[] {
  return BANK_ACHIEVEMENTS.filter((a) => s.achievements[a.slug]).sort((a, b) => (s.achievements[b.slug] > s.achievements[a.slug] ? 1 : -1));
}

export function demoDashboard(s: DemoState): DashboardData {
  return {
    profile: s.profile as Profile,
    stats: s.stats,
    progress: demoProgress(s),
    activities: s.logs.slice(0, 5),
    badges: badges(s),
    gamesPlayed: s.gameAttempts.length,
  };
}

export function demoTraining(s: DemoState, slugs: string[]): TrainingData {
  const best: TrainingData["best"] = {};
  for (const a of s.quizAttempts) {
    if (!slugs.includes(a.quiz)) continue;
    best[a.quiz] = { best: Math.max(best[a.quiz]?.best ?? 0, a.score), count: (best[a.quiz]?.count ?? 0) + 1 };
  }
  return { best };
}

export function demoPlayground(s: DemoState): PlaygroundData {
  const stats: PlaygroundData["stats"] = {};
  for (const g of s.gameAttempts) {
    const cur = stats[g.slug] ?? { best: 0, plays: 0, cleared: false };
    stats[g.slug] = { best: Math.max(cur.best, g.score), plays: cur.plays + 1, cleared: cur.cleared || g.cleared };
  }
  return { stats };
}

export function demoExam(s: DemoState): ExamData {
  return {
    unlocked: missionStates(demoProgress(s))[7] !== "locked",
    attempts: s.quizAttempts.filter((a) => a.kind === "exam").slice(0, 10),
  };
}

export function demoProfile(s: DemoState): ProfileData {
  const xpByCategory: Record<string, number> = {};
  for (const e of Object.values(s.xpEvents)) xpByCategory[e.category] = (xpByCategory[e.category] ?? 0) + e.amount;
  return {
    profile: s.profile as Profile,
    stats: s.stats,
    completed: demoProgress(s).filter((p) => p.status === "completed").length,
    games: s.gameAttempts.length,
    exams: s.quizAttempts.filter((a) => a.kind === "exam").length,
    badges: badges(s),
    xpByCategory,
  };
}

export function demoAchievements(s: DemoState): AchievementsData {
  return { all: [...BANK_ACHIEVEMENTS].sort((a, b) => a.sort_order - b.sort_order), earnedAt: s.achievements, stats: s.stats, progress: demoProgress(s) };
}
