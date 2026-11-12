"""Rumus keliling lingkaran untuk SMP kelas VIII.

Konvensi kelas VIII:

* π = 22/7 bila jari-jari/diameter kelipatan 7,
* π = 3,14 untuk bilangan lainnya.

Semua fungsi di sini setara dengan ``src/lib/math.ts`` di aplikasi web.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from typing import Literal

PiChoice = Literal["3.14", "22/7", "exact"]

PI_OPTIONS: list[tuple[PiChoice, str]] = [
    ("3.14", "π = 3,14"),
    ("22/7", "π = 22/7"),
    ("exact", "π = 3,14159… (lebih teliti)"),
]


def pi_value(choice: PiChoice) -> float:
    """Nilai numerik π sesuai pilihan siswa."""
    if choice == "22/7":
        return 22 / 7
    if choice == "3.14":
        return 3.14
    return math.pi


def pi_label(choice: PiChoice) -> str:
    """Penulisan π untuk ditampilkan (gaya Indonesia)."""
    return {"22/7": "22/7", "3.14": "3,14"}.get(choice, "3,14159…")


def round_half(value: float, decimals: int = 2) -> float:
    """Pembulatan setengah ke atas yang aman (menghindari 0.1 + 0.2 = 0.30000000000000004)."""
    q = Decimal(1).scaleb(-decimals)
    return float(Decimal(repr(value)).quantize(q, rounding=ROUND_HALF_UP))


# ---------------------------------------------------------------- rumus dasar
def diameter_from_radius(r: float) -> float:
    """d = 2 × r"""
    return 2 * r


def radius_from_diameter(d: float) -> float:
    """r = d ÷ 2"""
    return d / 2


def circumference_from_diameter(d: float, pi: float) -> float:
    """K = π × d"""
    return pi * d


def circumference_from_radius(r: float, pi: float) -> float:
    """K = 2 × π × r"""
    return 2 * pi * r


def diameter_from_circumference(k: float, pi: float) -> float:
    """d = K ÷ π"""
    return k / pi


def radius_from_circumference(k: float, pi: float) -> float:
    """r = K ÷ (2 × π)"""
    return k / (2 * pi)


def distance_travelled(radius: float, turns: float, pi: float) -> float:
    """Jarak tempuh roda = banyak putaran × keliling roda (tanpa tergelincir)."""
    return turns * circumference_from_radius(radius, pi)


# ----------------------------------------------------- format & parsing angka
def format_number(value: float, max_decimals: int = 2) -> str:
    """Format angka gaya Indonesia: titik ribuan, koma desimal, tanpa nol di belakang.

    >>> format_number(62.8)
    '62,8'
    >>> format_number(2200000)
    '2.200.000'
    """
    if value is None or not math.isfinite(value):
        return "-"
    rounded = round_half(value, max_decimals)
    text = f"{rounded:,.{max_decimals}f}"
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text.replace(",", "_").replace(".", ",").replace("_", ".")


_THOUSANDS = re.compile(r"^-?\d{1,3}(\.\d{3}){2,}$")
_PLAIN = re.compile(r"^-?\d+(\.\d+)?$")


def parse_number_input(raw: str) -> float | None:
    """Membaca jawaban angka siswa: mendukung "12,5", "12.5", "1.234,5", dan "2.200.000".

    Mengembalikan ``None`` bila input kosong atau bukan angka.
    """
    cleaned = re.sub(r"\s", "", raw or "")
    if not cleaned:
        return None
    if "," in cleaned:
        normalized = cleaned.replace(".", "").replace(",", ".", 1)
    elif _THOUSANDS.match(cleaned):
        normalized = cleaned.replace(".", "")
    else:
        normalized = cleaned
    if not _PLAIN.match(normalized):
        return None
    number = float(normalized)
    return number if math.isfinite(number) else None


def suggest_pi(n: float) -> PiChoice:
    """Saran nilai π: 22/7 untuk kelipatan 7, selain itu 3,14."""
    return "22/7" if n != 0 and float(round_half(n / 7, 6)).is_integer() else "3.14"


def is_close(given: float, expected: float, tolerance: float = 0.05) -> bool:
    """Membandingkan jawaban angka dengan toleransi (sama dengan server)."""
    return abs(given - expected) <= tolerance


# ------------------------------------------------------- kalkulator bertahap
@dataclass
class CalcStep:
    label: str
    expression: str


@dataclass
class CircumferenceResult:
    radius: float
    diameter: float
    circumference: float
    formula: str
    steps: list[CalcStep] = field(default_factory=list)
    explanation: str = ""


def calculate_circumference(mode: Literal["radius", "diameter"], value: float, choice: PiChoice, unit: str = "cm") -> CircumferenceResult:
    """Menghitung keliling beserta langkah penyelesaian seperti di Circle Laboratory."""
    if mode not in ("radius", "diameter"):
        raise ValueError("mode harus 'radius' atau 'diameter'")
    pi = pi_value(choice)
    pl = pi_label(choice)
    radius = value if mode == "radius" else radius_from_diameter(value)
    diameter = diameter_from_radius(value) if mode == "radius" else value
    k = circumference_from_radius(value, pi) if mode == "radius" else circumference_from_diameter(value, pi)
    v = format_number(value, 4)
    kt = format_number(k)

    if mode == "radius":
        steps = [
            CalcStep("Diketahui", f"r = {v} {unit}, π = {pl}"),
            CalcStep("Rumus", "K = 2 × π × r"),
            CalcStep("Substitusi", f"K = 2 × {pl} × {v}"),
            CalcStep("Sederhanakan", f"K = {pl} × {format_number(2 * value, 4)}"),
            CalcStep("Hasil", f"K = {kt} {unit}"),
        ]
        formula = "K = 2 × π × r"
    else:
        steps = [
            CalcStep("Diketahui", f"d = {v} {unit}, π = {pl}"),
            CalcStep("Rumus", "K = π × d"),
            CalcStep("Substitusi", f"K = {pl} × {v}"),
            CalcStep("Hasil", f"K = {kt} {unit}"),
        ]
        formula = "K = π × d"

    explanation = (
        f"Panjang garis yang mengelilingi lingkaran ini ≈ {kt} {unit}. Artinya, roda berdiameter "
        f"{format_number(diameter, 4)} {unit} akan menempuh {kt} {unit} dalam satu putaran penuh."
    )
    return CircumferenceResult(radius, diameter, k, formula, steps, explanation)
