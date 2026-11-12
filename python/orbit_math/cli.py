"""ORBIT MATH versi terminal — belajar Keliling Lingkaran bersama BIMO lewat command line.

Menu:
  1. Kalkulator keliling (langkah demi langkah)
  2. Training Zone (soal dari bank soal yang sama dengan aplikasi web)
  3. Mini game Orbit Calculation
  4. Rangkuman rumus
  0. Keluar

Jalankan: ``python -m orbit_math`` (dari folder ``python/``).
"""

from __future__ import annotations

import random
import sys
import time
from typing import Callable, Iterable

from .bank import Question, load_bank
from .circle import PI_OPTIONS, calculate_circumference, format_number, parse_number_input, suggest_pi
from .games import orbit_set, score_orbit
from .grading import grade_answer, score_percent
from .levels import level_for_xp
from .validation import validate_measurement

InputFn = Callable[[str], str]
PrintFn = Callable[..., None]

LETTERS = "ABCDEF"
BIMO = r"""
     .---.
    ( o o )   BIMO
   /|  ^  |\  "Halo, penjelajah!"
     '---'
"""


class Terminal:
    """Pembungkus input/output agar aplikasi bisa diuji tanpa keyboard."""

    def __init__(self, ask: InputFn = input, say: PrintFn = print, rng: random.Random | None = None, clock: Callable[[], float] = time.monotonic):
        self.ask = ask
        self.say = say
        self.rng = rng or random.Random()
        self.clock = clock
        self.xp = 0

    # -------------------------------------------------------- utilitas input
    def choose(self, prompt: str, options: Iterable[str]) -> int:
        opts = list(options)
        for i, o in enumerate(opts):
            self.say(f"  {LETTERS[i] if i < len(LETTERS) else i + 1}. {o}")
        while True:
            raw = self.ask(f"{prompt} ").strip().upper()
            if raw and raw[0] in LETTERS[: len(opts)]:
                return LETTERS.index(raw[0])
            if raw.isdigit() and 1 <= int(raw) <= len(opts):
                return int(raw) - 1
            self.say("  ⚠ Pilih huruf yang tersedia, ya.")

    def number(self, prompt: str) -> float:
        while True:
            raw = self.ask(f"{prompt} ")
            value = parse_number_input(raw)
            err = validate_measurement(raw, value)
            if err is None and value is not None:
                return value
            self.say(f"  ⚠ {err}")

    # ------------------------------------------------------------ fitur 1
    def calculator(self) -> None:
        self.say("\n=== KALKULATOR KELILING ===")
        mode = "radius" if self.choose("Hitung dari?", ["Jari-jari (r)", "Diameter (d)"]) == 0 else "diameter"
        value = self.number(f"Masukkan nilai {'r' if mode == 'radius' else 'd'} (cm):")
        tip = suggest_pi(value)
        self.say(f"  Tips BIMO: untuk {format_number(value, 4)}, π = {'22/7' if tip == '22/7' else '3,14'} paling mudah.")
        pi_choice = PI_OPTIONS[self.choose("Nilai π?", [label for _, label in PI_OPTIONS])][0]
        result = calculate_circumference(mode, value, pi_choice)
        self.say()
        for i, step in enumerate(result.steps, 1):
            self.say(f"  {i}. {step.label:<12} {step.expression}")
        self.say(f"\n  ➜ {result.explanation}")

    # ------------------------------------------------------------ fitur 2
    def ask_question(self, q: Question, number: int, total: int) -> tuple[bool, dict]:
        self.say(f"\nSoal {number}/{total} · {q.topic}")
        self.say(q.prompt)
        if q.options is None:
            given = {"value": self.number(f"Jawaban{f' ({q.unit})' if q.unit else ''}:")}
        elif isinstance(q.options, dict):
            pairs = []
            for left in q.options["left"]:
                self.say(f"\n  Pasangan untuk '{left}':")
                pairs.append(self.choose("  Pilih:", q.options["right"]))
            given = {"pairs": pairs}
        else:
            given = {"index": self.choose("Jawabanmu:", q.options)}
        ok = grade_answer(q.answer, given)
        if ok:
            self.say("  ✔ YEAH! Jawabanmu tepat! Kamu berhasil mendapatkan energi galaksi!")
        else:
            self.say("  ✖ Ups! Sepertinya ada sedikit gangguan sinyal. Coba kita periksa langkahnya, ya!")
        self.say(f"  Pembahasan: {q.explanation}")
        return ok, given

    def training(self) -> None:
        bank = load_bank()
        self.say("\n=== TRAINING ZONE ===")
        levels = [q for q in bank.quizzes if q["kind"] == "training"]
        quiz = levels[self.choose("Pilih level:", [q["title"] for q in levels])]
        pool = bank.questions_for(quiz["slug"])
        questions = self.rng.sample(pool, min(quiz["default_count"], len(pool)))
        correct = 0
        for i, q in enumerate(questions, 1):
            ok, _ = self.ask_question(q, i, len(questions))
            correct += ok
            if ok:
                self.xp += 5
        score = score_percent(correct, len(questions))
        passed = score >= quiz["pass_score"]
        if passed:
            self.xp += quiz["xp_reward"]
        self.say(f"\n  Nilai: {score} ({correct}/{len(questions)} benar) — {'LULUS' if passed else 'belum lulus'} (minimal {quiz['pass_score']})")

    # ------------------------------------------------------------ fitur 3
    def orbit_game(self) -> None:
        self.say("\n=== ORBIT CALCULATION ===")
        self.say("Tepat = 15 poin (+5 bila ≤ 30 detik). Hampir tepat (≤1%) = 8 poin.")
        total = 0
        for i, p in enumerate(orbit_set(self.rng), 1):
            self.say(f"\nOrbit {i}/8 (tahap {p.stage}): {p.prompt}")
            start = self.clock()
            given = None
            while given is None:
                given = parse_number_input(self.ask("Jawaban (km): "))
                if given is None:
                    self.say("  ⚠ Tulis angka, gunakan koma untuk desimal.")
            points, exact, close = score_orbit(given, p.answer, self.clock() - start)
            total += points
            status = "Orbit stabil!" if exact else "Hampir tepat!" if close else "Orbit meleset."
            self.say(f"  {status} +{points} poin. {p.explanation}")
        self.say(f"\n  Skor akhir: {total}/160 — {'MISI BERHASIL!' if total >= 100 else 'coba lagi, ya!'}")
        if total >= 100:
            self.xp += 60

    # ------------------------------------------------------------ fitur 4
    def summary(self) -> None:
        self.say(
            "\n=== RANGKUMAN RUMUS ===\n"
            "  d = 2 × r          r = d ÷ 2\n"
            "  π = K ÷ d ≈ 3,14 ≈ 22/7  (pakai 22/7 untuk kelipatan 7)\n"
            "  K = π × d  =  2 × π × r\n"
            "  Jarak roda = banyak putaran × keliling"
        )

    # ------------------------------------------------------------- menu
    def run(self) -> None:
        self.say(BIMO)
        self.say("ORBIT MATH — Explore the Galaxy, Master Mathematics!")
        actions = {"1": self.calculator, "2": self.training, "3": self.orbit_game, "4": self.summary}
        while True:
            lv = level_for_xp(self.xp)
            self.say(f"\n[XP {self.xp} · Lv {lv.level} {lv.title}]")
            self.say("  1. Kalkulator keliling\n  2. Training Zone\n  3. Mini game Orbit Calculation\n  4. Rangkuman rumus\n  0. Keluar")
            choice = self.ask("Pilih menu: ").strip()
            if choice == "0":
                self.say("Sampai jumpa di orbit berikutnya, penjelajah! 🚀")
                return
            action = actions.get(choice)
            if action is None:
                self.say("  ⚠ Menu tidak dikenal.")
                continue
            action()


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # agar simbol π tampil di Windows
    try:
        Terminal().run()
    except (KeyboardInterrupt, EOFError):
        print("\nSampai jumpa! 🚀")
    return 0
