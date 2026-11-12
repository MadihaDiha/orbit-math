import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { LessonProgressRow, Profile, UserStats } from "@/lib/types";

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
