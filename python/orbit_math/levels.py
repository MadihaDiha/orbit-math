"""Sistem XP & level astronaut ORBIT MATH.

Ambang level HARUS sama dengan ``src/lib/levels.ts`` dan fungsi SQL
``private.level_for_xp()``; unit test memeriksa ketiganya tetap sinkron.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Level:
    level: int
    min_xp: int
    title: str


LEVELS: tuple[Level, ...] = (
    Level(1, 0, "Space Cadet"),
    Level(2, 150, "Orbit Rookie"),
    Level(3, 400, "Star Pilot"),
    Level(4, 800, "Nebula Navigator"),
    Level(5, 1400, "Galaxy Commander"),
    Level(6, 2200, "Cosmic Legend"),
)


def level_for_xp(xp: int) -> Level:
    """Level tertinggi yang ambang XP-nya sudah tercapai."""
    current = LEVELS[0]
    for lv in LEVELS:
        if xp >= lv.min_xp:
            current = lv
    return current


@dataclass(frozen=True)
class LevelProgress:
    current: Level
    next: Level | None
    percent: int
    xp_into_level: int
    xp_needed: int


def level_progress(xp: int) -> LevelProgress:
    """Persentase menuju level berikutnya (untuk cincin progres di dashboard)."""
    current = level_for_xp(xp)
    nxt = next((lv for lv in LEVELS if lv.level == current.level + 1), None)
    if nxt is None:
        return LevelProgress(current, None, 100, xp - current.min_xp, 0)
    span = nxt.min_xp - current.min_xp
    into = xp - current.min_xp
    # Math.round di JavaScript = pembulatan setengah ke atas
    percent = min(100, int(into * 100 / span + 0.5))
    return LevelProgress(current, nxt, percent, into, nxt.min_xp - xp)


def stars_for_score(best_score: int) -> int:
    """Bintang misi dari nilai mini quiz: 100 → 3, ≥80 → 2, lulus → 1."""
    if best_score >= 100:
        return 3
    if best_score >= 80:
        return 2
    return 1
