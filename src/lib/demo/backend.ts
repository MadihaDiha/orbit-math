"use client";

/**
 * Backend Mode Demo: meniru fungsi PostgreSQL di supabase/migrations/0003_functions.sql
 * (penilaian, XP sekali-per-sumber, level, bintang, lencana, tantangan harian) di browser.
 */
import { BANK_ACHIEVEMENTS, BANK_GAMES, BANK_LESSONS, BANK_QUESTIONS, BANK_QUIZZES } from "@/content/questionBank";
import type { BankQuestion } from "@/content/bank-types";
import { levelForXp } from "@/lib/levels";
import type {
  ActivityType,
  CheckResult,
  CompleteLessonResult,
  CorrectAnswer,
  DailyChallenge,
  EarnedAchievement,
  GameResult,
  GivenAnswer,
  PublicQuestion,
  QuizResult,
  StartedQuiz,
} from "@/lib/types";
import { emptyState, getDemoState, mutateDemo, nextId, type DemoState } from "./store";

const DAY = 24 * 60 * 60 * 1000;

export function jakartaToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY);
}

/** Sama persis dengan private.grade_answer() di SQL. */
export function gradeAnswer(answer: CorrectAnswer, given: GivenAnswer | null | undefined): boolean {
  if (!given || typeof given !== "object") return false;
  if ("value" in answer) {
    if (!("value" in given) || typeof given.value !== "number" || !Number.isFinite(given.value)) return false;
    const tol = answer.tolerance ?? 0.05;
    if (Math.abs(given.value - answer.value) <= tol) return true;
    return (answer.alt ?? []).some((a) => Math.abs(given.value - a) <= tol);
  }
  if ("pairs" in answer) {
    return "pairs" in given && given.pairs.length === answer.pairs.length && given.pairs.every((p, i) => p === answer.pairs[i]);
  }
  return "index" in given && given.index === answer.index;
}

function publicQuestion(q: BankQuestion): PublicQuestion {
  return { id: q.id, type: q.qtype, topic: q.topic, difficulty: q.difficulty, prompt: q.prompt, options: q.options, illustration: q.illustration, unit: q.unit };
}

function quizBySlug(slug: string) {
  const q = BANK_QUIZZES.find((x) => x.slug === slug);
  if (!q) throw new Error("quiz_not_found");
  return q;
}

function isUnlocked(s: DemoState, lessonId: number): boolean {
  return lessonId <= 1 || s.lessons[lessonId - 1]?.status === "completed";
}

function requireUser(s: DemoState) {
  if (!s.loggedIn || !s.profile) throw new Error("not_authenticated");
}

function touch(s: DemoState) {
  const today = jakartaToday();
  const last = s.stats.last_active_date;
  if (last !== today) {
    s.stats.streak_days = last && daysBetween(last, today) === 1 ? s.stats.streak_days + 1 : 1;
    s.stats.last_active_date = today;
  }
}

function awardXp(s: DemoState, key: string, amount: number, category: string): number {
  if (amount <= 0 || s.xpEvents[key]) return 0;
  s.xpEvents[key] = { amount, category, at: new Date().toISOString() };
  s.stats.total_xp += amount;
  s.stats.level = levelForXp(s.stats.total_xp).level;
  return amount;
}

function log(s: DemoState, type: ActivityType, title: string, status: string, score: number | null = null, xp = 0) {
  s.logs.unshift({ id: nextId(s), activity_type: type, title, status, score, xp_earned: xp, created_at: new Date().toISOString() });
  if (s.logs.length > 300) s.logs.length = 300;
}

