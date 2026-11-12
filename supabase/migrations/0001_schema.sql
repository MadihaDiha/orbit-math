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
