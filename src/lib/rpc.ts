"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  CheckResult,
  CompleteLessonResult,
  DailyChallenge,
  GameResult,
  GivenAnswer,
  QuizResult,
  StartedQuiz,
} from "@/lib/types";

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

/** Semua penilaian dilakukan di server (fungsi PostgreSQL), bukan di browser. */
export const rpc = {
  openLesson: (slug: string) => call<{ unlocked: boolean; status: string }>("open_lesson", { p_slug: slug }),
  startQuiz: (slug: string, count?: number, timeLimitSeconds?: number) =>
    call<StartedQuiz>("start_quiz", { p_slug: slug, p_count: count ?? null, p_time_limit: timeLimitSeconds ?? null }),
  checkAnswer: (sessionId: string, questionId: number, given: GivenAnswer | null) =>
    call<CheckResult>("check_answer", { p_session: sessionId, p_question_id: questionId, p_given: given }),
  submitQuiz: (sessionId: string, answers: Record<string, GivenAnswer>) =>
    call<QuizResult>("submit_quiz", { p_session: sessionId, p_answers: answers }),
  completeLesson: (slug: string) => call<CompleteLessonResult>("complete_lesson", { p_slug: slug }),
  submitGame: (slug: string, score: number, correct: number, total: number) =>
    call<GameResult>("submit_game", { p_slug: slug, p_score: Math.round(score), p_correct: correct, p_total: total }),
  getDaily: () => call<DailyChallenge | null>("get_daily_challenge"),
  submitDaily: (given: GivenAnswer) =>
    call<{ is_correct: boolean; correct_answer: DailyChallenge["correct_answer"]; explanation: string; xp_earned: number; new_achievements: QuizResult["new_achievements"] }>(
      "submit_daily_challenge",
      { p_given: given },
    ),
  usernameAvailable: (username: string) => call<boolean>("username_available", { p_username: username }),
};