function checkAchievements(s: DemoState): EarnedAchievement[] {
  const done = (id: number) => s.lessons[id]?.status === "completed";
  const passedQuiz = (slug: string) => s.quizAttempts.some((a) => a.quiz === slug && a.passed);
  const rules: Record<string, () => boolean> = {
    "first-discovery": () => Object.values(s.lessons).some((l) => l.status === "completed"),
    "radius-specialist": () => done(2),
    "pi-detective": () => done(3),
    "circle-explorer": () => [1, 2, 3, 4, 5, 6].every(done),
    "formula-master": () => passedQuiz("training-2"),
    "cosmic-calculator": () => s.gameAttempts.some((g) => g.slug === "orbit-calculation" && g.cleared),
    "galaxy-champion": () => s.quizAttempts.some((a) => a.kind === "exam" && a.passed),
    "perfect-orbit": () => s.quizAttempts.some((a) => a.kind === "exam" && a.score === 100),
    "game-explorer": () => new Set(s.gameAttempts.map((g) => g.slug)).size >= BANK_GAMES.length,
    "daily-hero": () => Object.values(s.daily).some((d) => d.correct),
  };
  const earned: EarnedAchievement[] = [];
  for (const a of [...BANK_ACHIEVEMENTS].sort((x, y) => x.sort_order - y.sort_order)) {
    if (s.achievements[a.slug] || !rules[a.slug]?.()) continue;
    s.achievements[a.slug] = new Date().toISOString();
    const xp = awardXp(s, `ach:${a.slug}`, a.xp_reward, "achievement");
    log(s, "achievement", `Lencana: ${a.title}`, "diperoleh", null, xp);
    earned.push({ slug: a.slug, title: a.title, description: a.description, icon: a.icon, xp: a.xp_reward });
  }
  return earned;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dailyQuestion(): BankQuestion | null {
  const pool = BANK_QUESTIONS.filter((q) => q.quiz === "daily").sort((a, b) => a.sort_order - b.sort_order);
  if (pool.length === 0) return null;
  const idx = daysBetween("2024-01-01", jakartaToday()) % pool.length;
  return pool[idx];
}

const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120));

