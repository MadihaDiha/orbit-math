// Menghasilkan src/content/questionBank.ts dari supabase/seed.sql
// agar Mode Demo memakai bank soal yang SAMA dengan database.
// Jalankan: npm run gen:bank
import { readFileSync, writeFileSync } from "node:fs";

const sql = readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8");

/** Tokenizer nilai SQL sederhana: 'string' (escape ''), angka, null, true/false. */
function parseValues(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "'") {
      let s = "";
      i++;
      while (i < src.length) {
        if (src[i] === "'" && src[i + 1] === "'") { s += "'"; i += 2; continue; }
        if (src[i] === "'") { i++; break; }
        s += src[i++];
      }
      out.push(s);
    } else if (/[0-9-]/.test(ch)) {
      const m = /^-?\d+(\.\d+)?/.exec(src.slice(i));
      out.push(Number(m[0]));
      i += m[0].length;
    } else if (/[a-z]/i.test(ch)) {
      const m = /^[a-z_]+/i.exec(src.slice(i))[0];
      out.push(m === "null" ? null : m === "true" ? true : m === "false" ? false : m);
      i += m.length;
    } else i++;
  }
  return out;
}

/** Memecah isi "(...), (...)" menjadi tuple, menghormati string. */
function tuples(block) {
  const res = [];
  let depth = 0, inStr = false, start = -1;
  for (let i = 0; i < block.length; i++) {
    const c = block[i];
    if (inStr) { if (c === "'" && block[i + 1] === "'") { i++; continue; } if (c === "'") inStr = false; continue; }
    if (c === "'") { inStr = true; continue; }
    if (c === "(") { if (depth === 0) start = i + 1; depth++; }
    else if (c === ")") { depth--; if (depth === 0) res.push(parseValues(block.slice(start, i))); }
  }
  return res;
}

function insertBlock(table) {
  const startIdx = sql.indexOf(`insert into public.${table} (`);
  const valuesIdx = sql.indexOf("values", startIdx);
  const endIdx = sql.indexOf("on conflict", valuesIdx);
  return tuples(sql.slice(valuesIdx + 6, endIdx));
}

const lessons = insertBlock("lessons").map(([id, slug, title, planet_name, xp_reward]) => ({ id, slug, title, planet_name, xp_reward }));
const quizzes = insertBlock("quizzes").map(([slug, title, kind, lesson_id, level, pass_score, xp_reward, default_count, shuffle]) => ({ slug, title, kind, lesson_id, level, pass_score, xp_reward, default_count, shuffle }));
const games = insertBlock("games").map(([id, slug, title, description, max_score, pass_score, xp_reward]) => ({ id, slug, title, description, max_score, pass_score, xp_reward }));
const achievements = insertBlock("achievements").map(([slug, title, description, icon, xp_reward, sort_order]) => ({ slug, title, description, icon, xp_reward, sort_order }));

const questions = [];
const re = /select private\.seed_q\(([\s\S]*?)\);\s*$/gm;
let m;
const order = {};
while ((m = re.exec(sql))) {
  const [quiz, qtype, topic, difficulty, prompt, options, answer, explanation, illustration, unit] = parseValues(m[1]);
  order[quiz] = (order[quiz] ?? 0) + 1;
  questions.push({
    id: questions.length + 1,
    quiz,
    qtype,
    topic,
    difficulty,
    prompt,
    options: options === null ? null : JSON.parse(options),
    answer: JSON.parse(answer),
    explanation,
    illustration,
    unit,
    sort_order: order[quiz],
  });
}

if (questions.length < 50) throw new Error(`Parsing gagal: hanya ${questions.length} soal`);

const header = "// FILE INI DIHASILKAN OTOMATIS oleh scripts/gen-question-bank.mjs dari supabase/seed.sql.\n// Jangan diedit manual â€” ubah seed.sql lalu jalankan `npm run gen:bank`.\n";
const body = `import type { BankAchievement, BankGame, BankLesson, BankQuestion, BankQuiz } from "./bank-types";

export const BANK_LESSONS: BankLesson[] = ${JSON.stringify(lessons, null, 2)};

export const BANK_QUIZZES: BankQuiz[] = ${JSON.stringify(quizzes, null, 2)};

export const BANK_GAMES: BankGame[] = ${JSON.stringify(games, null, 2)};

export const BANK_ACHIEVEMENTS: BankAchievement[] = ${JSON.stringify(achievements, null, 2)};

export const BANK_QUESTIONS: BankQuestion[] = ${JSON.stringify(questions, null, 2)};
`;
writeFileSync(new URL("../src/content/questionBank.ts", import.meta.url), header + body);
console.log(`OK: ${lessons.length} misi, ${quizzes.length} kuis, ${games.length} game, ${achievements.length} lencana, ${questions.length} soal`);
