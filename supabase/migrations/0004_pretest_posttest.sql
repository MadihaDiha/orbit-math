-- =====================================================================
-- ORBIT MATH — 0004_pretest_posttest.sql
-- Alur Galaxy Adventure: Pre-test (wajib sebelum materi) → 6 planet →
-- Stasiun Final → Post-test → Hasil akhir. Jalankan setelah 0003.
-- =====================================================================

-- Jenis kuis baru
alter table public.quizzes drop constraint if exists quizzes_kind_check;
alter table public.quizzes add constraint quizzes_kind_check
  check (kind in ('lesson','training','exam','daily','pretest','posttest'));

-- ---------------------------------------------------------------------
-- Penguncian: Planet 1 baru terbuka setelah Pre-test dikerjakan.
-- ---------------------------------------------------------------------
create or replace function private.has_quiz_kind(p_uid uuid, p_kind text)
returns boolean language sql stable set search_path = '' as $$
  select exists (
    select 1 from public.quiz_attempts qa join public.quizzes q on q.id = qa.quiz_id
    where qa.user_id = p_uid and q.kind = p_kind);
$$;

create or replace function private.is_lesson_unlocked(p_uid uuid, p_lesson smallint)
returns boolean language sql stable set search_path = '' as $$
  select case
    when p_lesson <= 1 then private.has_quiz_kind(p_uid, 'pretest')
    else exists (
      select 1 from public.lesson_progress
      where user_id = p_uid and lesson_id = p_lesson - 1 and status = 'completed')
  end;
$$;

-- ---------------------------------------------------------------------
-- start_quiz: pre-test hanya sekali; post-test setelah Stasiun Final (Misi 7) selesai.
-- ---------------------------------------------------------------------
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
  if v_quiz.kind = 'pretest' and private.has_quiz_kind(v_uid, 'pretest') then
    raise exception 'pretest_done';
  end if;
  if v_quiz.kind = 'posttest' and not exists (
       select 1 from public.lesson_progress where user_id = v_uid and lesson_id = 7 and status = 'completed') then
    raise exception 'posttest_locked';
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

-- Umpan balik langsung: Training Zone, Pre-test, dan Post-test.
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
  if v_kind not in ('training', 'pretest', 'posttest') then raise exception 'feedback_not_allowed'; end if;
  if not (p_question_id = any (v_s.question_ids)) then raise exception 'question_not_in_session'; end if;
  select * into v_q from public.quiz_questions where id = p_question_id;
  return jsonb_build_object(
    'is_correct', private.grade_answer(v_q.answer, p_given),
    'correct_answer', v_q.answer,
    'explanation', v_q.explanation);
end;
$$;

-- ---------------------------------------------------------------------
-- submit_quiz: XP pre-test / post-test.
-- ---------------------------------------------------------------------
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
  if v_quiz.kind = 'pretest' and private.has_quiz_kind(v_uid, 'pretest') then raise exception 'pretest_done'; end if;

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
  elsif v_quiz.kind = 'pretest' then
    v_xp := v_xp + private.award_xp(v_uid, 'pretest-done', 20, 'exam');
  elsif v_quiz.kind = 'posttest' then
    v_xp := v_xp + private.award_xp(v_uid, 'posttest-done', 50, 'exam');
    if v_passed then
      v_xp := v_xp + private.award_xp(v_uid, 'posttest-pass', v_quiz.xp_reward, 'exam');
    end if;
  elsif v_passed and v_quiz.kind = 'training' then
    v_xp := v_xp + private.award_xp(v_uid, 'quiz-pass:' || v_quiz.slug, v_quiz.xp_reward, 'training');
  elsif v_passed and v_quiz.kind = 'exam' then
    v_xp := v_xp + private.award_xp(v_uid, 'exam-pass', v_quiz.xp_reward, 'exam');
    if v_score = 100 then
      v_xp := v_xp + private.award_xp(v_uid, 'exam-perfect', 100, 'exam');
    end if;
  end if;

  v_type := case v_quiz.kind when 'lesson' then 'lesson' when 'training' then 'training' else 'exam' end;
  perform private.log_activity(v_uid, v_type, v_quiz.title,
    case when v_quiz.kind = 'pretest' then 'selesai' when v_passed then 'lulus' else 'belum lulus' end, v_score, v_xp);
  perform private.touch_activity(v_uid);
  v_new := private.check_achievements(v_uid);

  return jsonb_build_object(
    'score', v_score, 'correct', v_correct, 'total', v_total,
    'passed', v_passed, 'pass_score', v_quiz.pass_score,
    'xp_earned', v_xp, 'review', v_review, 'new_achievements', v_new);
end;
$$;

-- ---------------------------------------------------------------------
-- Lencana baru: Pre-Flight Check & Astronot Muda
-- ---------------------------------------------------------------------
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
      when 'pre-flight' then private.has_quiz_kind(p_uid, 'pretest')
      when 'young-astronaut' then private.has_quiz_kind(p_uid, 'posttest')
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

revoke all on function public.start_quiz(text, int, int) from public, anon;
revoke all on function public.check_answer(uuid, bigint, jsonb) from public, anon;
revoke all on function public.submit_quiz(uuid, jsonb) from public, anon;
grant execute on function public.start_quiz(text, int, int) to authenticated;
grant execute on function public.check_answer(uuid, bigint, jsonb) to authenticated;
grant execute on function public.submit_quiz(uuid, jsonb) to authenticated;
