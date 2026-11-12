import { test } from "node:test";
import assert from "node:assert/strict";
import { BANK_GAMES, BANK_LESSONS, BANK_QUESTIONS, BANK_QUIZZES } from "../src/content/questionBank";
import { gradeAnswer, jakartaToday } from "../src/lib/demo/backend";
import { GAMES } from "../src/lib/games";
import { MISSIONS } from "../src/content/missions";

test("bank soal hasil generate lengkap", () => {
  assert.equal(BANK_LESSONS.length, 7);
  assert.equal(BANK_QUESTIONS.filter((q) => q.quiz === "exam").length, 30);
  for (const quiz of BANK_QUIZZES) {
    const n = BANK_QUESTIONS.filter((q) => q.quiz === quiz.slug).length;
    assert.ok(n >= Math.min(quiz.default_count, 5), `${quiz.slug} punya ${n} soal`);
  }
  // slug misi di konten = slug di database
  assert.deepEqual(MISSIONS.map((m) => m.slug), BANK_LESSONS.map((l) => l.slug));
  assert.deepEqual(GAMES.map((g) => g.slug), BANK_GAMES.map((g) => g.slug));
});

test("setiap soal valid: kunci sesuai pilihan, ada pembahasan", () => {
  for (const q of BANK_QUESTIONS) {
    assert.ok(q.explanation.length > 5, `pembahasan ${q.id}`);
    const a = q.answer;
    if ("index" in a) {
      assert.ok(Array.isArray(q.options), `opsi ${q.id}`);
      assert.ok(a.index >= 0 && a.index < (q.options as string[]).length, `indeks ${q.id}`);
      assert.ok(gradeAnswer(a, { index: a.index }));
      assert.ok(!gradeAnswer(a, { index: a.index + 1 }));
    } else if ("pairs" in a) {
      const o = q.options as { left: string[]; right: string[] };
      assert.equal(a.pairs.length, o.left.length);
      assert.equal(new Set(a.pairs).size, o.right.length, `pasangan unik ${q.id}`);
      assert.ok(gradeAnswer(a, { pairs: [...a.pairs] }));
    } else {
      assert.ok(gradeAnswer(a, { value: a.value }), `angka ${q.id}`);
      for (const alt of a.alt ?? []) assert.ok(gradeAnswer(a, { value: alt }));
      const off = Math.max(1, (a.tolerance ?? 0.05) * 5);
      const wrong = a.value + off + Math.max(0, ...(a.alt ?? []).map((x) => Math.abs(x - a.value)));
      assert.ok(!gradeAnswer(a, { value: wrong }), `toleransi ${q.id}`);
    }
  }
});

test("penilaian menolak jawaban kosong/salah tipe", () => {
  assert.equal(gradeAnswer({ index: 1 }, null), false);
  assert.equal(gradeAnswer({ value: 44 }, { index: 44 }), false);
  assert.equal(gradeAnswer({ value: 44, alt: [43.96] }, { value: 43.96 }), true);
  assert.equal(gradeAnswer({ value: 2200000, tolerance: 1 }, { value: 2200000.5 }), true);
  assert.equal(gradeAnswer({ pairs: [1, 2, 0] }, { pairs: [1, 0, 2] }), false);
});

test("tanggal Jakarta berformat YYYY-MM-DD", () => {
  assert.match(jakartaToday(new Date("2026-11-12T20:00:00Z")), /^2026-11-13$/);
});
