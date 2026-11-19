import type { AchievementRow, ActivityLog, LessonProgressRow, Profile, UserStats } from "@/lib/types";
import type { JourneyFlags } from "@/lib/progress";

/** Data yang dibutuhkan setiap halaman. Diisi dari Supabase ATAU dari Mode Demo. */
export interface DashboardData {
  profile: Profile;
  stats: UserStats;
  progress: LessonProgressRow[];
  activities: ActivityLog[];
  badges: AchievementRow[];
  gamesPlayed: number;
  journey: JourneyFlags;
}

export interface TrainingData {
  best: Record<string, { best: number; count: number }>;
}

export interface PlaygroundData {
  stats: Record<string, { best: number; plays: number; cleared: boolean }>;
}

export interface ExamAttemptRow {
  id: number;
  score: number;
  correct_count: number;
  total: number;
  passed: boolean;
  duration_seconds: number | null;
  created_at: string;
}

export interface ExamData {
  unlocked: boolean;
  attempts: ExamAttemptRow[];
}

export interface ProfileData {
  profile: Profile;
  stats: UserStats;
  completed: number;
  games: number;
  exams: number;
  badges: AchievementRow[];
  xpByCategory: Record<string, number>;
}

export interface AchievementsData {
  all: AchievementRow[];
  earnedAt: Record<string, string>;
  stats: UserStats;
  progress: LessonProgressRow[];
  journey: JourneyFlags;
}

export interface JourneyData {
  progress: LessonProgressRow[];
  journey: JourneyFlags;
}

export interface ResultsData {
  profile: Profile;
  stats: UserStats;
  progress: LessonProgressRow[];
  journey: JourneyFlags;
  badges: AchievementRow[];
}
