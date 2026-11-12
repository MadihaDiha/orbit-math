"""Bank soal ORBIT MATH.

Membaca ``supabase/seed.sql`` (sumber kebenaran tunggal) lalu:

* menyediakan bank soal untuk aplikasi terminal (:mod:`orbit_math.cli`),
* menghasilkan ``src/content/questionBank.ts`` untuk Mode Demo aplikasi web,
* memvalidasi setiap soal (kunci jawaban, pilihan, pembahasan).

Pemakaian::

    python -m orbit_math.bank            # generate questionBank.ts
    python -m orbit_math.bank --check    # hanya validasi
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from .grading import grade_answer

ROOT = Path(__file__).resolve().parents[2]
SEED = ROOT / "supabase" / "seed.sql"
TS_OUT = ROOT / "src" / "content" / "questionBank.ts"


# --------------------------------------------------------------- tokenizer
def parse_values(src: str) -> list[Any]:
    """Tokenizer nilai SQL sederhana: 'string' (escape ''), angka, null, true/false."""
    out: list[Any] = []
    i, n = 0, len(src)
    while i < n:
        ch = src[i]
        if ch == "'":
            buf = []
            i += 1
            while i < n:
                if src[i] == "'" and i + 1 < n and src[i + 1] == "'":
                    buf.append("'")
                    i += 2
                    continue
                if src[i] == "'":
                    i += 1
                    break
                buf.append(src[i])
                i += 1
            out.append("".join(buf))
        elif ch.isdigit() or ch == "-":
            m = re.match(r"-?\d+(\.\d+)?", src[i:])
            if not m:
                i += 1
                continue
            text = m.group(0)
            out.append(float(text) if "." in text else int(text))
            i += len(text)
        elif ch.isalpha():
            word = re.match(r"[A-Za-z_]+", src[i:]).group(0)  # type: ignore[union-attr]
            out.append({"null": None, "true": True, "false": False}.get(word, word))
            i += len(word)
        else:
            i += 1
    return out


def split_tuples(block: str) -> list[list[Any]]:
    """Memecah isi ``(...), (...)`` menjadi tuple nilai, menghormati string."""
    tuples: list[list[Any]] = []
    depth, in_str, start = 0, False, -1
    i = 0
    while i < len(block):
        c = block[i]
        if in_str:
            if c == "'" and i + 1 < len(block) and block[i + 1] == "'":
                i += 2
                continue
            if c == "'":
                in_str = False
        elif c == "'":
            in_str = True
        elif c == "(":
            if depth == 0:
                start = i + 1
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                tuples.append(parse_values(block[start:i]))
        i += 1
    return tuples


def insert_rows(sql: str, table: str) -> list[list[Any]]:
    start = sql.index(f"insert into public.{table} (")
    values = sql.index("values", start)
    end = sql.index("on conflict", values)
    return split_tuples(sql[values + len("values") : end])


# ------------------------------------------------------------------- model
@dataclass
class Question:
    id: int
    quiz: str
    qtype: str
    topic: str
    difficulty: int
    prompt: str
    options: Any
    answer: dict[str, Any]
    explanation: str
    illustration: str | None
    unit: str | None
    sort_order: int


@dataclass
class Bank:
    lessons: list[dict[str, Any]]
    quizzes: list[dict[str, Any]]
    games: list[dict[str, Any]]
    achievements: list[dict[str, Any]]
    questions: list[Question]

    def questions_for(self, quiz_slug: str) -> list[Question]:
        return sorted((q for q in self.questions if q.quiz == quiz_slug), key=lambda q: q.sort_order)

    def quiz(self, slug: str) -> dict[str, Any]:
        for q in self.quizzes:
            if q["slug"] == slug:
                return q
        raise KeyError(slug)


SEED_Q = re.compile(r"select private\.seed_q\(([\s\S]*?)\);\s*$", re.MULTILINE)


def parse_seed(sql: str) -> Bank:
    lessons = [dict(zip(("id", "slug", "title", "planet_name", "xp_reward"), r)) for r in insert_rows(sql, "lessons")]
    quizzes = [
        dict(zip(("slug", "title", "kind", "lesson_id", "level", "pass_score", "xp_reward", "default_count", "shuffle"), r))
        for r in insert_rows(sql, "quizzes")
    ]
    games = [dict(zip(("id", "slug", "title", "description", "max_score", "pass_score", "xp_reward"), r)) for r in insert_rows(sql, "games")]
    achievements = [dict(zip(("slug", "title", "description", "icon", "xp_reward", "sort_order"), r)) for r in insert_rows(sql, "achievements")]

    questions: list[Question] = []
    order: dict[str, int] = {}
    for m in SEED_Q.finditer(sql):
        quiz, qtype, topic, diff, prompt, options, answer, expl, illus, unit = parse_values(m.group(1))
        order[quiz] = order.get(quiz, 0) + 1
        questions.append(
            Question(
                id=len(questions) + 1,
                quiz=quiz,
                qtype=qtype,
                topic=topic,
                difficulty=diff,
                prompt=prompt,
                options=None if options is None else json.loads(options),
                answer=json.loads(answer),
                explanation=expl,
                illustration=illus,
                unit=unit,
                sort_order=order[quiz],
            )
        )
    return Bank(lessons, quizzes, games, achievements, questions)


@lru_cache(maxsize=1)
def load_bank(path: Path = SEED) -> Bank:
    return parse_seed(path.read_text(encoding="utf-8"))


# --------------------------------------------------------------- validasi
def validate(bank: Bank) -> list[str]:
    """Daftar masalah pada bank soal (kosong = semua valid)."""
    problems: list[str] = []
    quiz_slugs = {q["slug"] for q in bank.quizzes}
    for q in bank.questions:
        tag = f"soal #{q.id} ({q.quiz})"
        if q.quiz not in quiz_slugs:
            problems.append(f"{tag}: kuis tidak dikenal")
        if len(q.explanation) < 5:
            problems.append(f"{tag}: pembahasan kosong")
        a = q.answer
        if "index" in a:
            if not isinstance(q.options, list) or not 0 <= a["index"] < len(q.options):
                problems.append(f"{tag}: indeks kunci di luar pilihan")
            elif not grade_answer(a, {"index": a["index"]}):
                problems.append(f"{tag}: kunci tidak lolos penilaian")
        elif "pairs" in a:
            opts = q.options or {}
            if len(a["pairs"]) != len(opts.get("left", [])) or sorted(a["pairs"]) != list(range(len(opts.get("right", [])))):
                problems.append(f"{tag}: pasangan tidak valid")
        elif "value" in a:
            if not grade_answer(a, {"value": a["value"]}):
                problems.append(f"{tag}: nilai kunci tidak lolos penilaian")
            for alt in a.get("alt", []):
                if not grade_answer(a, {"value": alt}):
                    problems.append(f"{tag}: alternatif {alt} tidak diterima")
        else:
            problems.append(f"{tag}: bentuk kunci tidak dikenal")
    for quiz in bank.quizzes:
        if not bank.questions_for(quiz["slug"]):
            problems.append(f"kuis {quiz['slug']}: tidak punya soal")
    return problems


# ------------------------------------------------------- generator TypeScript
def to_typescript(bank: Bank) -> str:
    def dump(value: Any) -> str:
        return json.dumps(value, ensure_ascii=False, indent=2)

    header = (
        "// FILE INI DIHASILKAN OTOMATIS oleh python/orbit_math/bank.py dari supabase/seed.sql.\n"
        "// Jangan diedit manual — ubah seed.sql lalu jalankan `npm run gen:bank`.\n"
    )
    return (
        header
        + 'import type { BankAchievement, BankGame, BankLesson, BankQuestion, BankQuiz } from "./bank-types";\n\n'
        + f"export const BANK_LESSONS: BankLesson[] = {dump(bank.lessons)};\n\n"
        + f"export const BANK_QUIZZES: BankQuiz[] = {dump(bank.quizzes)};\n\n"
        + f"export const BANK_GAMES: BankGame[] = {dump(bank.games)};\n\n"
        + f"export const BANK_ACHIEVEMENTS: BankAchievement[] = {dump(bank.achievements)};\n\n"
        + f"export const BANK_QUESTIONS: BankQuestion[] = {dump([asdict(q) for q in bank.questions])};\n"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Bank soal ORBIT MATH dari supabase/seed.sql")
    parser.add_argument("--check", action="store_true", help="hanya validasi, tidak menulis file")
    args = parser.parse_args(argv)

    bank = parse_seed(SEED.read_text(encoding="utf-8"))
    problems = validate(bank)
    summary = f"{len(bank.lessons)} misi, {len(bank.quizzes)} kuis, {len(bank.games)} game, {len(bank.achievements)} lencana, {len(bank.questions)} soal"
    if problems:
        print("✖ Bank soal bermasalah:", *problems, sep="\n  ", file=sys.stderr)
        return 1
    if not args.check:
        TS_OUT.write_text(to_typescript(bank), encoding="utf-8", newline="\n")
        print(f"OK: {summary} → {TS_OUT.relative_to(ROOT)}")
    else:
        print(f"OK: {summary} (valid)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