export const demoRpc = {
  async openLesson(slug: string) {
    return delay(
      mutateDemo((s) => {
        requireUser(s);
        const lesson = BANK_LESSONS.find((l) => l.slug === slug);
        if (!lesson) throw new Error("lesson_not_found");
        if (!isUnlocked(s, lesson.id)) return { unlocked: false, status: "locked" };
        touch(s);
        if (!s.lessons[lesson.id]) {
          s.lessons[lesson.id] = { lesson_id: lesson.id, status: "in_progress", best_quiz_score: 0, stars: 0, completed_at: null };
          log(s, "lesson", `Mulai Misi ${lesson.id}: ${lesson.title}`, "dimulai");
        }
        return { unlocked: true, status: s.lessons[lesson.id].status };
      }),
    );
  },

  async startQuiz(slug: string, count?: number, timeLimitSeconds?: number): Promise<StartedQuiz> {
    return delay(
      mutateDemo((s) => {
        requireUser(s);
        const quiz = quizBySlug(slug);
        if (quiz.kind === "daily") throw new Error("quiz_not_found");
        if (quiz.kind === "lesson" && quiz.lesson_id && !isUnlocked(s, quiz.lesson_id)) throw new Error("lesson_locked");
        if (quiz.kind === "exam" && !isUnlocked(s, 7)) throw new Error("exam_locked");
        const n = Math.min(Math.max(count ?? quiz.default_count, 1), 50);
        const pool = BANK_QUESTIONS.filter((q) => q.quiz === slug);
        const chosen = quiz.shuffle ? shuffle(pool).slice(0, n) : pool.sort((a, b) => a.sort_order - b.sort_order).slice(0, n);
        if (chosen.length === 0) throw new Error("quiz_empty");
        const limit = quiz.kind === "exam" && timeLimitSeconds ? Math.min(Math.max(timeLimitSeconds, 60), 7200) : null;
        const id = `s${nextId(s)}-${Date.now()}`;
        // bersihkan sesi lama
        for (const [k, v] of Object.entries(s.sessions)) if (Date.now() - v.started > DAY || v.submitted) delete s.sessions[k];
        s.sessions[id] = { quiz: slug, ids: chosen.map((q) => q.id), started: Date.now(), limit, submitted: false };
        touch(s);
        return {
          session_id: id,
          time_limit_seconds: limit,
          quiz: { slug: quiz.slug, title: quiz.title, kind: quiz.kind as "lesson" | "training" | "exam", pass_score: quiz.pass_score, level: quiz.level },
          questions: chosen.map(publicQuestion),
        };
      }),
    );
  },

  async checkAnswer(sessionId: string, questionId: number, given: GivenAnswer | null): Promise<CheckResult> {
    const s = getDemoState();
    requireUser(s);
    const sess = s.sessions[sessionId];
    if (!sess) throw new Error("session_not_found");
    if (sess.submitted) throw new Error("session_already_submitted");
    if (quizBySlug(sess.quiz).kind !== "training") throw new Error("feedback_not_allowed");
    if (!sess.ids.includes(questionId)) throw new Error("question_not_in_session");
    const q = BANK_QUESTIONS.find((x) => x.id === questionId)!;
    return delay({ is_correct: gradeAnswer(q.answer, given), correct_answer: q.answer, explanation: q.explanation });
  },

  async submitQuiz(sessionId: string, answers: Record<string, GivenAnswer>): Promise<QuizResult> {
    return delay(
      mutateDemo((s) => {
        requireUser(s);
        const sess = s.sessions[sessionId];
        if (!sess) throw new Error("session_not_found");
        if (sess.submitted) throw new Error("session_already_submitted");
        if (Date.now() - sess.started > DAY) throw new Error("session_expired");
        const quiz = quizBySlug(sess.quiz);
        let correct = 0;
        let xp = 0;
        const review = sess.ids.map((id) => {
          const q = BANK_QUESTIONS.find((x) => x.id === id)!;
          const given = answers[String(id)] ?? null;
          const ok = gradeAnswer(q.answer, given);
          if (ok) {
            correct++;
            if (quiz.kind === "training") xp += awardXp(s, `q:${q.id}`, 5, "training");
          }
          return { ...publicQuestion(q), given, correct_answer: q.answer, is_correct: ok, explanation: q.explanation };
        });
        const total = sess.ids.length;
        const score = total > 0 ? Math.round((100 * correct) / total) : 0;
        const passed = score >= quiz.pass_score;
        sess.submitted = true;
        s.quizAttempts.unshift({
          id: nextId(s),
          quiz: quiz.slug,
          kind: quiz.kind,
          score,
          correct_count: correct,
          total,
          passed,
          duration_seconds: Math.round((Date.now() - sess.started) / 1000),
          created_at: new Date().toISOString(),
        });
        if (quiz.kind === "lesson" && quiz.lesson_id) {
          const lp = s.lessons[quiz.lesson_id] ?? { lesson_id: quiz.lesson_id, status: "in_progress" as const, best_quiz_score: 0, stars: 0, completed_at: null };
          lp.best_quiz_score = Math.max(lp.best_quiz_score, score);
          s.lessons[quiz.lesson_id] = lp;
        } else if (passed && quiz.kind === "training") {
          xp += awardXp(s, `quiz-pass:${quiz.slug}`, quiz.xp_reward, "training");
        } else if (passed && quiz.kind === "exam") {
          xp += awardXp(s, "exam-pass", quiz.xp_reward, "exam");
          if (score === 100) xp += awardXp(s, "exam-perfect", 100, "exam");
        }
        const type: ActivityType = quiz.kind === "lesson" ? "lesson" : quiz.kind === "exam" ? "exam" : "training";
        log(s, type, quiz.title, passed ? "lulus" : "belum lulus", score, xp);
        touch(s);
        const newAch = checkAchievements(s);
        return { score, correct, total, passed, pass_score: quiz.pass_score, xp_earned: xp, review, new_achievements: newAch };
      }),
    );
  },

  async completeLesson(slug: string): Promise<CompleteLessonResult> {
    return delay(
      mutateDemo((s) => {
        requireUser(s);
        const lesson = BANK_LESSONS.find((l) => l.slug === slug);
        if (!lesson) throw new Error("lesson_not_found");
        if (!isUnlocked(s, lesson.id)) throw new Error("lesson_locked");
        const quiz = BANK_QUIZZES.find((q) => q.kind === "lesson" && q.lesson_id === lesson.id);
        let best = 100;
        if (quiz) {
          best = Math.max(0, ...s.quizAttempts.filter((a) => a.quiz === quiz.slug).map((a) => a.score));
          if (best < quiz.pass_score) throw new Error("quiz_not_passed");
        }
        const prev = s.lessons[lesson.id];
        const wasCompleted = prev?.status === "completed";
        const stars = best >= 100 ? 3 : best >= 80 ? 2 : 1;
        s.lessons[lesson.id] = {
          lesson_id: lesson.id,
          status: "completed",
          best_quiz_score: Math.max(prev?.best_quiz_score ?? 0, best),
          stars: Math.max(prev?.stars ?? 0, stars),
          completed_at: prev?.completed_at ?? new Date().toISOString(),
        };
        touch(s);
        s.stats.stars = Object.values(s.lessons).reduce((sum, l) => sum + l.stars, 0);
        const xp = awardXp(s, `lesson:${lesson.slug}`, lesson.xp_reward, "lesson");
        if (!wasCompleted) log(s, "lesson", `Misi ${lesson.id} selesai: ${lesson.title}`, "selesai", best, xp);
        const next = BANK_LESSONS.find((l) => l.id === lesson.id + 1);
        return { already_completed: wasCompleted, stars, xp_earned: xp, next_slug: next?.slug ?? null, new_achievements: checkAchievements(s) };
      }),
    );
  },

  async submitGame(slug: string, scoreRaw: number, correctRaw: number, totalRaw: number): Promise<GameResult> {
    return delay(
      mutateDemo((s) => {
        requireUser(s);
        const game = BANK_GAMES.find((g) => g.slug === slug);
        if (!game) throw new Error("game_not_found");
        const score = Math.min(Math.max(Math.round(scoreRaw) || 0, 0), game.max_score);
        const total = Math.min(Math.max(totalRaw || 0, 0), 100);
        const correct = Math.min(Math.max(correctRaw || 0, 0), total);
        const cleared = score >= game.pass_score;
        s.gameAttempts.unshift({ id: nextId(s), slug, score, max_score: game.max_score, correct, total, cleared, created_at: new Date().toISOString() });
        if (s.gameAttempts.length > 500) s.gameAttempts.length = 500;
        let xp = 0;
        if (cleared) xp += awardXp(s, `game-clear:${slug}`, game.xp_reward, "game");
        if (correct > 0) xp += awardXp(s, `game-daily:${slug}:${jakartaToday()}`, 10, "game");
        log(s, "game", game.title, cleared ? "misi berhasil" : "dicoba", score, xp);
        touch(s);
        const best = Math.max(...s.gameAttempts.filter((g) => g.slug === slug).map((g) => g.score));
        return { score, max_score: game.max_score, cleared, best_score: best, xp_earned: xp, new_achievements: checkAchievements(s) };
      }),
    );
  },

  async getDaily(): Promise<DailyChallenge | null> {
    const s = getDemoState();
    requireUser(s);
    const q = dailyQuestion();
    if (!q) return null;
    const today = jakartaToday();
    const att = s.daily[today];
    return delay({
      date: today,
      question: publicQuestion(q),
      done: Boolean(att),
      is_correct: att ? att.correct : null,
      correct_answer: att ? q.answer : null,
      explanation: att ? q.explanation : null,
    });
  },

  async submitDaily(given: GivenAnswer) {
    return delay(
      mutateDemo((s) => {
        requireUser(s);
        const q = dailyQuestion();
        if (!q) throw new Error("daily_unavailable");
        const today = jakartaToday();
        if (s.daily[today]) throw new Error("daily_already_done");
        const ok = gradeAnswer(q.answer, given);
        s.daily[today] = { qid: q.id, correct: ok };
        const xp = ok ? awardXp(s, `daily:${today}`, 30, "daily") : 0;
        log(s, "daily", "Tantangan Harian", ok ? "berhasil" : "belum berhasil", ok ? 100 : 0, xp);
        touch(s);
        return { is_correct: ok, correct_answer: q.answer, explanation: q.explanation, xp_earned: xp, new_achievements: checkAchievements(s) };
      }),
    );
  },

  async usernameAvailable(username: string) {
    return /^[a-z0-9_]{3,20}$/.test(username);
  },
};

