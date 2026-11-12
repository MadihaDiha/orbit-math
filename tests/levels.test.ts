import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEVELS, levelForXp, levelProgress } from "../src/lib/levels";

test("level berdasarkan akumulasi XP", () => {
  assert.equal(levelForXp(0).level, 1);
  assert.equal(levelForXp(149).level, 1);
  assert.equal(levelForXp(150).level, 2);
  assert.equal(levelForXp(799).level, 3);
  assert.equal(levelForXp(2200).level, 6);
  assert.equal(levelForXp(99999).level, 6);
});

test("progres level", () => {
  const p = levelProgress(275);
  assert.equal(p.current.level, 2);
  assert.equal(p.next?.level, 3);
  assert.equal(p.percent, 50);
  assert.equal(p.xpNeeded, 125);
  assert.equal(levelProgress(5000).percent, 100);
});

test("ambang level frontend sama dengan fungsi SQL", () => {
  const sql = readFileSync(new URL("../supabase/migrations/0003_functions.sql", import.meta.url), "utf8");
  const block = sql.slice(sql.indexOf("private.level_for_xp"), sql.indexOf("private.grade_answer"));
  for (const l of LEVELS.slice(1)) {
    assert.match(block, new RegExp(`p_xp >= ${l.minXp}\\s+then ${l.level}`), `level ${l.level} harus ${l.minXp} XP`);
  }
});
