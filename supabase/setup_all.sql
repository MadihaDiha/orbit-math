-- ORBIT MATH — SETUP LENGKAP (gabungan 0001 + 0002 + 0003 + seed). Tempel seluruh isi file ini di Supabase SQL Editor lalu klik Run.

-- >>>>>>>>>> supabase/migrations/0001_schema.sql
-- =====================================================================
-- ORBIT MATH — 0001_schema.sql
-- Struktur tabel inti. Jalankan berurutan: 0001 -> 0002 -> 0003 -> seed.
-- =====================================================================

create schema if not exists private;

-- ---------------------------------------------------------------------
-- PROFIL SISWA (terhubung 1:1 dengan auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null check (char_length(full_name) between 2 and 80),
  username      text not null check (username ~ '^[a-z0-9_]{3,20}$'),
  email         text not null,
  class_name    text not null check (char_length(class_name) between 1 and 20),
  avatar_color  text not null default 'blue' check (avatar_color in ('blue','cyan','violet','gold','pink','green')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists profiles_username_key on public.profiles (username);

-- ---------------------------------------------------------------------
-- KONTEN: misi / materi
-- ---------------------------------------------------------------------
create table if not exists public.lessons (
  id           smallint primary key,               -- nomor misi 1..7
  slug         text not null unique,
  title        text not null,
  planet_name  text not null,
  xp_reward    int  not null default 100 check (xp_reward >= 0)
);

create table if not exists public.lesson_progress (
  user_id          uuid not null references auth.users(id) on delete cascade,
  lesson_id        smallint not null references public.lessons(id) on delete cascade,
  status           text not null default 'in_progress' check (status in ('in_progress','completed')),
  best_quiz_score  int  not null default 0 check (best_quiz_score between 0 and 100),
  stars            smallint not null default 0 check (stars between 0 and 3),
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  primary key (user_id, lesson_id)
);

-- ---------------------------------------------------------------------
-- KUIS, LATIHAN, EVALUASI
-- ---------------------------------------------------------------------
create table if not exists public.quizzes (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  title          text not null,
  kind           text not null check (kind in ('lesson','training','exam','daily')),
  lesson_id      smallint references public.lessons(id) on delete cascade,
  level          smallint check (level between 1 and 3),
  pass_score     int not null default 70 check (pass_score between 0 and 100),
  xp_reward      int not null default 0 check (xp_reward >= 0),
  default_count  int not null default 10 check (default_count between 1 and 50),
  shuffle        boolean not null default false
);

-- Kunci jawaban (answer) & pembahasan TIDAK pernah dibaca langsung oleh klien.
-- Klien hanya mendapat soal lewat fungsi start_quiz() (tanpa kunci).
create table if not exists public.quiz_questions (
  id            bigint generated always as identity primary key,
  quiz_id       bigint not null references public.quizzes(id) on delete cascade,
  qtype         text not null check (qtype in ('mcq','true_false','numeric','identify','match','fill_formula','story')),
  topic         text not null,
  difficulty    smallint not null default 1 check (difficulty between 1 and 3),
  prompt        text not null,
  options       jsonb,            -- array pilihan; untuk 'match': {"left":[...],"right":[...]}
  answer        jsonb not null,   -- {"index":n} | {"value":x,"tolerance":t,"alt":[...]} | {"pairs":[...]}
  explanation   text not null,
  illustration  text,             -- kunci ilustrasi SVG di frontend, mis. 'radius:7 cm'
  unit          text,
  sort_order    int not null default 0
);
create index if not exists quiz_questions_quiz_idx on public.quiz_questions (quiz_id, sort_order);

-- Sesi kuis: daftar soal yang dibagikan server ke siswa. Penilaian hanya
-- dilakukan untuk soal di dalam sesi ini, sehingga skor tidak bisa dimanipulasi.
create table if not exists public.quiz_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  quiz_id             bigint not null references public.quizzes(id) on delete cascade,
  question_ids        bigint[] not null,
  time_limit_seconds  int,
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz
);
create index if not exists quiz_sessions_user_idx on public.quiz_sessions (user_id, started_at desc);

create table if not exists public.quiz_attempts (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  quiz_id           bigint not null references public.quizzes(id) on delete cascade,
  session_id        uuid references public.quiz_sessions(id) on delete set null,
  score             int not null check (score between 0 and 100),
  correct_count     int not null,
  total             int not null,
  passed            boolean not null default false,
  answers           jsonb,
  duration_seconds  int,
  created_at        timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- PERMAINAN
-- ---------------------------------------------------------------------
create table if not exists public.games (
  id           smallint primary key,
  slug         text not null unique,
  title        text not null,
  description  text not null,
  max_score    int not null check (max_score > 0),
  pass_score   int not null check (pass_score >= 0),
  xp_reward    int not null default 50
);

create table if not exists public.game_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  game_id     smallint not null references public.games(id) on delete cascade,
  score       int not null check (score >= 0),
  max_score   int not null,
  correct     int not null default 0,
  total       int not null default 0,
  cleared     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists game_attempts_user_idx on public.game_attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- GAMIFIKASI
-- ---------------------------------------------------------------------
create table if not exists public.user_stats (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  total_xp          int not null default 0 check (total_xp >= 0),
  level             int not null default 1,
  stars             int not null default 0,
  streak_days       int not null default 0,
  last_active_date  date,
  updated_at        timestamptz not null default now()
);

-- Setiap pemberian XP punya source_key unik -> refresh/klik berulang tidak menambah XP.
create table if not exists public.xp_events (
  user_id     uuid not null references auth.users(id) on delete cascade,
  source_key  text not null,
  amount      int not null check (amount > 0),
  category    text not null default 'other',
  created_at  timestamptz not null default now(),
  primary key (user_id, source_key)
);

create table if not exists public.achievements (
  slug         text primary key,
  title        text not null,
  description  text not null,
  icon         text not null,
  xp_reward    int not null default 25,
  sort_order   int not null default 0
);

create table if not exists public.user_achievements (
  user_id         uuid not null references auth.users(id) on delete cascade,
  achievement_id  text not null references public.achievements(slug) on delete cascade,
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.daily_challenge_attempts (
  user_id         uuid not null references auth.users(id) on delete cascade,
  challenge_date  date not null,
  question_id     bigint not null references public.quiz_questions(id) on delete cascade,
  is_correct      boolean not null,
  created_at      timestamptz not null default now(),
  primary key (user_id, challenge_date)
);

-- ---------------------------------------------------------------------
-- RIWAYAT AKTIVITAS
-- ---------------------------------------------------------------------
create table if not exists public.activity_logs (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  activity_type  text not null check (activity_type in ('lesson','training','game','exam','achievement','daily','account')),
  title          text not null,
  status         text not null,
  score          int,
  xp_earned      int not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists activity_logs_user_idx on public.activity_logs (user_id, created_at desc);

-- >>>>>>>>>> supabase/migrations/0002_rls.sql
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

-- >>>>>>>>>> supabase/migrations/0003_functions.sql
-- =====================================================================
-- ORBIT MATH — 0003_functions.sql
-- Fungsi server (RPC). Semua penilaian, XP, level, dan lencana dihitung di
-- database sehingga tidak bisa dimanipulasi dari frontend.
-- =====================================================================

-- ---------------------------------------------------------------------
-- HELPER (schema private, tidak diekspos lewat API)
-- ---------------------------------------------------------------------
create or replace function private.today()
returns date language sql stable set search_path = '' as $$
  select (now() at time zone 'Asia/Jakarta')::date;
$$;

-- Harus sama dengan src/lib/levels.ts
create or replace function private.level_for_xp(p_xp int)
returns int language sql immutable set search_path = '' as $$
  select case
    when p_xp >= 2200 then 6
    when p_xp >= 1400 then 5
    when p_xp >= 800  then 4
    when p_xp >= 400  then 3
    when p_xp >= 150  then 2
    else 1 end;
$$;

-- Menilai satu jawaban berdasarkan bentuk kunci jawaban.
--   {"value": x, "tolerance": t, "alt": [..]}  -> jawaban angka
--   {"pairs": [..]}                            -> mencocokkan
--   {"index": n}                               -> pilihan
create or replace function private.grade_answer(p_answer jsonb, p_given jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  v_val numeric;
  v_tol numeric;
  v_alt jsonb;
begin
  if p_given is null or jsonb_typeof(p_given) <> 'object' then
    return false;
  end if;

  if p_answer ? 'value' then
    if coalesce(jsonb_typeof(p_given -> 'value'), '') <> 'number' then
      return false;
    end if;
    v_val := (p_given ->> 'value')::numeric;
    v_tol := coalesce((p_answer ->> 'tolerance')::numeric, 0.05);
    if abs(v_val - (p_answer ->> 'value')::numeric) <= v_tol then
      return true;
    end if;
    for v_alt in select value from jsonb_array_elements(coalesce(p_answer -> 'alt', '[]'::jsonb)) loop
      if abs(v_val - (v_alt #>> '{}')::numeric) <= v_tol then
        return true;
      end if;
    end loop;
    return false;
  elsif p_answer ? 'pairs' then
    return coalesce(p_given -> 'pairs' = p_answer -> 'pairs', false);
  else
    return (p_given ->> 'index') is not null and (p_given ->> 'index') = (p_answer ->> 'index');
  end if;
end;
$$;

create or replace function private.is_lesson_unlocked(p_uid uuid, p_lesson smallint)
returns boolean language sql stable set search_path = '' as $$
  select p_lesson <= 1 or exists (
    select 1 from public.lesson_progress
    where user_id = p_uid and lesson_id = p_lesson - 1 and status = 'completed'
  );
$$;

-- Memastikan baris user_stats ada & memperbarui streak harian.
create or replace function private.touch_activity(p_uid uuid)
returns void language plpgsql set search_path = '' as $$
declare
  v_today date := private.today();
begin
  insert into public.user_stats (user_id) values (p_uid) on conflict (user_id) do nothing;
  update public.user_stats
     set streak_days = case
           when last_active_date = v_today then streak_days
           when last_active_date = v_today - 1 then streak_days + 1
           else 1 end,
         last_active_date = v_today,
         updated_at = now()
   where user_id = p_uid;
end;
$$;

-- Memberi XP satu kali per source_key. Mengembalikan XP yang benar-benar diberikan.
create or replace function private.award_xp(p_uid uuid, p_key text, p_amount int, p_category text default 'other')
returns int language plpgsql set search_path = '' as $$
declare
  v_rows int;
begin
  if p_amount is null or p_amount <= 0 then
    return 0;
  end if;
  insert into public.user_stats (user_id) values (p_uid) on conflict (user_id) do nothing;
  insert into public.xp_events (user_id, source_key, amount, category)
  values (p_uid, p_key, p_amount, p_category)
  on conflict (user_id, source_key) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return 0;
  end if;
  update public.user_stats
     set total_xp = total_xp + p_amount,
         level = private.level_for_xp(total_xp + p_amount),
         updated_at = now()
   where user_id = p_uid;
  return p_amount;
end;
$$;

create or replace function private.log_activity(p_uid uuid, p_type text, p_title text, p_status text, p_score int default null, p_xp int default 0)
returns void language sql set search_path = '' as $$
  insert into public.activity_logs (user_id, activity_type, title, status, score, xp_earned)
  values (p_uid, p_type, p_title, p_status, p_score, coalesce(p_xp, 0));
$$;

-- Memeriksa syarat semua lencana, memberikan yang baru terpenuhi.
create or replace function private.check_achievements(p_uid uuid)
returns jsonb language plpgsql set search_path = '' as $$
declare
  v_new jsonb := '[]'::jsonb;
  v_ach record;
  v_ok boolean;
  v_xp int;
begin
  for v_ach in
    select a.* from public.achievements a
    where not exists (select 1 from public.user_achievements ua where ua.user_id = p_uid and ua.achievement_id = a.slug)
    order by a.sort_order
  loop
    v_ok := case v_ach.slug
      when 'first-discovery' then exists (select 1 from public.lesson_progress where user_id = p_uid and status = 'completed')
      when 'radius-specialist' then exists (select 1 from public.lesson_progress where user_id = p_uid and lesson_id = 2 and status = 'completed')
      when 'pi-detective' then exists (select 1 from public.lesson_progress where user_id = p_uid and lesson_id = 3 and status = 'completed')
      when 'circle-explorer' then (select count(*) from public.lesson_progress where user_id = p_uid and lesson_id between 1 and 6 and status = 'completed') >= 6
      when 'formula-master' then exists (
        select 1 from public.quiz_attempts qa join public.quizzes q on q.id = qa.quiz_id
        where qa.user_id = p_uid and q.slug = 'training-2' and qa.passed)
      when 'cosmic-calculator' then exists (
        select 1 from public.game_attempts ga join public.games g on g.id = ga.game_id
        where ga.user_id = p_uid and g.slug = 'orbit-calculation' and ga.cleared)
      when 'galaxy-champion' then exists (
        select 1 from public.quiz_attempts qa join public.quizzes q on q.id = qa.quiz_id
        where qa.user_id = p_uid and q.kind = 'exam' and qa.passed)
      when 'perfect-orbit' then exists (
        select 1 from public.quiz_attempts qa join public.quizzes q on q.id = qa.quiz_id
        where qa.user_id = p_uid and q.kind = 'exam' and qa.score = 100)
      when 'game-explorer' then (
        select count(distinct game_id) from public.game_attempts where user_id = p_uid) >= (select count(*) from public.games)
      when 'daily-hero' then exists (select 1 from public.daily_challenge_attempts where user_id = p_uid and is_correct)
      else false
    end;

    if v_ok then
      insert into public.user_achievements (user_id, achievement_id) values (p_uid, v_ach.slug) on conflict do nothing;
      v_xp := private.award_xp(p_uid, 'ach:' || v_ach.slug, v_ach.xp_reward, 'achievement');
      perform private.log_activity(p_uid, 'achievement', 'Lencana: ' || v_ach.title, 'diperoleh', null, v_xp);
      v_new := v_new || jsonb_build_array(jsonb_build_object(
        'slug', v_ach.slug, 'title', v_ach.title, 'description', v_ach.description,
        'icon', v_ach.icon, 'xp', v_ach.xp_reward));
    end if;
  end loop;
  return v_new;
end;
$$;

create or replace function private.public_question(q public.quiz_questions)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'id', q.id, 'type', q.qtype, 'topic', q.topic, 'difficulty', q.difficulty,
    'prompt', q.prompt, 'options', q.options, 'illustration', q.illustration, 'unit', q.unit);
$$;

create or replace function private.daily_question()
returns public.quiz_questions language plpgsql stable set search_path = '' as $$
declare
  v_count int;
  v_q public.quiz_questions;
begin
  select count(*) into v_count
    from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id
   where q.slug = 'daily';
  if v_count = 0 then
    return null;
  end if;
  select qq.* into v_q
    from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id
   where q.slug = 'daily'
   order by qq.sort_order, qq.id
  offset ((private.today() - date '2024-01-01') % v_count)
   limit 1;
  return v_q;
end;
$$;

-- ---------------------------------------------------------------------
-- TRIGGER: buat profil + statistik saat akun baru dibuat di Supabase Auth
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, username, email, class_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Penjelajah'),
    lower(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), 'explorer_' || substr(replace(new.id::text, '-', ''), 1, 8))),
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'class_name'), ''), 'VIII')
  );
  insert into public.user_stats (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.activity_logs (user_id, activity_type, title, status)
  values (new.id, 'account', 'Akun penjelajah dibuat', 'selesai');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sinkronkan email profil jika email akun diubah.
create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, ''), updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------
-- RPC PUBLIK
-- ---------------------------------------------------------------------

