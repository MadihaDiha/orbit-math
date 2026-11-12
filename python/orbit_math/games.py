"""Generator soal & penilaian 5 mini game Cosmic Playground — setara ``src/lib/games.ts``."""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Callable, Literal

from .circle import format_number, round_half

# ------------------------------------------------------------ metadata game
@dataclass(frozen=True)
class GameInfo:
    slug: str
    title: str
    max_score: int
    pass_score: int


GAMES: tuple[GameInfo, ...] = (
    GameInfo("circle-hunter", "Circle Hunter", 200, 120),
    GameInfo("radius-or-diameter", "Radius or Diameter?", 100, 70),
    GameInfo("pi-detective", "Pi Detective", 180, 100),
    GameInfo("orbit-calculation", "Orbit Calculation", 160, 100),
    GameInfo("bimo-space-rescue", "BIMO Space Rescue", 100, 60),
)


def get_game(slug: str) -> GameInfo | None:
    return next((g for g in GAMES if g.slug == slug), None)


def clamp_game_score(slug: str, score: float, correct: int, total: int) -> tuple[int, int, int, bool]:
    """Membatasi skor ke rentang sah seperti fungsi SQL ``submit_game``."""
    game = get_game(slug)
    if game is None:
        raise ValueError("game_not_found")
    s = min(max(int(round_half(score or 0, 0)), 0), game.max_score)
    t = min(max(total or 0, 0), 100)
    c = min(max(correct or 0, 0), t)
    return s, c, t, s >= game.pass_score


# --------------------------------------------------------- Circle Hunter
OBJECT_INFO: dict[str, tuple[str, bool, str]] = {
    "coin": ("Uang koin", True, "Permukaan koin bundar: jarak tepi ke pusat sama."),
    "clock": ("Jam dinding", True, "Jarum berputar mengitari titik pusat lingkaran."),
    "wheel": ("Roda", True, "Roda berbentuk lingkaran agar berputar mulus."),
    "plate": ("Piring", True, "Tepi piring membentuk lingkaran."),
    "cd": ("Keping CD", True, "CD berbentuk lingkaran dengan lubang di pusatnya."),
    "button": ("Kancing baju", True, "Kancing bulat berbentuk lingkaran."),
    "lid": ("Tutup botol", True, "Tutup botol dilihat dari atas berbentuk lingkaran."),
    "donut": ("Donat", True, "Tepi luar donat dilihat dari atas berbentuk lingkaran."),
    "book": ("Buku", False, "Buku berbentuk persegi panjang: punya 4 sisi lurus."),
    "phone": ("Ponsel", False, "Ponsel berbentuk persegi panjang dengan sudut tumpul."),
    "door": ("Pintu", False, "Pintu berbentuk persegi panjang."),
    "egg": ("Telur", False, "Telur berbentuk oval: jarak tepi ke tengah tidak sama."),
    "slice": ("Potongan kue", False, "Potongan kue berbentuk juring/segitiga, bukan lingkaran utuh."),
    "dice": ("Dadu", False, "Sisi dadu berbentuk persegi."),
    "kite": ("Layang-layang", False, "Layang-layang punya 4 sisi lurus dan 4 sudut."),
    "ruler": ("Penggaris", False, "Penggaris berbentuk persegi panjang."),
    "tv": ("Televisi", False, "Layar TV berbentuk persegi panjang."),
    "football": ("Bola rugbi", False, "Bola rugbi lonjong (oval), bukan lingkaran."),
}
CIRCLE_OBJECTS = [k for k, v in OBJECT_INFO.items() if v[1]]
NON_CIRCLE_OBJECTS = [k for k, v in OBJECT_INFO.items() if not v[1]]


def is_circle(obj: str) -> bool:
    return OBJECT_INFO[obj][1]


def hunter_round(rng: random.Random | None = None) -> list[str]:
    """Satu ronde: 4 benda lingkaran + 4 bukan lingkaran, diacak."""
    rng = rng or random.Random()
    objects = rng.sample(CIRCLE_OBJECTS, 4) + rng.sample(NON_CIRCLE_OBJECTS, 4)
    rng.shuffle(objects)
    return objects


def score_hunter_round(objects: list[str], selected: set[str], circle: Callable[[str], bool] = is_circle) -> tuple[int, int]:
    """+10 tiap lingkaran yang dipilih, −5 tiap pilihan salah, minimal 0."""
    score = 0
    correct = 0
    for obj in objects:
        if obj in selected and circle(obj):
            score += 10
            correct += 1
        elif obj in selected:
            score -= 5
    return max(0, score), correct


