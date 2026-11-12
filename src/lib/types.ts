export type QuestionType = "mcq" | "true_false" | "numeric" | "identify" | "match" | "fill_formula" | "story";

export interface MatchOptions {
  left: string[];
  right: string[];
}

export interface PublicQuestion {
  id: number;
  type: QuestionType;
  topic: string;
  difficulty: number;
  prompt: string;
  options: string[] | MatchOptions | null;
  illustration: string | null;
  unit: string | null;
}

export type GivenAnswer = { index: number } | { value: number } | { pairs: number[] };
export type CorrectAnswer = { index: number } | { value: number; tolerance?: number; alt?: number[] } | { pairs: number[] };

export interface StartedQuiz {
  session_id: string;
  time_limit_seconds: number | null;
  quiz: { slug: string; title: string; kind: "lesson" | "training" | "exam"; pass_score: number; level: number | null };
  questions: PublicQuestion[];
}

export interface EarnedAchievement {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
}

export interface ReviewItem extends PublicQuestion {
  given: GivenAnswer | null;
  correct_answer: CorrectAnswer;
  is_correct: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  pass_score: number;
  xp_earned: number;
  review: ReviewItem[];
  new_achievements: EarnedAchievement[];
}

export interface CheckResult {
  is_correct: boolean;
  correct_answer: CorrectAnswer;
  explanation: string;
}

export interface GameResult {
  score: number;
  max_score: number;
  cleared: boolean;
  best_score: number;
  xp_earned: number;
  new_achievements: EarnedAchievement[];
}

export interface CompleteLessonResult {
  already_completed: boolean;
  stars: number;
  xp_earned: number;
  next_slug: string | null;
  new_achievements: EarnedAchievement[];
}

export interface DailyChallenge {
  date: string;
  question: PublicQuestion;
  done: boolean;
  is_correct: boolean | null;
  correct_answer: CorrectAnswer | null;
  explanation: string | null;
}

export type AvatarColor = "blue" | "cyan" | "violet" | "gold" | "pink" | "green";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  class_name: string;
  avatar_color: AvatarColor;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  total_xp: number;
  level: number;
  stars: number;
  streak_days: number;
  last_active_date: string | null;
}

export interface LessonProgressRow {
  lesson_id: number;
  status: "in_progress" | "completed";
  best_quiz_score: number;
  stars: number;
  completed_at: string | null;
}

export type ActivityType = "lesson" | "training" | "game" | "exam" | "achievement" | "daily" | "account";

export interface ActivityLog {
  id: number;
  activity_type: ActivityType;
  title: string;
  status: string;
  score: number | null;
  xp_earned: number;
  created_at: string;
}

export interface AchievementRow {
  slug: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  sort_order: number;
}
