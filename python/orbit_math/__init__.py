"""ORBIT MATH — logika inti dalam Python.

Paket ini berisi algoritma yang sama dengan aplikasi web ORBIT MATH:

* :mod:`orbit_math.circle`     — rumus keliling lingkaran, format & parsing angka Indonesia, kalkulator langkah demi langkah
* :mod:`orbit_math.levels`     — sistem XP dan level astronaut
* :mod:`orbit_math.grading`    — penilaian jawaban (sama dengan fungsi SQL ``private.grade_answer``)
* :mod:`orbit_math.validation` — validasi formulir registrasi/login & keamanan rute
* :mod:`orbit_math.games`      — generator soal & penilaian 5 mini game
* :mod:`orbit_math.bank`       — pembaca ``supabase/seed.sql`` → bank soal (dipakai Mode Demo)
* :mod:`orbit_math.cli`        — aplikasi terminal: kalkulator, latihan soal, dan game

Jalankan aplikasi terminal dengan::

    python -m orbit_math
"""

__all__ = ["circle", "levels", "grading", "validation", "games", "bank", "cli"]
__version__ = "1.0.0"