# --------------------------------------------------- Radius or Diameter?
SegmentKind = Literal["radius", "diameter", "chord"]
SEGMENT_LABELS: dict[str, str] = {"radius": "Jari-jari", "diameter": "Diameter", "chord": "Tali busur"}
SEGMENT_WHY: dict[str, str] = {
    "radius": "Garis ini berangkat dari titik pusat ke tepi lingkaran → jari-jari.",
    "diameter": "Garis ini melewati titik pusat dan menghubungkan dua titik di tepi → diameter (= 2 × r).",
    "chord": "Garis ini menghubungkan dua titik di tepi TANPA melewati pusat → tali busur.",
}


def segment_round(rng: random.Random | None = None) -> tuple[SegmentKind, int]:
    rng = rng or random.Random()
    return rng.choice(["radius", "diameter", "chord"]), rng.randrange(360)  # type: ignore[return-value]


# ------------------------------------------------------ Orbit Calculation
SEVENS = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70]
TENS = [5, 10, 15, 20, 25, 30, 40, 50]


@dataclass(frozen=True)
class NumericProblem:
    stage: int
    prompt: str
    answer: float
    unit: str
    explanation: str


def orbit_problem(stage: int, rng: random.Random | None = None) -> NumericProblem:
    """Tahap 1: d → K, tahap 2: r → K, tahap 3: K → d."""
    rng = rng or random.Random()
    use_seven = rng.random() < 0.5
    n = rng.choice(SEVENS if use_seven else TENS)
    pi = 22 / 7 if use_seven else 3.14
    pl = "22/7" if use_seven else "3,14"
    if stage == 1:
        k = round_half(pi * n, 2)
        return NumericProblem(1, f"Orbit satelit berdiameter {n} km. Berapa km kelilingnya? (π = {pl})", k, "km", f"K = π × d = {pl} × {n} = {format_number(k)} km.")
    if stage == 2:
        k = round_half(2 * pi * n, 2)
        return NumericProblem(2, f"Orbit bulan kecil berjari-jari {n} km. Berapa km kelilingnya? (π = {pl})", k, "km", f"K = 2 × π × r = 2 × {pl} × {n} = {format_number(k)} km.")
    k = round_half(pi * n, 2)
    return NumericProblem(3, f"Keliling orbit stasiun {format_number(k)} km. Berapa km diameternya? (π = {pl})", n, "km", f"d = K ÷ π = {format_number(k)} ÷ {pl} = {n} km.")


def orbit_set(rng: random.Random | None = None) -> list[NumericProblem]:
    rng = rng or random.Random()
    return [orbit_problem(s, rng) for s in (1, 1, 1, 2, 2, 2, 3, 3)]


def score_orbit(given: float, expected: float, seconds: float) -> tuple[int, bool, bool]:
    """Tepat = 15 (+5 bila ≤ 30 detik); hampir tepat (≤ 1%) = 8. Mengembalikan (poin, tepat, hampir)."""
    tol = max(0.05, abs(expected) * 0.002)
    exact = abs(given - expected) <= tol
    close = not exact and abs(given - expected) <= abs(expected) * 0.01
    points = (15 + (5 if seconds <= 30 else 0)) if exact else (8 if close else 0)
    return points, exact, close


# ------------------------------------------------------ BIMO Space Rescue
@dataclass(frozen=True)
class RescueChallenge:
    prompt: str
    options: tuple[float, ...]
    answer: float
    unit: str
    explanation: str