// ---------- Akun demo (lokal) ----------
export function demoRegister(input: { fullName: string; username: string; className: string }) {
  mutateDemo((s) => {
    const fresh = !s.profile || s.profile.username !== input.username;
    if (fresh) {
      const keep = { seq: s.seq };
      Object.assign(s, { ...emptyState(), seq: keep.seq });
    }
    s.profile = {
      id: "demo-user",
      full_name: input.fullName.trim(),
      username: input.username.trim(),
      email: `${input.username.trim()}@demo.orbitmath`,
      class_name: input.className.trim(),
      avatar_color: s.profile?.avatar_color ?? "blue",
      created_at: s.profile?.created_at ?? new Date().toISOString(),
    };
    s.loggedIn = true;
    if (fresh) log(s, "account", "Akun penjelajah (Mode Demo) dibuat", "selesai");
    touch(s);
  });
}

export function demoLogin() {
  mutateDemo((s) => {
    if (!s.profile) throw new Error("not_authenticated");
    s.loggedIn = true;
    touch(s);
  });
}

/** Logout: sesi diakhiri, data & progres TETAP tersimpan. */
export function demoLogout() {
  mutateDemo((s) => {
    s.loggedIn = false;
  });
}

export function demoUpdateProfile(patch: { full_name: string; username: string; class_name: string; avatar_color: NonNullable<DemoState["profile"]>["avatar_color"] }) {
  mutateDemo((s) => {
    requireUser(s);
    s.profile = { ...s.profile!, ...patch };
  });
}

