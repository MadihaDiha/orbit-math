import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AchievementRow, ActivityLog, LessonProgressRow, Profile, UserStats } from "@/lib/types";
import type { AchievementsData, DashboardData, ExamAttemptRow, ExamData, PlaygroundData, ProfileData, TrainingData } from "@/lib/view-types";
import { missionStates } from "@/lib/progress";

export { missionStates, type MissionState } from "@/lib/progress";

/** Pengguna yang sedang login (divalidasi ke server Supabase). Dicache per request. */
export const getSession = cache(async () => {
  if (!isSupabaseConfigured()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: stats }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, username, email, class_name, avatar_color, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("user_stats").select("user_id, total_xp, level, stars, streak_days, last_active_date").eq("user_id", user.id).maybeSingle(),
  ]);

  const fallbackProfile: Profile = {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string) ?? "Penjelajah",
    username: (user.user_metadata?.username as string) ?? "explorer",
    email: user.email ?? "",
    class_name: (user.user_metadata?.class_name as string) ?? "VIII",
    avatar_color: "blue",
    created_at: user.created_at,
  };

  return {
    supabase,
    user,
    profile: (profile as Profile | null) ?? fallbackProfile,
    stats: (stats as UserStats | null) ?? { user_id: user.id, total_xp: 0, level: 1, stars: 0, streak_days: 0, last_active_date: null },
  };
});

export const getLessonProgress = cache(async () => {
  const { supabase, user } = await getSession();
  const { data } = await supabase.from("lesson_progress").select("lesson_id, status, best_quiz_score, stars, completed_at").eq("user_id", user.id);
  return (data ?? []) as LessonProgressRow[];
});

function extractBadges(rows: unknown[] | null): AchievementRow[] {
  return (rows ?? []).map((e) => (e as { achievements: AchievementRow | null }).achievements).filter((a): a is AchievementRow => Boolean(a));
}

export async function getDashboardData(): Promise<DashboardData> {
  const { supabase, user, profile, stats } = await getSession();
  const progress = await getLessonProgress();
  const [{ data: activities }, { data: earned }, { count: gamesPlayed }] = await Promise.all([
    supabase.from("activity_logs").select("id, activity_type, title, status, score, xp_earned, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("user_achievements").select("earned_at, achievements(slug, title, description, icon, xp_reward, sort_order)").eq("user_id", user.id).order("earned_at", { ascending: false }),
    supabase.from("game_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  return { profile, stats, progress, activities: (activities ?? []) as ActivityLog[], badges: extractBadges(earned), gamesPlayed: gamesPlayed ?? 0 };
}

export async function getTrainingData(slugs: string[]): Promise<TrainingData> {
  const { supabase, user } = await getSession();
  const { data } = await supabase.from("quiz_attempts").select("score, quizzes!inner(slug)").eq("user_id", user.id).in("quizzes.slug", slugs);
  const best: TrainingData["best"] = {};
  for (const row of (data ?? []) as unknown as { score: number; quizzes: { slug: string } }[]) {
    const s = row.quizzes.slug;
    best[s] = { best: Math.max(best[s]?.best ?? 0, row.score), count: (best[s]?.count ?? 0) + 1 };
  }
  return { best };
}

export async function getPlaygroundData(): Promise<PlaygroundData> {
  const { supabase, user } = await getSession();
  const { data } = await supabase.from("game_attempts").select("score, cleared, games!inner(slug)").eq("user_id", user.id);
  const stats: PlaygroundData["stats"] = {};
  for (const r of (data ?? []) as unknown as { score: number; cleared: boolean; games: { slug: string } }[]) {
    const s = stats[r.games.slug] ?? { best: 0, plays: 0, cleared: false };
    stats[r.games.slug] = { best: Math.max(s.best, r.score), plays: s.plays + 1, cleared: s.cleared || r.cleared };
  }
  return { stats };
}

export async function getExamData(): Promise<ExamData> {
  const { supabase, user } = await getSession();
  const states = missionStates(await getLessonProgress());
  const { data } = await supabase
    .from("quiz_attempts")
    .select("id, score, correct_count, total, passed, duration_seconds, created_at, quizzes!inner(kind)")
    .eq("user_id", user.id)
    .eq("quizzes.kind", "exam")
    .order("created_at", { ascending: false })
    .limit(10);
  return { unlocked: states[7] !== "locked", attempts: (data ?? []) as ExamAttemptRow[] };
}

export async function getProfileData(): Promise<ProfileData> {
  const { supabase, user, profile, stats } = await getSession();
  const progress = await getLessonProgress();
  const [{ count: games }, { data: examRows }, { data: earned }, { data: xpRows }] = await Promise.all([
    supabase.from("game_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("quiz_attempts").select("id, quizzes!inner(kind)").eq("user_id", user.id).eq("quizzes.kind", "exam"),
    supabase.from("user_achievements").select("achievements(slug, title, description, icon, xp_reward, sort_order)").eq("user_id", user.id),
    supabase.from("xp_events").select("amount, category").eq("user_id", user.id),
  ]);
  const xpByCategory: Record<string, number> = {};
  for (const r of (xpRows ?? []) as { amount: number; category: string }[]) xpByCategory[r.category] = (xpByCategory[r.category] ?? 0) + r.amount;
  return {
    profile,
    stats,
    completed: progress.filter((p) => p.status === "completed").length,
    games: games ?? 0,
    exams: (examRows ?? []).length,
    badges: extractBadges(earned),
    xpByCategory,
  };
}

export async function getHistoryData(): Promise<ActivityLog[]> {
  const { supabase, user } = await getSession();
  const { data } = await supabase
    .from("activity_logs")
    .select("id, activity_type, title, status, score, xp_earned, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(300);
  return (data ?? []) as ActivityLog[];
}

export async function getAchievementsData(): Promise<AchievementsData> {
  const { supabase, user, stats } = await getSession();
  const progress = await getLessonProgress();
  const [{ data: all }, { data: mine }] = await Promise.all([
    supabase.from("achievements").select("slug, title, description, icon, xp_reward, sort_order").order("sort_order"),
    supabase.from("user_achievements").select("achievement_id, earned_at").eq("user_id", user.id),
  ]);
  const earnedAt: Record<string, string> = {};
  for (const m of (mine ?? []) as { achievement_id: string; earned_at: string }[]) earnedAt[m.achievement_id] = m.earned_at;
  return { all: (all ?? []) as AchievementRow[], earnedAt, stats, progress };
}
