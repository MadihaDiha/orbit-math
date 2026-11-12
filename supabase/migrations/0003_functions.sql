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