def rescue_challenge(rng: random.Random | None = None) -> RescueChallenge:
    """Satu tantangan sel energi dengan 3 pilihan unik (salah satunya benar)."""
    rng = rng or random.Random()
    kind = rng.randrange(4)
    r = rng.choice([7, 14, 21, 35])
    k = round_half(2 * (22 / 7) * r, 2)
    if kind == 0:
        prompt = f"Mesin pendorong berbentuk lingkaran berjari-jari {r} cm. Berapa kelilingnya? (π = 22/7)"
        answer = k
        wrong = [round_half((22 / 7) * r, 2), round_half((22 / 7) * r * r, 2)]
        expl = f"K = 2 × 22/7 × {r} = {format_number(k)} cm. (Ingat dikali 2 karena memakai jari-jari!)"
    elif kind == 1:
        d = 2 * r
        prompt = f"Panel surya bundar berdiameter {d} cm. Berapa jari-jarinya?"
        answer = r
        wrong = [d * 2, d]
        expl = f"r = d ÷ 2 = {d} ÷ 2 = {r} cm."
    elif kind == 2:
        n = rng.choice([2, 3, 5, 10])
        prompt = f"Roda rover berjari-jari {r} cm berputar {n} kali. Berapa cm jarak tempuhnya? (π = 22/7)"
        answer = round_half(k * n, 2)
        wrong = [k, round_half((22 / 7) * r * n, 2)]
        expl = f"K = {format_number(k)} cm. Jarak = {n} × {format_number(k)} = {format_number(answer)} cm."
    else:
        d = rng.choice([10, 20, 30, 50])
        prompt = f"Jendela kapsul berdiameter {d} cm. Berapa kelilingnya? (π = 3,14)"
        answer = round_half(3.14 * d, 2)
        wrong = [round_half(3.14 * d * 2, 2), round_half(3.14 * (d / 2), 2)]
        expl = f"K = π × d = 3,14 × {d} = {format_number(answer)} cm."

    unique: list[float] = []
    for w in wrong:
        if w != answer and w not in unique:
            unique.append(w)
    while len(unique) < 2:
        unique.append(round_half(answer + 10 * (len(unique) + 1), 2))
    options = [answer, *unique[:2]]
    rng.shuffle(options)
    return RescueChallenge(prompt, tuple(options), answer, "cm", expl)


# ------------------------------------------------------------ Pi Detective
@dataclass(frozen=True)
class PiCase:
    title: str
    clues: tuple[str, ...]
    question: str
    options: tuple[str, ...]
    answer: int
    explanation: str


PI_CASES: tuple[PiCase, ...] = (
    PiCase("Kasus #1: Rasio Misterius", ("Keliling tutup toples 31,4 cm.", "Diameternya 10 cm.", "π = keliling ÷ diameter."),
           "Berapa nilai rasio K ÷ d pada tutup toples itu?", ("3,14", "10", "31,4", "2"), 0, "31,4 ÷ 10 = 3,14. Inilah nilai π!"),
    PiCase("Kasus #2: Pecahan Penyamar", ("Tersangka berbentuk pecahan.", "Pembilangnya 22.", "Nilainya ≈ 3,142857…"),
           "Pecahan manakah yang menyamar sebagai π?", ("7/22", "22/7", "22/3", "3/22"), 1, "22/7 = 3,142857… sangat dekat dengan π."),
    PiCase("Kasus #3: Angka Kelipatan Tujuh", ("Sebuah roda berjari-jari 28 cm.", "28 = 4 × 7.", "Angka 7 bisa dicoret jika π memakai penyebut 7."),
           "Nilai π mana yang paling memudahkan?", ("3,14", "22/7", "3", "Tidak perlu π"), 1, "22/7 × 28 = 22 × 4 = 88 — sangat mudah!"),
    PiCase("Kasus #4: Kelipatan Sepuluh", ("Kolam bundar berdiameter 50 m.", "50 bukan kelipatan 7.", "Mengalikan 10, 20, 50 paling mudah memakai desimal."),
           "Nilai π mana yang lebih tepat dipakai?", ("22/7", "3,14", "7/22", "1,57"), 1, "3,14 × 50 = 157 m."),
    PiCase("Kasus #5: Tuduhan Palsu", ("Saksi: 'Lingkaran besar punya π lebih besar!'", "Koin: K ÷ d ≈ 3,14.", "Bianglala: K ÷ d ≈ 3,14."),
           "Apa kesimpulan detektif?", ("Saksi benar", "π selalu sama untuk semua lingkaran", "π lingkaran kecil lebih besar", "π hanya untuk roda"), 1,
           "π adalah konstanta: sama untuk lingkaran kecil maupun besar."),
    PiCase("Kasus #6: Desimal Tanpa Akhir", ("π = 3,14159265358979…", "Desimalnya terus berlanjut tanpa pola berulang.", "Karena itu kita memakai nilai pendekatan."),
           "Pernyataan yang benar tentang 3,14 adalah …", ("Nilai π yang tepat", "Nilai pendekatan π", "Bukan nilai π sama sekali", "Lebih besar dari π"), 1,
           "3,14 adalah pembulatan dari π yang sebenarnya 3,14159…"),
)


def score_pi_case(clues_opened: int, correct: bool) -> int:
    """Kasus bernilai 30; petunjuk pertama gratis, petunjuk berikutnya −10 (minimal 10)."""
    if not correct:
        return 0
    return max(10, 30 - 10 * max(0, clues_opened - 1))
