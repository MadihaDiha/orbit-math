import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GAMES, PI_CASES, hunterRound, orbitProblem, rescueChallenge, scoreHunterRound, scoreOrbit, scorePiCase } from "../src/lib/games";
import { OBJECT_INFO } from "../src/lib/objects";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

test("Circle Hunter: 4 lingkaran + 4 bukan, skor benar", () => {
  const objs = hunterRound(seeded(1));
  assert.equal(objs.length, 8);
  const circles = objs.filter((o) => OBJECT_INFO[o].circle);
  assert.equal(circles.length, 4);
  const perfect = scoreHunterRound(objs, new Set(circles), (o) => OBJECT_INFO[o].circle);
  assert.deepEqual(perfect, { score: 40, correct: 4 });
  const all = scoreHunterRound(objs, new Set(objs), (o) => OBJECT_INFO[o].circle);
  assert.equal(all.score, 20); // 40 - 4×5
});

test("Orbit Calculation: jawaban generator konsisten secara matematis", () => {
  const rand = seeded(7);
  for (let i = 0; i < 200; i++) {
    const stage = ((i % 3) + 1) as 1 | 2 | 3;
    const p = orbitProblem(stage, rand);
    assert.ok(Number.isFinite(p.answer) && p.answer > 0);
    const nums = p.prompt.match(/[\d.,]+(?= km)/)![0];
    const n = Number(nums.replace(/\./g, "").replace(",", "."));
    const pi = p.prompt.includes("22/7") ? 22 / 7 : 3.14;
    const expected = stage === 1 ? pi * n : stage === 2 ? 2 * pi * n : n / pi;
    assert.ok(Math.abs(expected - p.answer) < 0.06, `${p.prompt} → ${p.answer}`);
  }
});

test("Orbit Calculation: penilaian", () => {
  assert.equal(scoreOrbit(44, 44, 10).points, 20);
  assert.equal(scoreOrbit(44, 44, 45).points, 15);
  assert.equal(scoreOrbit(43.96, 44, 45).exact, true);
  assert.equal(scoreOrbit(43.7, 44, 45).points, 8);
  assert.equal(scoreOrbit(40, 44, 5).points, 0);
});

test("BIMO Space Rescue: jawaban selalu ada di 3 pilihan unik", () => {
  const rand = seeded(3);
  for (let i = 0; i < 300; i++) {
    const c = rescueChallenge(rand);
    assert.equal(c.options.length, 3);
    assert.equal(new Set(c.options).size, 3);
    assert.ok(c.options.includes(c.answer));
  }
});

test("Pi Detective: skor kasus", () => {
  assert.equal(PI_CASES.length, 6);
  assert.equal(scorePiCase(1, true), 30);
  assert.equal(scorePiCase(3, true), 10);
  assert.equal(scorePiCase(1, false), 0);
  for (const c of PI_CASES) assert.ok(c.answer >= 0 && c.answer < c.options.length);
});

test("skor maksimal game sama dengan seed database", () => {
  const seed = readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");
  for (const g of GAMES) {
    assert.match(seed, new RegExp(`'${g.slug}',\\s+'[^']+',\\s+'[^']+',\\s+${g.maxScore}, ${g.passScore},`), g.slug);
  }
});
