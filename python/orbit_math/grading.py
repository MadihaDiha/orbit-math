"""Penilaian jawaban — setara ``private.grade_answer()`` (SQL) dan ``gradeAnswer()`` (Mode Demo).

Bentuk kunci jawaban:

* ``{"index": n}``                           → pilihan ganda / benar-salah / identifikasi / melengkapi rumus
* ``{"value": x, "tolerance": t, "alt": []}`` → isian angka & soal cerita
* ``{"pairs": [..]}``                        → memasangkan istilah dengan definisi
"""

from __future__ import annotations

import math
from typing import Any, Mapping

DEFAULT_TOLERANCE = 0.05


def _is_number(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def grade_answer(answer: Mapping[str, Any], given: Mapping[str, Any] | None) -> bool:
    """True bila jawaban ``given`` cocok dengan kunci ``answer``."""
    if not isinstance(given, Mapping):
        return False

    if "value" in answer:
        value = given.get("value")
        if not _is_number(value):
            return False
        tol = answer.get("tolerance", DEFAULT_TOLERANCE)
        if abs(value - answer["value"]) <= tol:
            return True
        return any(abs(value - alt) <= tol for alt in answer.get("alt", []))

    if "pairs" in answer:
        pairs = given.get("pairs")
        return isinstance(pairs, list) and pairs == list(answer["pairs"])

    index = given.get("index")
    return _is_number(index) and index == answer.get("index")


def score_percent(correct: int, total: int) -> int:
    """Nilai 0–100, dibulatkan seperti ``round(100.0 * correct / total)`` di PostgreSQL."""
    if total <= 0:
        return 0
    return int(100 * correct / total + 0.5)


def grade_quiz(questions: list[Mapping[str, Any]], answers: Mapping[str, Any], pass_score: int) -> dict[str, Any]:
    """Menilai satu sesi kuis. ``answers`` dikunci dengan id soal (string)."""
    review = []
    correct = 0
    for q in questions:
        given = answers.get(str(q["id"]))
        ok = grade_answer(q["answer"], given)
        correct += ok
        review.append({"id": q["id"], "prompt": q["prompt"], "given": given, "correct_answer": q["answer"], "is_correct": ok, "explanation": q["explanation"]})
    score = score_percent(correct, len(questions))
    return {"score": score, "correct": correct, "total": len(questions), "passed": score >= pass_score, "pass_score": pass_score, "review": review}
