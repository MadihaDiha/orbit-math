-- =====================================================================
-- ORBIT MATH — 0002_rls.sql
-- Row Level Security: setiap siswa hanya bisa membaca data miliknya.
-- Penulisan data progres/skor/XP hanya lewat fungsi SECURITY DEFINER (0003).
-- =====================================================================

alter table public.profiles                 enable row level security;
alter table public.lessons                  enable row level security;
alter table public.lesson_progress          enable row level security;
alter table public.quizzes                  enable row level security;
alter table public.quiz_questions           enable row level security;
alter table public.quiz_sessions            enable row level security;
alter table public.quiz_attempts            enable row level security;
alter table public.games                    enable row level security;
alter table public.game_attempts            enable row level security;
alter table public.user_stats               enable row level security;
alter table public.xp_events                enable row level security;
alter table public.achievements             enable row level security;
alter table public.user_achievements        enable row level security;
alter table public.daily_challenge_attempts enable row level security;
alter table public.activity_logs            enable row level security;

-- ---------- Konten publik (hanya baca) ----------
drop policy if exists "lessons readable" on public.lessons;
create policy "lessons readable" on public.lessons for select to anon, authenticated using (true);

drop policy if exists "quizzes readable" on public.quizzes;
create policy "quizzes readable" on public.quizzes for select to authenticated using (true);

drop policy if exists "games readable" on public.games;
create policy "games readable" on public.games for select to authenticated using (true);

drop policy if exists "achievements readable" on public.achievements;
create policy "achievements readable" on public.achievements for select to authenticated using (true);

-- quiz_questions: TIDAK ADA policy -> tidak bisa dibaca langsung dari klien.
revoke all on public.quiz_questions from anon, authenticated;

-- ---------- Profil ----------
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Hanya kolom tertentu yang boleh diubah siswa (email & id tidak).
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, username, class_name, avatar_color, updated_at) on public.profiles to authenticated;

-- ---------- Data milik siswa: hanya SELECT miliknya sendiri ----------
drop policy if exists "own progress read" on public.lesson_progress;
create policy "own progress read" on public.lesson_progress for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own sessions read" on public.quiz_sessions;
create policy "own sessions read" on public.quiz_sessions for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own quiz attempts read" on public.quiz_attempts;
create policy "own quiz attempts read" on public.quiz_attempts for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own game attempts read" on public.game_attempts;
create policy "own game attempts read" on public.game_attempts for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own stats read" on public.user_stats;
create policy "own stats read" on public.user_stats for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own xp read" on public.xp_events;
create policy "own xp read" on public.xp_events for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own achievements read" on public.user_achievements;
create policy "own achievements read" on public.user_achievements for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own daily read" on public.daily_challenge_attempts;
create policy "own daily read" on public.daily_challenge_attempts for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "own activity read" on public.activity_logs;
create policy "own activity read" on public.activity_logs for select to authenticated using ((select auth.uid()) = user_id);

-- Klien tidak boleh menulis langsung ke tabel progres/skor/XP.
revoke insert, update, delete on
  public.lessons, public.quizzes, public.games, public.achievements,
  public.lesson_progress, public.quiz_sessions, public.quiz_attempts,
  public.game_attempts, public.user_stats, public.xp_events,
  public.user_achievements, public.daily_challenge_attempts, public.activity_logs
from anon, authenticated;

-- Data pribadi tidak boleh dibaca anon sama sekali.
revoke select on
  public.profiles, public.lesson_progress, public.quiz_sessions, public.quiz_attempts,
  public.game_attempts, public.user_stats, public.xp_events, public.user_achievements,
  public.daily_challenge_attempts, public.activity_logs, public.quizzes, public.games, public.achievements
from anon;

revoke all on schema private from public, anon, authenticated;