-- Cek ketersediaan username saat registrasi (boleh dipanggil sebelum login).
create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path = '' as $$
  select lower(coalesce(p_username, '')) ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles where username = lower(p_username));
$$;

-- Membuka misi: menandai "sedang dipelajari" bila sudah terbuka.
create or replace function public.open_lesson(p_slug text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_lesson public.lessons;
  v_rows int;
  v_status text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_lesson from public.lessons where slug = p_slug;
  if not found then raise exception 'lesson_not_found'; end if;
  if not private.is_lesson_unlocked(v_uid, v_lesson.id) then
    return jsonb_build_object('unlocked', false, 'status', 'locked');
  end if;
  perform private.touch_activity(v_uid);
  insert into public.lesson_progress (user_id, lesson_id) values (v_uid, v_lesson.id)
  on conflict (user_id, lesson_id) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows > 0 then
    perform private.log_activity(v_uid, 'lesson', 'Mulai Misi ' || v_lesson.id || ': ' || v_lesson.title, 'dimulai');
  end if;
  select status into v_status from public.lesson_progress where user_id = v_uid and lesson_id = v_lesson.id;
  return jsonb_build_object('unlocked', true, 'status', v_status);
end;
$$;

-- Memulai kuis/latihan/evaluasi: server memilih soal & mengirim tanpa kunci jawaban.
create or replace function public.start_quiz(p_slug text, p_count int default null, p_time_limit int default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_quiz public.quizzes;
  v_ids bigint[];
  v_n int;
  v_limit int;
  v_session uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_quiz from public.quizzes where slug = p_slug and kind <> 'daily';
  if not found then raise exception 'quiz_not_found'; end if;
  if v_quiz.kind = 'lesson' and not private.is_lesson_unlocked(v_uid, v_quiz.lesson_id) then
    raise exception 'lesson_locked';
  end if;
  if v_quiz.kind = 'exam' and not private.is_lesson_unlocked(v_uid, 7::smallint) then
    raise exception 'exam_locked';
  end if;

  v_n := least(greatest(coalesce(p_count, v_quiz.default_count), 1), 50);

  if v_quiz.shuffle then
    select array_agg(id) into v_ids from (
      select id from public.quiz_questions where quiz_id = v_quiz.id order by random() limit v_n) s;
  else
    select array_agg(id order by sort_order, id) into v_ids from (
      select id, sort_order from public.quiz_questions where quiz_id = v_quiz.id order by sort_order, id limit v_n) s;
  end if;

  if v_ids is null then raise exception 'quiz_empty'; end if;

  v_limit := case when v_quiz.kind = 'exam' and p_time_limit is not null
                  then least(greatest(p_time_limit, 60), 7200) end;

  insert into public.quiz_sessions (user_id, quiz_id, question_ids, time_limit_seconds)
  values (v_uid, v_quiz.id, v_ids, v_limit)
  returning id into v_session;

  perform private.touch_activity(v_uid);

  return jsonb_build_object(
    'session_id', v_session,
    'time_limit_seconds', v_limit,
    'quiz', jsonb_build_object('slug', v_quiz.slug, 'title', v_quiz.title, 'kind', v_quiz.kind,
                               'pass_score', v_quiz.pass_score, 'level', v_quiz.level),
    'questions', (
      select jsonb_agg(private.public_question(q) order by array_position(v_ids, q.id))
      from public.quiz_questions q where q.id = any (v_ids)));
end;
$$;

-- Umpan balik langsung (hanya untuk Training Zone, bukan evaluasi).
create or replace function public.check_answer(p_session uuid, p_question_id bigint, p_given jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_s public.quiz_sessions;
  v_kind text;
  v_q public.quiz_questions;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_s from public.quiz_sessions where id = p_session and user_id = v_uid;
  if not found then raise exception 'session_not_found'; end if;
  if v_s.submitted_at is not null then raise exception 'session_already_submitted'; end if;
  select kind into v_kind from public.quizzes where id = v_s.quiz_id;
  if v_kind <> 'training' then raise exception 'feedback_not_allowed'; end if;
  if not (p_question_id = any (v_s.question_ids)) then raise exception 'question_not_in_session'; end if;
  select * into v_q from public.quiz_questions where id = p_question_id;
  return jsonb_build_object(
    'is_correct', private.grade_answer(v_q.answer, p_given),
    'correct_answer', v_q.answer,
    'explanation', v_q.explanation);
end;
$$;

-- Mengumpulkan jawaban: dinilai server, disimpan, XP & lencana diberikan.
create or replace function public.submit_quiz(p_session uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_s public.quiz_sessions;
  v_quiz public.quizzes;
  v_q public.quiz_questions;
  v_given jsonb;
  v_ok boolean;
  v_correct int := 0;
  v_total int;
  v_score int;
  v_passed boolean;
  v_xp int := 0;
  v_review jsonb := '[]'::jsonb;
  v_type text;
  v_new jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_s from public.quiz_sessions where id = p_session and user_id = v_uid for update;
  if not found then raise exception 'session_not_found'; end if;
  if v_s.submitted_at is not null then raise exception 'session_already_submitted'; end if;
  if v_s.started_at < now() - interval '1 day' then raise exception 'session_expired'; end if;
  select * into v_quiz from public.quizzes where id = v_s.quiz_id;

  p_answers := coalesce(p_answers, '{}'::jsonb);
  v_total := coalesce(array_length(v_s.question_ids, 1), 0);

  for v_q in
    select * from public.quiz_questions where id = any (v_s.question_ids)
    order by array_position(v_s.question_ids, id)
  loop
    v_given := p_answers -> v_q.id::text;
    v_ok := private.grade_answer(v_q.answer, v_given);
    if v_ok then
      v_correct := v_correct + 1;
      if v_quiz.kind = 'training' then
        v_xp := v_xp + private.award_xp(v_uid, 'q:' || v_q.id, 5, 'training');
      end if;
    end if;
    v_review := v_review || jsonb_build_array(
      private.public_question(v_q) || jsonb_build_object(
        'given', v_given, 'correct_answer', v_q.answer,
        'is_correct', v_ok, 'explanation', v_q.explanation));
  end loop;

  v_score := case when v_total > 0 then round(100.0 * v_correct / v_total)::int else 0 end;
  v_passed := v_score >= v_quiz.pass_score;

  update public.quiz_sessions set submitted_at = now() where id = p_session;

  insert into public.quiz_attempts (user_id, quiz_id, session_id, score, correct_count, total, passed, answers, duration_seconds)
  values (v_uid, v_quiz.id, p_session, v_score, v_correct, v_total, v_passed, p_answers,
          extract(epoch from (now() - v_s.started_at))::int);

  if v_quiz.kind = 'lesson' then
    insert into public.lesson_progress as lp (user_id, lesson_id, best_quiz_score)
    values (v_uid, v_quiz.lesson_id, v_score)
    on conflict (user_id, lesson_id)
    do update set best_quiz_score = greatest(lp.best_quiz_score, excluded.best_quiz_score);
  elsif v_passed and v_quiz.kind = 'training' then
    v_xp := v_xp + private.award_xp(v_uid, 'quiz-pass:' || v_quiz.slug, v_quiz.xp_reward, 'training');
  elsif v_passed and v_quiz.kind = 'exam' then
    v_xp := v_xp + private.award_xp(v_uid, 'exam-pass', v_quiz.xp_reward, 'exam');
    if v_score = 100 then
      v_xp := v_xp + private.award_xp(v_uid, 'exam-perfect', 100, 'exam');
    end if;
  end if;

  v_type := case v_quiz.kind when 'lesson' then 'lesson' when 'exam' then 'exam' else 'training' end;
  perform private.log_activity(v_uid, v_type, v_quiz.title, case when v_passed then 'lulus' else 'belum lulus' end, v_score, v_xp);
  perform private.touch_activity(v_uid);
  v_new := private.check_achievements(v_uid);

  return jsonb_build_object(
    'score', v_score, 'correct', v_correct, 'total', v_total,
    'passed', v_passed, 'pass_score', v_quiz.pass_score,
    'xp_earned', v_xp, 'review', v_review, 'new_achievements', v_new);
end;
$$;

-- Menyelesaikan misi (syarat: misi terbuka + mini quiz lulus).
create or replace function public.complete_lesson(p_slug text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_lesson public.lessons;
  v_quiz public.quizzes;
  v_best int;
  v_stars int;
  v_was_completed boolean;
  v_xp int;
  v_next text;
  v_new jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_lesson from public.lessons where slug = p_slug;
  if not found then raise exception 'lesson_not_found'; end if;
  if not private.is_lesson_unlocked(v_uid, v_lesson.id) then raise exception 'lesson_locked'; end if;

  select * into v_quiz from public.quizzes where kind = 'lesson' and lesson_id = v_lesson.id limit 1;
  if found then
    select coalesce(max(score), 0) into v_best from public.quiz_attempts where user_id = v_uid and quiz_id = v_quiz.id;
    if v_best < v_quiz.pass_score then raise exception 'quiz_not_passed'; end if;
  else
    v_best := 100;
  end if;

  v_was_completed := exists (select 1 from public.lesson_progress
                             where user_id = v_uid and lesson_id = v_lesson.id and status = 'completed');
  v_stars := case when v_best >= 100 then 3 when v_best >= 80 then 2 else 1 end;

  insert into public.lesson_progress as lp (user_id, lesson_id, status, best_quiz_score, stars, completed_at)
  values (v_uid, v_lesson.id, 'completed', v_best, v_stars, now())
  on conflict (user_id, lesson_id) do update
     set status = 'completed',
         best_quiz_score = greatest(lp.best_quiz_score, excluded.best_quiz_score),
         stars = greatest(lp.stars, excluded.stars),
         completed_at = coalesce(lp.completed_at, now());

  perform private.touch_activity(v_uid);
  update public.user_stats
     set stars = (select coalesce(sum(stars), 0) from public.lesson_progress where user_id = v_uid)
   where user_id = v_uid;

  v_xp := private.award_xp(v_uid, 'lesson:' || v_lesson.slug, v_lesson.xp_reward, 'lesson');
  if not v_was_completed then
    perform private.log_activity(v_uid, 'lesson', 'Misi ' || v_lesson.id || ' selesai: ' || v_lesson.title, 'selesai', v_best, v_xp);
  end if;

  select slug into v_next from public.lessons where id = v_lesson.id + 1;
  v_new := private.check_achievements(v_uid);

  return jsonb_build_object(
    'already_completed', v_was_completed, 'stars', v_stars, 'xp_earned', v_xp,
    'next_slug', v_next, 'new_achievements', v_new);
end;
$$;

-- Menyimpan hasil permainan. Skor dibatasi ke rentang yang sah.
create or replace function public.submit_game(p_slug text, p_score int, p_correct int, p_total int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_game public.games;
  v_score int;
  v_total int;
  v_correct int;
  v_cleared boolean;
  v_xp int := 0;
  v_best int;
  v_new jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_game from public.games where slug = p_slug;
  if not found then raise exception 'game_not_found'; end if;

  v_score   := least(greatest(coalesce(p_score, 0), 0), v_game.max_score);
  v_total   := least(greatest(coalesce(p_total, 0), 0), 100);
  v_correct := least(greatest(coalesce(p_correct, 0), 0), v_total);
  v_cleared := v_score >= v_game.pass_score;

  insert into public.game_attempts (user_id, game_id, score, max_score, correct, total, cleared)
  values (v_uid, v_game.id, v_score, v_game.max_score, v_correct, v_total, v_cleared);

  if v_cleared then
    v_xp := v_xp + private.award_xp(v_uid, 'game-clear:' || v_game.slug, v_game.xp_reward, 'game');
  end if;
  if v_correct > 0 then
    v_xp := v_xp + private.award_xp(v_uid, 'game-daily:' || v_game.slug || ':' || private.today(), 10, 'game');
  end if;

  perform private.log_activity(v_uid, 'game', v_game.title, case when v_cleared then 'misi berhasil' else 'dicoba' end, v_score, v_xp);
  perform private.touch_activity(v_uid);
  select max(score) into v_best from public.game_attempts where user_id = v_uid and game_id = v_game.id;
  v_new := private.check_achievements(v_uid);

  return jsonb_build_object(
    'score', v_score, 'max_score', v_game.max_score, 'cleared', v_cleared,
    'best_score', v_best, 'xp_earned', v_xp, 'new_achievements', v_new);
end;
$$;

-- Tantangan harian (satu soal per hari, satu kesempatan).
create or replace function public.get_daily_challenge()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_q public.quiz_questions;
  v_att public.daily_challenge_attempts;
  v_done boolean;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  v_q := private.daily_question();
  if v_q.id is null then return null; end if;
  select * into v_att from public.daily_challenge_attempts where user_id = v_uid and challenge_date = private.today();
  v_done := found;
  return jsonb_build_object(
    'date', private.today(),
    'question', private.public_question(v_q),
    'done', v_done,
    'is_correct', case when v_done then v_att.is_correct end,
    'correct_answer', case when v_done then v_q.answer end,
    'explanation', case when v_done then v_q.explanation end);
end;
$$;

create or replace function public.submit_daily_challenge(p_given jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_q public.quiz_questions;
  v_ok boolean;
  v_xp int := 0;
  v_new jsonb;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  v_q := private.daily_question();
  if v_q.id is null then raise exception 'daily_unavailable'; end if;
  if exists (select 1 from public.daily_challenge_attempts where user_id = v_uid and challenge_date = private.today()) then
    raise exception 'daily_already_done';
  end if;
  v_ok := private.grade_answer(v_q.answer, p_given);
  insert into public.daily_challenge_attempts (user_id, challenge_date, question_id, is_correct)
  values (v_uid, private.today(), v_q.id, v_ok);
  if v_ok then
    v_xp := private.award_xp(v_uid, 'daily:' || private.today(), 30, 'daily');
  end if;
  perform private.log_activity(v_uid, 'daily', 'Tantangan Harian', case when v_ok then 'berhasil' else 'belum berhasil' end, case when v_ok then 100 else 0 end, v_xp);
  perform private.touch_activity(v_uid);
  v_new := private.check_achievements(v_uid);
  return jsonb_build_object(
    'is_correct', v_ok, 'correct_answer', v_q.answer, 'explanation', v_q.explanation,
    'xp_earned', v_xp, 'new_achievements', v_new);
end;
$$;

-- ---------------------------------------------------------------------
-- HAK AKSES FUNGSI
-- ---------------------------------------------------------------------
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

revoke all on function public.open_lesson(text) from public, anon;
revoke all on function public.start_quiz(text, int, int) from public, anon;
revoke all on function public.check_answer(uuid, bigint, jsonb) from public, anon;
revoke all on function public.submit_quiz(uuid, jsonb) from public, anon;
revoke all on function public.complete_lesson(text) from public, anon;
revoke all on function public.submit_game(text, int, int, int) from public, anon;
revoke all on function public.get_daily_challenge() from public, anon;
revoke all on function public.submit_daily_challenge(jsonb) from public, anon;

grant execute on function public.open_lesson(text) to authenticated;
grant execute on function public.start_quiz(text, int, int) to authenticated;
grant execute on function public.check_answer(uuid, bigint, jsonb) to authenticated;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
grant execute on function public.complete_lesson(text) to authenticated;
grant execute on function public.submit_game(text, int, int, int) to authenticated;
grant execute on function public.get_daily_challenge() to authenticated;
grant execute on function public.submit_daily_challenge(jsonb) to authenticated;

-- >>>>>>>>>> supabase/seed.sql
-- =====================================================================
-- ORBIT MATH — seed.sql
-- Data awal: misi, kuis, bank soal, permainan, lencana.
-- Aman dijalankan ulang (idempotent). Jalankan SETELAH semua migrasi.
-- Konvensi: π = 22/7 untuk bilangan kelipatan 7, π = 3,14 untuk lainnya.
-- =====================================================================

-- ---------- MISI ----------
insert into public.lessons (id, slug, title, planet_name, xp_reward) values
  (1, 'circle-station',       'Mengenal Lingkaran',           'Circle Station',       100),
  (2, 'radius-base',          'Unsur-Unsur Lingkaran',        'Radius Base',          100),
  (3, 'pi-observatory',       'Memahami Nilai Pi',            'Pi Observatory',       100),
  (4, 'circle-motion',        'Konsep Keliling Lingkaran',    'Circle Motion',        100),
  (5, 'formula-core',         'Rumus Keliling Lingkaran',     'Formula Core',         120),
  (6, 'real-world-galaxy',    'Penerapan Keliling Lingkaran', 'Real World Galaxy',    120),
  (7, 'final-cosmic-mission', 'Evaluasi Keseluruhan',         'Final Cosmic Mission', 150)
on conflict (id) do update set slug = excluded.slug, title = excluded.title,
  planet_name = excluded.planet_name, xp_reward = excluded.xp_reward;

-- ---------- KUIS ----------
insert into public.quizzes (slug, title, kind, lesson_id, level, pass_score, xp_reward, default_count, shuffle) values
  ('lesson-1', 'Mini Quiz Misi 1 — Circle Station',     'lesson', 1, null, 60, 0, 5, false),
  ('lesson-2', 'Mini Quiz Misi 2 — Radius Base',        'lesson', 2, null, 60, 0, 5, false),
  ('lesson-3', 'Mini Quiz Misi 3 — Pi Observatory',     'lesson', 3, null, 60, 0, 5, false),
  ('lesson-4', 'Mini Quiz Misi 4 — Circle Motion',      'lesson', 4, null, 60, 0, 5, false),
  ('lesson-5', 'Mini Quiz Misi 5 — Formula Core',       'lesson', 5, null, 60, 0, 5, false),
  ('lesson-6', 'Mini Quiz Misi 6 — Real World Galaxy',  'lesson', 6, null, 60, 0, 5, false),
  ('lesson-7', 'Mini Quiz Misi 7 — Pemanasan Final',    'lesson', 7, null, 60, 0, 6, false),
  ('training-1', 'Training Level 1 — Beginner Explorer', 'training', null, 1, 70, 50, 10, true),
  ('training-2', 'Training Level 2 — Space Navigator',   'training', null, 2, 70, 75, 10, true),
  ('training-3', 'Training Level 3 — Galaxy Expert',     'training', null, 3, 70, 100, 8, true),
  ('exam',  'Final Examination',  'exam',  null, null, 70, 200, 20, true),
  ('daily', 'Tantangan Harian',   'daily', null, null, 100, 30, 1, false)
on conflict (slug) do update set title = excluded.title, kind = excluded.kind, lesson_id = excluded.lesson_id,
  level = excluded.level, pass_score = excluded.pass_score, xp_reward = excluded.xp_reward,
  default_count = excluded.default_count, shuffle = excluded.shuffle;

-- ---------- PERMAINAN ----------
insert into public.games (id, slug, title, description, max_score, pass_score, xp_reward) values
  (1, 'circle-hunter',      'Circle Hunter',       'Temukan semua benda berbentuk lingkaran sebelum waktu habis.', 200, 120, 50),
  (2, 'radius-or-diameter', 'Radius or Diameter?', 'Tentukan jenis garis yang menyala pada diagram lingkaran.',  100, 70, 50),
  (3, 'pi-detective',       'Pi Detective',        'Buka petunjuk dan pecahkan kasus misteri nilai π.',          180, 100, 50),
  (4, 'orbit-calculation',  'Orbit Calculation',   'Hitung keliling orbit secara bertahap dan kumpulkan poin.',  160, 100, 60),
  (5, 'bimo-space-rescue',  'BIMO Space Rescue',   'Isi energi pesawat BIMO dengan menjawab soal keliling.',     100, 60, 75)
on conflict (id) do update set slug = excluded.slug, title = excluded.title, description = excluded.description,
  max_score = excluded.max_score, pass_score = excluded.pass_score, xp_reward = excluded.xp_reward;

-- ---------- LENCANA ----------
insert into public.achievements (slug, title, description, icon, xp_reward, sort_order) values
  ('first-discovery',   'First Discovery',    'Menyelesaikan misi pertama.',                              'rocket',     25, 1),
  ('radius-specialist', 'Radius Specialist',  'Memahami jari-jari dan diameter (Misi 2 selesai).',        'ruler',      25, 2),
  ('pi-detective',      'Pi Detective',       'Menyelesaikan misi nilai π (Misi 3 selesai).',             'search',     25, 3),
  ('circle-explorer',   'Circle Explorer',    'Menyelesaikan seluruh materi lingkaran (Misi 1–6).',       'orbit',      75, 4),
  ('formula-master',    'Formula Master',     'Lulus latihan rumus keliling (Training Level 2).',         'sigma',      50, 5),
  ('cosmic-calculator', 'Cosmic Calculator',  'Berhasil menuntaskan tantangan Orbit Calculation.',        'calculator', 50, 6),
  ('daily-hero',        'Daily Spark',        'Menjawab benar Tantangan Harian.',                         'zap',        25, 7),
  ('game-explorer',     'Playground Voyager', 'Memainkan kelima permainan di Cosmic Playground.',         'gamepad',    50, 8),
  ('galaxy-champion',   'Galaxy Champion',    'Lulus Evaluasi Akhir (Final Examination).',                'trophy',    100, 9),
  ('perfect-orbit',     'Perfect Orbit',      'Meraih nilai sempurna 100 pada Evaluasi Akhir.',           'star',      100, 10)
on conflict (slug) do update set title = excluded.title, description = excluded.description,
  icon = excluded.icon, xp_reward = excluded.xp_reward, sort_order = excluded.sort_order;

-- ---------- BANK SOAL ----------
delete from public.quiz_questions where quiz_id in (select id from public.quizzes);

create or replace function private.seed_q(
  p_quiz text, p_type text, p_topic text, p_diff int, p_prompt text,
  p_options jsonb, p_answer jsonb, p_expl text, p_illus text, p_unit text)
returns void language plpgsql set search_path = '' as $$
declare
  v_quiz bigint;
  v_order int;
begin
  select id into v_quiz from public.quizzes where slug = p_quiz;
  select coalesce(max(sort_order), 0) + 1 into v_order from public.quiz_questions where quiz_id = v_quiz;
  insert into public.quiz_questions (quiz_id, qtype, topic, difficulty, prompt, options, answer, explanation, illustration, unit, sort_order)
  values (v_quiz, p_type, p_topic, p_diff, p_prompt, p_options, p_answer, p_expl, p_illus, p_unit, v_order);
end;
$$;

-- ===== MISI 1 =====
select private.seed_q('lesson-1','mcq','Pengertian lingkaran',1,'Lingkaran adalah kumpulan titik-titik yang ...',
  '["berjarak sama terhadap satu titik pusat","membentuk sudut siku-siku","mempunyai empat sisi sama panjang","tersusun dalam satu garis lurus"]','{"index":0}',
  'Lingkaran adalah kumpulan semua titik yang jaraknya SAMA terhadap satu titik tertentu, yaitu titik pusat.', null, null);
select private.seed_q('lesson-1','true_false','Pengertian lingkaran',1,'Setiap titik pada lingkaran memiliki jarak yang sama ke titik pusat.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Jarak yang sama itu disebut jari-jari. Inilah ciri utama lingkaran.', 'anatomy:radius', null);
select private.seed_q('lesson-1','mcq','Benda berbentuk lingkaran',1,'Manakah benda berikut yang permukaannya berbentuk lingkaran?',
  '["Papan tulis","Uang koin","Buku tulis","Penggaris"]','{"index":1}',
  'Permukaan uang koin berbentuk lingkaran. Papan tulis, buku, dan penggaris berbentuk persegi panjang.', null, null);
select private.seed_q('lesson-1','true_false','Karakteristik lingkaran',1,'Lingkaran mempunyai titik sudut seperti segitiga.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. Lingkaran dibentuk oleh garis lengkung yang mulus, jadi tidak mempunyai titik sudut maupun sisi lurus.', null, null);
select private.seed_q('lesson-1','mcq','Titik pusat',1,'Titik yang berada tepat di tengah lingkaran disebut ...',
  '["Titik sudut","Titik pusat","Titik potong","Titik puncak"]','{"index":1}',
  'Titik di tengah lingkaran disebut titik pusat. Semua titik pada lingkaran berjarak sama ke titik ini.', 'anatomy:center', null);

-- ===== MISI 2 =====
select private.seed_q('lesson-2','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Jari-jari","Diameter","Tali busur","Busur"]','{"index":0}',
  'Garis itu menghubungkan titik pusat dengan satu titik pada lingkaran, jadi namanya jari-jari (r).', 'anatomy:radius', null);
select private.seed_q('lesson-2','numeric','Jari-jari dan diameter',1,'Sebuah lingkaran memiliki jari-jari 9 cm. Berapa panjang diameternya?',
  null,'{"value":18}',
  'd = 2 × r = 2 × 9 = 18 cm. Diameter selalu dua kali jari-jari.', 'circle-r:9 cm', 'cm');
select private.seed_q('lesson-2','numeric','Jari-jari dan diameter',1,'Diameter sebuah piring 26 cm. Berapa panjang jari-jarinya?',
  null,'{"value":13}',
  'r = d ÷ 2 = 26 ÷ 2 = 13 cm. Jari-jari adalah setengah diameter.', 'circle-d:26 cm', 'cm');
select private.seed_q('lesson-2','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Diameter","Jari-jari","Tali busur","Juring"]','{"index":2}',
  'Garis lurus yang menghubungkan dua titik pada lingkaran TANPA melalui titik pusat disebut tali busur.', 'anatomy:chord', null);
select private.seed_q('lesson-2','match','Unsur lingkaran',2,'Pasangkan setiap istilah dengan pengertiannya.',
  '{"left":["Busur","Juring","Tembereng"],"right":["Daerah yang dibatasi tali busur dan busur","Bagian dari keliling lingkaran (garis lengkung)","Daerah yang dibatasi dua jari-jari dan busur"]}',
  '{"pairs":[1,2,0]}',
  'Busur = garis lengkung bagian keliling. Juring = daerah "potongan pizza" antara dua jari-jari dan busur. Tembereng = daerah antara tali busur dan busur.', null, null);

-- ===== MISI 3 =====
select private.seed_q('lesson-3','mcq','Nilai pi',1,'Nilai π diperoleh dari perbandingan ...',
  '["keliling dengan diameter","keliling dengan jari-jari","diameter dengan jari-jari","luas dengan keliling"]','{"index":0}',
  'π = K ÷ d. Untuk lingkaran sebesar apa pun, keliling dibagi diameter hasilnya selalu sekitar 3,14.', null, null);
select private.seed_q('lesson-3','mcq','Nilai pi',1,'Pendekatan nilai π dalam bentuk desimal yang sering digunakan adalah ...',
  '["2,14","3,14","3,41","4,13"]','{"index":1}',
  'π = 3,14159... biasanya dibulatkan menjadi 3,14.', null, null);
select private.seed_q('lesson-3','mcq','Nilai pi',1,'Bentuk pecahan yang mendekati nilai π adalah ...',
  '["7/22","22/7","14/3","3/14"]','{"index":1}',
  '22/7 = 3,142857... sangat dekat dengan π. Hati-hati, 7/22 itu terbalik!', null, null);
select private.seed_q('lesson-3','mcq','Memilih nilai pi',2,'Jari-jari lingkaran 21 cm. Nilai π yang paling memudahkan perhitungan adalah ...',
  '["22/7 karena 21 habis dibagi 7","3,14 karena selalu lebih tepat","22/7 karena 21 bilangan genap","Tidak perlu memakai π"]','{"index":0}',
  'Gunakan 22/7 bila ukuran merupakan kelipatan 7, karena angka 7 bisa langsung dicoret: 22/7 × 21 = 22 × 3 = 66.', null, null);
select private.seed_q('lesson-3','true_false','Nilai pi',2,'Nilai π untuk lingkaran besar lebih besar daripada untuk lingkaran kecil.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. π adalah konstanta, artinya nilainya tetap untuk SEMUA lingkaran, besar maupun kecil.', null, null);

-- ===== MISI 4 =====
select private.seed_q('lesson-4','mcq','Konsep keliling',1,'Keliling lingkaran adalah ...',
  '["panjang garis lengkung yang mengelilingi lingkaran","daerah di dalam lingkaran","jarak dari pusat ke tepi","garis yang melalui pusat"]','{"index":0}',
  'Keliling adalah panjang lintasan satu putaran penuh di tepi lingkaran. Daerah di dalam lingkaran adalah luas, bukan keliling.', null, null);
select private.seed_q('lesson-4','true_false','Satu putaran',1,'Jarak yang ditempuh roda saat berputar satu kali penuh (tanpa tergelincir) sama dengan keliling roda.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Saat roda berputar satu kali, seluruh tepi roda menyentuh jalan tepat satu kali, sehingga jaraknya = keliling roda.', 'wheel:1 putaran', null);
select private.seed_q('lesson-4','mcq','Hubungan keliling dan diameter',2,'Jika diameter lingkaran diperbesar dua kali, kelilingnya menjadi ...',
  '["tetap","dua kali semula","empat kali semula","setengah kali semula"]','{"index":1}',
  'K = π × d. Jika d menjadi 2d, maka K menjadi π × 2d = 2 × (π × d). Jadi keliling juga dua kali semula.', null, null);
select private.seed_q('lesson-4','mcq','Hubungan keliling dan diameter',1,'Keliling lingkaran kira-kira berapa kali panjang diameternya?',
  '["2 kali","3,14 kali","4 kali","1,5 kali"]','{"index":1}',
  'Keliling ≈ 3,14 × diameter. Angka 3,14 inilah yang disebut π.', null, null);
select private.seed_q('lesson-4','numeric','Satu putaran',1,'Keliling sebuah roda 88 cm. Berapa cm jarak yang ditempuh roda jika berputar 1 kali penuh?',
  null,'{"value":88}',
  'Jarak satu putaran = keliling roda = 88 cm.', 'wheel:K = 88 cm', 'cm');

-- ===== MISI 5 =====
select private.seed_q('lesson-5','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = π × ___',
  '["r","d","r²","2d"]','{"index":1}',
  'K = π × d, dengan d adalah diameter.', null, null);
select private.seed_q('lesson-5','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = 2 × π × ___',
  '["d","r","K","π"]','{"index":1}',
  'K = 2 × π × r, dengan r adalah jari-jari. Ingat 2 × r = d.', null, null);
select private.seed_q('lesson-5','numeric','Menghitung keliling',2,'Hitung keliling lingkaran dengan diameter 14 cm. (π = 22/7)',
  null,'{"value":44,"alt":[43.96]}',
  'K = π × d = 22/7 × 14 = 22 × 2 = 44 cm.', 'circle-d:14 cm', 'cm');
select private.seed_q('lesson-5','numeric','Menghitung keliling',2,'Hitung keliling lingkaran dengan jari-jari 10 cm. (π = 3,14)',
  null,'{"value":62.8,"alt":[62.86]}',
  'K = 2 × π × r = 2 × 3,14 × 10 = 62,8 cm.', 'circle-r:10 cm', 'cm');
select private.seed_q('lesson-5','true_false','Hubungan dua rumus',2,'Rumus K = π × d dan K = 2 × π × r memberikan hasil yang sama, karena d = 2 × r.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Karena d = 2 × r, maka π × d = π × 2 × r = 2 × π × r. Keduanya rumus yang sama dalam bentuk berbeda.', null, null);

-- ===== MISI 6 =====
select private.seed_q('lesson-6','story','Roda sepeda',2,'Roda sepeda Dimas berjari-jari 35 cm. Berapa cm jarak yang ditempuh roda dalam satu putaran? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}',
  'Diketahui r = 35 cm. Jarak 1 putaran = keliling = 2 × 22/7 × 35 = 2 × 22 × 5 = 220 cm.', 'wheel:r = 35 cm', 'cm');
select private.seed_q('lesson-6','story','Pagar taman',2,'Taman berbentuk lingkaran berdiameter 20 m akan dipagari mengelilinginya. Berapa meter panjang pagar yang diperlukan? (π = 3,14)',
  null,'{"value":62.8,"alt":[62.86]}',
  'Panjang pagar = keliling taman = π × d = 3,14 × 20 = 62,8 m.', 'garden:d = 20 m', 'm');
select private.seed_q('lesson-6','story','Meja bundar',2,'Meja bundar berdiameter 140 cm akan dipasangi pita di tepinya. Berapa cm panjang pita yang dibutuhkan? (π = 22/7)',
  null,'{"value":440,"alt":[439.6]}',
  'Panjang pita = keliling meja = 22/7 × 140 = 22 × 20 = 440 cm.', 'table:d = 140 cm', 'cm');
select private.seed_q('lesson-6','story','Jarak tempuh roda',3,'Roda berjari-jari 14 cm berputar 10 kali. Berapa cm jarak yang ditempuh? (π = 22/7)',
  null,'{"value":880,"alt":[879.2]}',
  'Keliling = 2 × 22/7 × 14 = 88 cm. Jarak 10 putaran = 10 × 88 = 880 cm.', 'wheel:r = 14 cm', 'cm');
select private.seed_q('lesson-6','mcq','Lintasan lari',3,'Lintasan lari berbentuk lingkaran dengan diameter 70 m. Rani berlari 2 putaran. Jarak yang ditempuh Rani adalah ... (π = 22/7)',
  '["220 m","440 m","140 m","880 m"]','{"index":1}',
  'Keliling lintasan = 22/7 × 70 = 220 m. Dua putaran = 2 × 220 = 440 m.', 'track:d = 70 m', null);

-- ===== MISI 7 (pemanasan sebelum evaluasi) =====
select private.seed_q('lesson-7','mcq','Jari-jari dan diameter',1,'Hubungan diameter (d) dan jari-jari (r) yang benar adalah ...',
  '["d = r ÷ 2","d = 2 × r","d = r + 2","d = r × r"]','{"index":1}',
  'Diameter terdiri dari dua jari-jari yang segaris, jadi d = 2 × r.', null, null);
select private.seed_q('lesson-7','identify','Unsur lingkaran',1,'Daerah yang menyala pada gambar adalah ...',
  '["Tembereng","Juring","Busur","Tali busur"]','{"index":1}',
  'Daerah yang dibatasi dua jari-jari dan sebuah busur disebut juring (bentuknya seperti potongan pizza).', 'anatomy:sector', null);
select private.seed_q('lesson-7','numeric','Menghitung keliling',2,'Keliling lingkaran berjari-jari 21 cm adalah ... cm. (π = 22/7)',
  null,'{"value":132,"alt":[131.88]}',
  'K = 2 × 22/7 × 21 = 2 × 22 × 3 = 132 cm.', 'circle-r:21 cm', 'cm');
select private.seed_q('lesson-7','numeric','Mencari diameter',3,'Keliling lingkaran 31,4 cm. Berapa cm diameternya? (π = 3,14)',
  null,'{"value":10}',
  'K = π × d, jadi d = K ÷ π = 31,4 ÷ 3,14 = 10 cm.', null, 'cm');
select private.seed_q('lesson-7','true_false','Nilai pi',1,'Nilai π dapat dihitung dengan membagi keliling lingkaran dengan diameternya.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. π = K ÷ d.', null, null);
select private.seed_q('lesson-7','story','Jam dinding',2,'Sebuah jam dinding berdiameter 28 cm. Berapa cm panjang bingkai di tepi jam? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}',
  'Panjang bingkai = keliling = 22/7 × 28 = 22 × 4 = 88 cm.', 'clock:d = 28 cm', 'cm');

-- ===== TRAINING LEVEL 1 — Beginner Explorer =====
select private.seed_q('training-1','mcq','Benda berbentuk lingkaran',1,'Benda berikut yang BUKAN berbentuk lingkaran adalah ...',
  '["Roda","Jam dinding bundar","Pintu kelas","Tutup botol"]','{"index":2}',
  'Pintu kelas berbentuk persegi panjang (punya 4 sisi lurus dan 4 sudut). Benda lainnya berbentuk lingkaran.', null, null);
select private.seed_q('training-1','true_false','Karakteristik lingkaran',1,'Telur berbentuk lingkaran sempurna jika dilihat dari samping.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. Telur berbentuk oval (lonjong). Jarak tepi ke titik tengahnya tidak sama di semua arah, jadi bukan lingkaran.', null, null);
select private.seed_q('training-1','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Jari-jari","Diameter","Busur","Tali busur"]','{"index":1}',
  'Garis lurus yang melewati titik pusat dan menghubungkan dua titik pada lingkaran adalah diameter.', 'anatomy:diameter', null);
select private.seed_q('training-1','identify','Unsur lingkaran',1,'Bagian yang menyala pada gambar adalah ...',
  '["Busur","Tembereng","Juring","Diameter"]','{"index":0}',
  'Garis lengkung yang merupakan bagian dari keliling lingkaran disebut busur.', 'anatomy:arc', null);
select private.seed_q('training-1','identify','Unsur lingkaran',2,'Daerah yang menyala pada gambar adalah ...',
  '["Juring","Tembereng","Busur","Jari-jari"]','{"index":1}',
  'Daerah yang dibatasi tali busur dan busur disebut tembereng. Jika dibatasi dua jari-jari, namanya juring.', 'anatomy:segment', null);
select private.seed_q('training-1','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Diameter","Tali busur","Jari-jari","Busur"]','{"index":2}',
  'Garis dari titik pusat ke tepi lingkaran adalah jari-jari.', 'anatomy:radius', null);
select private.seed_q('training-1','numeric','Jari-jari dan diameter',1,'Jari-jari lingkaran 12 cm. Berapa cm diameternya?',
  null,'{"value":24}','d = 2 × r = 2 × 12 = 24 cm.', 'circle-r:12 cm', 'cm');
select private.seed_q('training-1','numeric','Jari-jari dan diameter',1,'Diameter lingkaran 50 cm. Berapa cm jari-jarinya?',
  null,'{"value":25}','r = d ÷ 2 = 50 ÷ 2 = 25 cm.', 'circle-d:50 cm', 'cm');
select private.seed_q('training-1','numeric','Jari-jari dan diameter',2,'Jari-jari sebuah roda mainan 7,5 cm. Berapa cm diameternya?',
  null,'{"value":15}','d = 2 × r = 2 × 7,5 = 15 cm.', 'wheel:r = 7,5 cm', 'cm');
select private.seed_q('training-1','match','Unsur lingkaran',2,'Pasangkan setiap istilah dengan pengertiannya.',
  '{"left":["Titik pusat","Jari-jari","Diameter"],"right":["Garis dari pusat ke tepi lingkaran","Titik tepat di tengah lingkaran","Tali busur terpanjang yang melalui pusat"]}',
  '{"pairs":[1,0,2]}',
  'Titik pusat = titik di tengah. Jari-jari = garis pusat ke tepi. Diameter = tali busur terpanjang yang melewati pusat.', null, null);
select private.seed_q('training-1','true_false','Unsur lingkaran',2,'Diameter adalah tali busur yang paling panjang.',
  '["Benar","Salah"]','{"index":0}',
  'Benar. Dari semua tali busur, yang melewati titik pusat (diameter) adalah yang terpanjang.', 'anatomy:diameter', null);
select private.seed_q('training-1','mcq','Unsur lingkaran',1,'Garis lurus yang menghubungkan dua titik pada lingkaran tanpa melalui pusat disebut ...',
  '["Jari-jari","Tali busur","Busur","Juring"]','{"index":1}',
  'Itulah tali busur. Busur berbentuk lengkung, sedangkan tali busur berbentuk lurus.', 'anatomy:chord', null);
select private.seed_q('training-1','fill_formula','Jari-jari dan diameter',1,'Lengkapi rumus: d = ___ × r',
  '["1","2","3","π"]','{"index":1}','d = 2 × r. Diameter sama dengan dua jari-jari.', null, null);
select private.seed_q('training-1','fill_formula','Jari-jari dan diameter',1,'Lengkapi rumus: r = d ÷ ___',
  '["2","π","4","r"]','{"index":0}','r = d ÷ 2. Jari-jari adalah setengah diameter.', null, null);

-- ===== TRAINING LEVEL 2 — Space Navigator =====
select private.seed_q('training-2','mcq','Nilai pi',1,'π adalah hasil bagi ...',
  '["K ÷ d","K ÷ r","d ÷ r","r ÷ d"]','{"index":0}','π = keliling ÷ diameter = K ÷ d.', null, null);
select private.seed_q('training-2','true_false','Nilai pi',2,'Nilai π tepat sama dengan 3,14.',
  '["Benar","Salah"]','{"index":1}',
  'Salah. π = 3,14159265... angka desimalnya tidak pernah berakhir. 3,14 dan 22/7 hanyalah nilai pendekatan.', null, null);
select private.seed_q('training-2','numeric','Menghitung keliling',1,'Diameter lingkaran 10 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":31.4,"alt":[31.43]}','K = π × d = 3,14 × 10 = 31,4 cm.', 'circle-d:10 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',1,'Jari-jari lingkaran 7 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":44,"alt":[43.96]}','K = 2 × π × r = 2 × 22/7 × 7 = 2 × 22 = 44 cm.', 'circle-r:7 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',2,'Diameter lingkaran 28 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}','K = π × d = 22/7 × 28 = 22 × 4 = 88 cm.', 'circle-d:28 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',1,'Jari-jari lingkaran 5 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":31.4,"alt":[31.43]}','K = 2 × 3,14 × 5 = 31,4 cm.', 'circle-r:5 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',2,'Jari-jari lingkaran 20 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":125.6,"alt":[125.71]}','K = 2 × 3,14 × 20 = 125,6 cm.', 'circle-r:20 cm', 'cm');
select private.seed_q('training-2','numeric','Menghitung keliling',2,'Diameter lingkaran 35 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":110,"alt":[109.9]}','K = 22/7 × 35 = 22 × 5 = 110 cm.', 'circle-d:35 cm', 'cm');
select private.seed_q('training-2','fill_formula','Hubungan dua rumus',2,'K = 2 × π × r dapat juga ditulis K = π × ___ karena 2 × r = d.',
  '["r","d","2d","r²"]','{"index":1}','Karena 2 × r = d, maka 2 × π × r = π × d.', null, null);
select private.seed_q('training-2','mcq','Memilih nilai pi',2,'Jika r = 49 cm, nilai π yang paling mudah digunakan adalah ...',
  '["3,14","22/7","2,14","7/22"]','{"index":1}','49 = 7 × 7, kelipatan 7. Dengan 22/7, angka 7 bisa langsung dicoret.', null, null);
select private.seed_q('training-2','mcq','Konsep keliling',2,'Keliling lingkaran berdiameter 1 m kira-kira ...',
  '["1 m","2 m","3,14 m","6,28 m"]','{"index":2}','K = π × 1 = 3,14 m. Keliling ≈ 3,14 kali diameternya.', null, null);
select private.seed_q('training-2','numeric','Mencari diameter',3,'Keliling lingkaran 44 cm. Berapa cm diameternya? (π = 22/7)',
  null,'{"value":14}','d = K ÷ π = 44 ÷ 22/7 = 44 × 7/22 = 14 cm.', null, 'cm');
select private.seed_q('training-2','numeric','Mencari jari-jari',3,'Keliling lingkaran 62,8 cm. Berapa cm jari-jarinya? (π = 3,14)',
  null,'{"value":10}','r = K ÷ (2 × π) = 62,8 ÷ 6,28 = 10 cm.', null, 'cm');
select private.seed_q('training-2','mcq','Rumus keliling',1,'Rumus keliling lingkaran jika diketahui jari-jari adalah ...',
  '["K = π × r","K = 2 × π × r","K = π × r × r","K = 2 × r"]','{"index":1}','K = 2 × π × r. Rumus π × r × r adalah rumus luas, bukan keliling.', null, null);

-- ===== TRAINING LEVEL 3 — Galaxy Expert =====
select private.seed_q('training-3','story','Roda',2,'Roda sepeda motor berdiameter 56 cm. Berapa cm jarak yang ditempuh dalam satu putaran? (π = 22/7)',
  null,'{"value":176,"alt":[175.84]}','Jarak 1 putaran = keliling = 22/7 × 56 = 22 × 8 = 176 cm.', 'wheel:d = 56 cm', 'cm');
select private.seed_q('training-3','story','Jarak tempuh roda',3,'Roda berjari-jari 21 cm berputar 50 kali. Berapa METER jarak yang ditempuh? (π = 22/7)',
  null,'{"value":66,"alt":[65.94]}',
  'Keliling = 2 × 22/7 × 21 = 132 cm. Jarak = 50 × 132 = 6.600 cm. Ubah ke meter: 6.600 ÷ 100 = 66 m.', 'wheel:r = 21 cm', 'm');
select private.seed_q('training-3','story','Taman',3,'Kolam berbentuk lingkaran berjari-jari 7 m. Di tepinya akan ditanam pohon setiap 2 m. Berapa banyak pohon yang dibutuhkan? (π = 22/7)',
  null,'{"value":22}',
  'Keliling = 2 × 22/7 × 7 = 44 m. Karena tepi kolam melingkar (tertutup), banyak pohon = 44 ÷ 2 = 22 pohon.', 'garden:r = 7 m', 'pohon');
select private.seed_q('training-3','story','Biaya pagar',3,'Pagar taman berbentuk lingkaran berdiameter 14 m. Biaya pagar Rp50.000 per meter. Berapa rupiah biaya seluruhnya? (π = 22/7)',
  null,'{"value":2200000,"tolerance":1,"alt":[2198000]}',
  'Keliling = 22/7 × 14 = 44 m. Biaya = 44 × Rp50.000 = Rp2.200.000.', 'garden:d = 14 m', 'rupiah');
select private.seed_q('training-3','story','Jarak tempuh roda',2,'Sebuah roda menempuh jarak 440 cm dalam 5 putaran. Berapa cm keliling roda tersebut?',
  null,'{"value":88}','Keliling = jarak ÷ banyak putaran = 440 ÷ 5 = 88 cm.', 'wheel:5 putaran', 'cm');
select private.seed_q('training-3','story','Mencari jari-jari',3,'Sebuah roda menempuh 1.320 cm setelah berputar 10 kali. Berapa cm jari-jari roda? (π = 22/7)',
  null,'{"value":21}',
  'Keliling = 1.320 ÷ 10 = 132 cm. r = K ÷ (2 × π) = 132 ÷ (2 × 22/7) = 132 × 7/44 = 21 cm.', 'wheel:10 putaran', 'cm');
select private.seed_q('training-3','story','Lintasan lari',2,'Seorang atlet berlari mengelilingi lintasan berdiameter 70 m sebanyak 3 kali. Berapa meter jarak yang ditempuh? (π = 22/7)',
  null,'{"value":660,"alt":[659.4]}','Keliling = 22/7 × 70 = 220 m. Jarak = 3 × 220 = 660 m.', 'track:d = 70 m', 'm');
select private.seed_q('training-3','story','Pita',3,'Pita akan dililitkan satu kali mengelilingi kaleng berdiameter 7 cm, ditambah 3 cm untuk sambungan. Berapa cm panjang pita? (π = 22/7)',
  null,'{"value":25,"alt":[24.98]}','Keliling kaleng = 22/7 × 7 = 22 cm. Panjang pita = 22 + 3 = 25 cm.', 'ribbon:d = 7 cm', 'cm');
select private.seed_q('training-3','mcq','Membandingkan keliling',3,'Roda A berjari-jari 14 cm, roda B berdiameter 14 cm. Pernyataan yang benar adalah ...',
  '["Keliling A dua kali keliling B","Keliling A sama dengan keliling B","Keliling B dua kali keliling A","Keliling A empat kali keliling B"]','{"index":0}',
  'Keliling A = 2 × 22/7 × 14 = 88 cm. Keliling B = 22/7 × 14 = 44 cm. Jadi keliling A dua kali keliling B. Perhatikan beda jari-jari dan diameter!', null, null);
select private.seed_q('training-3','story','Meja bundar',3,'Tepi meja bundar berjari-jari 35 cm akan dihias renda. Berapa METER renda yang dibutuhkan? (π = 22/7)',
  null,'{"value":2.2,"tolerance":0.01}','Keliling = 2 × 22/7 × 35 = 220 cm. Ubah ke meter: 220 ÷ 100 = 2,2 m.', 'table:r = 35 cm', 'm');
select private.seed_q('training-3','story','Jarak tempuh roda',2,'Keliling ban sepeda 1,76 m. Berapa kali ban harus berputar untuk menempuh 176 m?',
  null,'{"value":100}','Banyak putaran = jarak ÷ keliling = 176 ÷ 1,76 = 100 kali.', 'wheel:K = 1,76 m', 'kali');
select private.seed_q('training-3','story','Jarum jam',3,'Jarum panjang sebuah jam dinding panjangnya 14 cm. Berapa cm lintasan ujung jarum panjang dalam 1 jam? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}',
  'Dalam 1 jam, jarum panjang berputar 1 kali penuh. Ujungnya membentuk lingkaran dengan r = 14 cm. K = 2 × 22/7 × 14 = 88 cm.', 'clock:r = 14 cm', 'cm');

-- ===== FINAL EXAMINATION (bank 30 soal, diambil acak) =====
select private.seed_q('exam','mcq','Pengertian lingkaran',1,'Pernyataan yang benar tentang lingkaran adalah ...',
  '["Lingkaran memiliki 4 titik sudut","Semua titik pada lingkaran berjarak sama ke titik pusat","Lingkaran tersusun dari garis-garis lurus","Jari-jari selalu lebih panjang dari diameter"]','{"index":1}',
  'Ciri utama lingkaran: semua titik pada lingkaran berjarak sama (jari-jari) ke titik pusat.', null, null);
select private.seed_q('exam','true_false','Benda berbentuk lingkaran',1,'Permukaan uang koin berbentuk lingkaran.',
  '["Benar","Salah"]','{"index":0}','Benar. Uang koin adalah contoh benda berbentuk lingkaran.', null, null);
select private.seed_q('exam','identify','Unsur lingkaran',1,'Bagian yang menyala pada gambar adalah ...',
  '["Titik pusat","Busur","Juring","Tembereng"]','{"index":0}','Titik di tengah lingkaran adalah titik pusat.', 'anatomy:center', null);
select private.seed_q('exam','identify','Unsur lingkaran',1,'Garis yang menyala pada gambar adalah ...',
  '["Jari-jari","Tali busur","Diameter","Busur"]','{"index":1}','Garis lurus yang menghubungkan dua titik pada lingkaran tanpa melewati pusat adalah tali busur.', 'anatomy:chord', null);
select private.seed_q('exam','identify','Unsur lingkaran',2,'Daerah yang menyala pada gambar adalah ...',
  '["Juring","Tembereng","Busur","Diameter"]','{"index":0}','Daerah antara dua jari-jari dan busur disebut juring.', 'anatomy:sector', null);
select private.seed_q('exam','identify','Unsur lingkaran',2,'Daerah yang menyala pada gambar adalah ...',
  '["Busur","Juring","Tembereng","Tali busur"]','{"index":2}','Daerah antara tali busur dan busur disebut tembereng.', 'anatomy:segment', null);
select private.seed_q('exam','match','Unsur lingkaran',2,'Pasangkan setiap istilah dengan pengertiannya.',
  '{"left":["Busur","Tali busur","Juring"],"right":["Daerah antara dua jari-jari dan busur","Garis lengkung bagian dari keliling","Garis lurus penghubung dua titik pada lingkaran"]}',
  '{"pairs":[1,2,0]}','Busur = garis lengkung. Tali busur = garis lurus penghubung dua titik pada lingkaran. Juring = daerah antara dua jari-jari dan busur.', null, null);
select private.seed_q('exam','numeric','Jari-jari dan diameter',1,'Jari-jari lingkaran 16 cm. Berapa cm diameternya?',
  null,'{"value":32}','d = 2 × r = 2 × 16 = 32 cm.', 'circle-r:16 cm', 'cm');
select private.seed_q('exam','numeric','Jari-jari dan diameter',1,'Diameter lingkaran 45 cm. Berapa cm jari-jarinya?',
  null,'{"value":22.5}','r = d ÷ 2 = 45 ÷ 2 = 22,5 cm.', 'circle-d:45 cm', 'cm');
select private.seed_q('exam','mcq','Nilai pi',1,'Nilai π mendekati ...',
  '["2,72","3,14","1,41","1,73"]','{"index":1}','π ≈ 3,14 atau 22/7.', null, null);
select private.seed_q('exam','true_false','Nilai pi',1,'22/7 dan 3,14 adalah nilai pendekatan untuk π.',
  '["Benar","Salah"]','{"index":0}','Benar. π sebenarnya 3,14159... sehingga 22/7 dan 3,14 adalah pendekatannya.', null, null);
select private.seed_q('exam','mcq','Nilai pi',2,'Hasil pengukuran tutup toples: keliling 47,1 cm dan diameter 15 cm. Hasil K ÷ d adalah ...',
  '["3,14","2,14","4,71","1,5"]','{"index":0}','47,1 ÷ 15 = 3,14. Hasil bagi keliling dan diameter selalu mendekati π.', null, null);
select private.seed_q('exam','mcq','Konsep keliling',1,'Keliling lingkaran merupakan ...',
  '["daerah di dalam lingkaran","panjang garis lengkung yang membatasi lingkaran","jarak pusat ke tepi lingkaran","dua kali jari-jari"]','{"index":1}',
  'Keliling = panjang garis lengkung yang mengelilingi lingkaran. Dua kali jari-jari adalah diameter.', null, null);
select private.seed_q('exam','true_false','Satu putaran',2,'Roda yang berputar satu kali penuh menempuh jarak yang sama dengan diameternya.',
  '["Benar","Salah"]','{"index":1}','Salah. Jarak satu putaran sama dengan KELILING roda (sekitar 3,14 kali diameternya).', 'wheel:1 putaran', null);
select private.seed_q('exam','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = ___ × d',
  '["2","π","r","2π"]','{"index":1}','K = π × d.', null, null);
select private.seed_q('exam','fill_formula','Rumus keliling',1,'Lengkapi rumus: K = 2 × ___ × r',
  '["d","π","K","2"]','{"index":1}','K = 2 × π × r.', null, null);
select private.seed_q('exam','numeric','Menghitung keliling',2,'Diameter lingkaran 21 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":66,"alt":[65.94]}','K = 22/7 × 21 = 22 × 3 = 66 cm.', 'circle-d:21 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Jari-jari lingkaran 14 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":88,"alt":[87.92]}','K = 2 × 22/7 × 14 = 2 × 22 × 2 = 88 cm.', 'circle-r:14 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Diameter lingkaran 30 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":94.2,"alt":[94.29]}','K = 3,14 × 30 = 94,2 cm.', 'circle-d:30 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Jari-jari lingkaran 15 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":94.2,"alt":[94.29]}','K = 2 × 3,14 × 15 = 94,2 cm.', 'circle-r:15 cm', 'cm');
select private.seed_q('exam','numeric','Menghitung keliling',2,'Jari-jari lingkaran 3,5 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":22,"alt":[21.98]}','K = 2 × 22/7 × 3,5 = 22/7 × 7 = 22 cm.', 'circle-r:3,5 cm', 'cm');
select private.seed_q('exam','numeric','Mencari diameter',3,'Keliling lingkaran 154 cm. Berapa cm diameternya? (π = 22/7)',
  null,'{"value":49}','d = K ÷ π = 154 × 7/22 = 49 cm.', null, 'cm');
select private.seed_q('exam','numeric','Mencari jari-jari',3,'Keliling lingkaran 125,6 cm. Berapa cm jari-jarinya? (π = 3,14)',
  null,'{"value":20}','r = K ÷ (2 × π) = 125,6 ÷ 6,28 = 20 cm.', null, 'cm');
select private.seed_q('exam','story','Roda sepeda',2,'Roda sepeda berjari-jari 28 cm. Berapa cm jarak yang ditempuh dalam satu putaran? (π = 22/7)',
  null,'{"value":176,"alt":[175.84]}','Jarak 1 putaran = 2 × 22/7 × 28 = 176 cm.', 'wheel:r = 28 cm', 'cm');
select private.seed_q('exam','story','Pagar taman',2,'Taman berbentuk lingkaran berdiameter 42 m akan dipagari. Berapa meter panjang pagar? (π = 22/7)',
  null,'{"value":132,"alt":[131.88]}','Panjang pagar = 22/7 × 42 = 22 × 6 = 132 m.', 'garden:d = 42 m', 'm');
select private.seed_q('exam','story','Pita',2,'Pita akan dililitkan mengelilingi kue tart berdiameter 20 cm. Berapa cm panjang pita minimal? (π = 3,14)',
  null,'{"value":62.8,"alt":[62.86]}','Panjang pita = keliling = 3,14 × 20 = 62,8 cm.', 'ribbon:d = 20 cm', 'cm');
select private.seed_q('exam','story','Jarak tempuh roda',3,'Roda berdiameter 70 cm berputar 100 kali. Berapa METER jarak yang ditempuh? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}','Keliling = 22/7 × 70 = 220 cm. Jarak = 100 × 220 = 22.000 cm = 220 m.', 'wheel:d = 70 cm', 'm');
select private.seed_q('exam','story','Lintasan',3,'Lintasan berbentuk lingkaran berdiameter 100 m. Berapa meter jarak 2 putaran? (π = 3,14)',
  null,'{"value":628,"alt":[628.57]}','Keliling = 3,14 × 100 = 314 m. Dua putaran = 628 m.', 'track:d = 100 m', 'm');
select private.seed_q('exam','story','Mencari diameter roda',3,'Sebuah roda menempuh 2.200 cm dalam 25 putaran. Berapa cm diameter roda? (π = 22/7)',
  null,'{"value":28}','Keliling = 2.200 ÷ 25 = 88 cm. d = 88 ÷ 22/7 = 88 × 7/22 = 28 cm.', 'wheel:25 putaran', 'cm');
select private.seed_q('exam','mcq','Membandingkan keliling',3,'Roda P berjari-jari 7 cm dan roda Q berjari-jari 14 cm. Keliling roda Q adalah ...',
  '["sama dengan keliling P","dua kali keliling P","empat kali keliling P","setengah keliling P"]','{"index":1}',
  'Keliling P = 44 cm, keliling Q = 88 cm. Jari-jari dua kali lipat → keliling juga dua kali lipat.', null, null);

-- ===== TANTANGAN HARIAN =====
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 35 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}','K = 2 × 22/7 × 35 = 220 cm.', 'circle-r:35 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',1,'Diameter lingkaran 8 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":25.12,"alt":[25.14]}','K = 3,14 × 8 = 25,12 cm.', 'circle-d:8 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 42 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":264,"alt":[263.76]}','K = 2 × 22/7 × 42 = 264 cm.', 'circle-r:42 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Diameter lingkaran 63 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":198,"alt":[197.82]}','K = 22/7 × 63 = 22 × 9 = 198 cm.', 'circle-d:63 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 25 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":157,"alt":[157.14]}','K = 2 × 3,14 × 25 = 157 cm.', 'circle-r:25 cm', 'cm');
select private.seed_q('daily','numeric','Mencari jari-jari',3,'Keliling lingkaran 88 cm. Berapa cm jari-jarinya? (π = 22/7)',
  null,'{"value":14}','r = K ÷ (2 × π) = 88 ÷ 44/7 = 88 × 7/44 = 14 cm.', null, 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',1,'Diameter lingkaran 12 cm. Berapa cm kelilingnya? (π = 3,14)',
  null,'{"value":37.68,"alt":[37.71]}','K = 3,14 × 12 = 37,68 cm.', 'circle-d:12 cm', 'cm');
select private.seed_q('daily','numeric','Menghitung keliling',2,'Jari-jari lingkaran 10,5 cm. Berapa cm kelilingnya? (π = 22/7)',
  null,'{"value":66,"alt":[65.94]}','K = 2 × 22/7 × 10,5 = 22/7 × 21 = 66 cm.', 'circle-r:10,5 cm', 'cm');
select private.seed_q('daily','story','Jarak tempuh roda',3,'Roda berjari-jari 7 cm berputar 5 kali. Berapa cm jarak yang ditempuh? (π = 22/7)',
  null,'{"value":220,"alt":[219.8]}','Keliling = 2 × 22/7 × 7 = 44 cm. Jarak = 5 × 44 = 220 cm.', 'wheel:r = 7 cm', 'cm');
select private.seed_q('daily','numeric','Mencari diameter',3,'Keliling lingkaran 94,2 cm. Berapa cm diameternya? (π = 3,14)',
  null,'{"value":30}','d = K ÷ π = 94,2 ÷ 3,14 = 30 cm.', null, 'cm');

drop function private.seed_q(text, text, text, int, text, jsonb, jsonb, text, text, text);
