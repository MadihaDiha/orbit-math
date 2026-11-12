"use client";

import { useSyncExternalStore } from "react";
import type { ActivityLog, LessonProgressRow, Profile, UserStats } from "@/lib/types";

/**
 * MODE DEMO — dipakai otomatis bila Supabase belum dikonfigurasi.
 * Semua data disimpan di localStorage browser ini (bukan server).
 */
export interface DemoQuizAttempt {
  id: number;
  quiz: string;
  kind: string;
  score: number;
  correct_count: number;
  total: number;
  passed: boolean;
  duration_seconds: number;
  created_at: string;
}

export interface DemoGameAttempt {
  id: number;
  slug: string;
  score: number;
  max_score: number;
  correct: number;
  total: number;
  cleared: boolean;
  created_at: string;
}

export interface DemoSession {
  quiz: string;
  ids: number[];
  started: number;
  limit: number | null;
  submitted: boolean;
}

export interface DemoState {
  version: 1;
  loggedIn: boolean;
  profile: Profile | null;
  stats: UserStats;
  lessons: Record<number, LessonProgressRow>;
  quizAttempts: DemoQuizAttempt[];
  gameAttempts: DemoGameAttempt[];
  xpEvents: Record<string, { amount: number; category: string; at: string }>;
  achievements: Record<string, string>;
  daily: Record<string, { qid: number; correct: boolean }>;
  logs: ActivityLog[];
  sessions: Record<string, DemoSession>;
  seq: number;
}

const KEY = "orbit-math-demo-v1";

export function emptyState(): DemoState {
  return {
    version: 1,
    loggedIn: false,
    profile: null,
    stats: { user_id: "demo", total_xp: 0, level: 1, stars: 0, streak_days: 0, last_active_date: null },
    lessons: {},
    quizAttempts: [],
    gameAttempts: [],
    xpEvents: {},
    achievements: {},
    daily: {},
    logs: [],
    sessions: {},
    seq: 1,
  };
}

let cache: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as DemoState) : null;
    cache = parsed && parsed.version === 1 ? { ...emptyState(), ...parsed } : emptyState();
  } catch {
    cache = emptyState();
  }
  return cache;
}

function write(next: DemoState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // penyimpanan penuh / diblokir: data tetap ada selama tab terbuka
  }
  listeners.forEach((l) => l());
}

export function getDemoState(): DemoState {
  return read();
}

/** Mengubah state secara aman (salinan), lalu menyimpan & memberi tahu komponen. */
export function mutateDemo<T>(fn: (s: DemoState) => T): T {
  const copy = structuredClone(read());
  const result = fn(copy);
  write(copy);
  return result;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** null saat render server / sebelum browser siap. */
export function useDemoState(): DemoState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function nextId(s: DemoState): number {
  return s.seq++;
}
