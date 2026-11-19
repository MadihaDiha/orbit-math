import { test } from "node:test";
import assert from "node:assert/strict";
import { buildJourney, journeyPercent, missionStates, nextStep, EMPTY_JOURNEY } from "../src/lib/progress";
import type { LessonProgressRow } from "../src/lib/types";

const done = (id: number): LessonProgressRow => ({ lesson_id: id, status: "completed", best_quiz_score: 100, stars: 3, completed_at: "2026-11-19T00:00:00Z" });
const pre = { score: 40, correct_count: 4, total: 10, created_at: "2026-11-19T01:00:00Z" };

test("Planet 1 terkunci sebelum pre-test", () => {
  assert.equal(missionStates([], EMPTY_JOURNEY)[1], "locked");
  assert.equal(missionStates([], { pretest: pre })[1], "available");
  assert.equal(missionStates([], { pretest: pre })[2], "locked");
});

test("Urutan langkah: pre-test → misi → post-test → hasil", () => {
  assert.deepEqual(nextStep([], EMPTY_JOURNEY), { step: "pretest" });
  assert.deepEqual(nextStep([], { ...EMPTY_JOURNEY, pretest: pre }), { step: "mission", missionId: 1 });
  assert.deepEqual(nextStep([done(1), done(2)], { ...EMPTY_JOURNEY, pretest: pre }), { step: "mission", missionId: 3 });
  const all = [1, 2, 3, 4, 5, 6, 7].map(done);
  assert.deepEqual(nextStep(all, { ...EMPTY_JOURNEY, pretest: pre }), { step: "posttest" });
  const post = { score: 90, correct_count: 9, total: 10, created_at: "2026-11-19T05:00:00Z" };
  assert.deepEqual(nextStep(all, { pretest: pre, posttest: post, posttestBest: post }), { step: "results" });
  assert.equal(journeyPercent(all, { pretest: pre, posttest: post, posttestBest: post }), 100);
  assert.equal(journeyPercent([], EMPTY_JOURNEY), 0);
});

test("buildJourney: pre-test pertama, post-test terbaru & terbaik", () => {
  const j = buildJourney([
    { kind: "posttest", score: 70, correct_count: 7, total: 10, created_at: "2026-11-19T03:00:00Z" },
    { kind: "pretest", score: 40, correct_count: 4, total: 10, created_at: "2026-11-19T01:00:00Z" },
    { kind: "posttest", score: 90, correct_count: 9, total: 10, created_at: "2026-11-19T02:00:00Z" },
  ]);
  assert.equal(j.pretest?.score, 40);
  assert.equal(j.posttest?.score, 70); // terbaru
  assert.equal(j.posttestBest?.score, 90); // terbaik
});
