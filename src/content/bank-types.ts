import type { CorrectAnswer, MatchOptions, QuestionType } from "@/lib/types";

export interface BankLesson {
  id: number;
  slug: string;
  title: string;
  planet_name: string;
  xp_reward: number;
}

export interface BankQuiz {
  slug: string;
  title: string;
  kind: "lesson" | "training" | "exam" | "daily";
  lesson_id: number | null;
  level: number | null;
  pass_score: number;
  xp_reward: number;
  default_count: number;
  shuffle: boolean;
}

export interface BankGame {
  id: number;
  slug: string;
  title: string;
  description: string;
  max_score: number;
  pass_score: number;
  xp_reward: number;
}

export interface BankAchievement {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  sort_order: number;
}

export interface BankQuestion {
  id: number;
  quiz: string;
  qtype: QuestionType;
  topic: string;
  difficulty: number;
  prompt: string;
  options: string[] | MatchOptions | null;
  answer: CorrectAnswer;
  explanation: string;
  illustration: string | null;
  unit: string | null;
  sort_order: number;
}
