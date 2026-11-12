import random
import re
import unittest

from orbit_math.bank import load_bank
from orbit_math.games import (
    OBJECT_INFO,
    PI_CASES,
    clamp_game_score,
    hunter_round,
    is_circle,
    orbit_problem,
    rescue_challenge,
    score_hunter_round,
    score_orbit,
    score_pi_case,
)
from orbit_math.grading import grade_answer, grade_quiz, score_percent
from orbit_math.validation import RegisterInput, is_private_path, safe_next, validate_login, validate_password, validate_register


class TestPenilaian(unittest.TestCase):
    def test_bentuk_jawaban(self):
        self.assertFalse(grade_answer({"index": 1}, None))
        self.assertTrue(grade_answer({"index": 1}, {"index": 1}))
        self.assertFalse(grade_answer({"index": 1}, {"index": True}))  # bool bukan angka
        self.assertFalse(grade_answer({"value": 44}, {"index": 44}))
        self.assertTrue(grade_answer({"value": 44, "alt": [43.96]}, {"value": 43.96}))
        self.assertTrue(grade_answer({"value": 2200000, "tolerance": 1}, {"value": 2200000.5}))
        self.assertFalse(grade_answer({"pairs": [1, 2, 0]}, {"pairs": [1, 0, 2]}))
        self.assertTrue(grade_answer({"pairs": [1, 2, 0]}, {"pairs": [1, 2, 0]}))

    def test_nilai_seperti_postgres(self):
        self.assertEqual(score_percent(2, 3), 67)
        self.assertEqual(score_percent(1, 8), 13)  # 12,5 → 13
        self.assertEqual(score_percent(0, 0), 0)

    def test_menilai_kuis_dari_bank(self):
        bank = load_bank()
        qs = [vars(q) for q in bank.questions_for("lesson-5")]
        semua_benar = {str(q["id"]): q["answer"] for q in qs}
        hasil = grade_quiz(qs, semua_benar, 60)
        self.assertEqual((hasil["score"], hasil["passed"]), (100, True))
        hasil = grade_quiz(qs, {}, 60)
        self.assertEqual((hasil["score"], hasil["passed"]), (0, False))


class TestGame(unittest.TestCase):
    def test_circle_hunter(self):
        objs = hunter_round(random.Random(1))
        self.assertEqual(len(objs), 8)
        circles = [o for o in objs if OBJECT_INFO[o][1]]
        self.assertEqual(len(circles), 4)
        self.assertEqual(score_hunter_round(objs, set(circles)), (40, 4))
        self.assertEqual(score_hunter_round(objs, set(objs))[0], 20)
        self.assertFalse(is_circle("egg"))

    def test_orbit_calculation_konsisten(self):
        rng = random.Random(7)
        for i in range(300):
            stage = i % 3 + 1
            p = orbit_problem(stage, rng)
            n = float(re.search(r"([\d.,]+)(?= km)", p.prompt).group(1).replace(".", "").replace(",", "."))
            pi = 22 / 7 if "22/7" in p.prompt else 3.14
            expected = pi * n if stage == 1 else 2 * pi * n if stage == 2 else n / pi
            self.assertLess(abs(expected - p.answer), 0.06, p.prompt)

    def test_orbit_poin(self):
        self.assertEqual(score_orbit(44, 44, 10)[0], 20)
        self.assertEqual(score_orbit(44, 44, 45)[0], 15)
        self.assertTrue(score_orbit(43.96, 44, 45)[1])
        self.assertEqual(score_orbit(43.7, 44, 45)[0], 8)
        self.assertEqual(score_orbit(40, 44, 5)[0], 0)

    def test_space_rescue_pilihan_unik(self):
        rng = random.Random(3)
        for _ in range(300):
            c = rescue_challenge(rng)
            self.assertEqual(len(set(c.options)), 3)
            self.assertIn(c.answer, c.options)

    def test_pi_detective(self):
        self.assertEqual(len(PI_CASES), 6)
        self.assertEqual([score_pi_case(n, True) for n in (1, 2, 3, 4)], [30, 20, 10, 10])
        self.assertEqual(score_pi_case(1, False), 0)
        for case in PI_CASES:
            self.assertLess(case.answer, len(case.options))

    def test_skor_dibatasi_seperti_server(self):
        self.assertEqual(clamp_game_score("orbit-calculation", 9999, 50, 8), (160, 8, 8, True))
        self.assertEqual(clamp_game_score("circle-hunter", -10, 3, 20), (0, 3, 20, False))
        with self.assertRaises(ValueError):
            clamp_game_score("tidak-ada", 1, 1, 1)


class TestValidasi(unittest.TestCase):
    def test_registrasi(self):
        ok = RegisterInput("Rani Putri", "rani_08", "rani@sekolah.id", "VIII A", "Orbit2024", "Orbit2024")
        self.assertEqual(validate_register(ok), {})
        bad = RegisterInput("", "Ra Ni", "bukan-email", "", "abc", "xyz")
        self.assertEqual(set(validate_register(bad)), {"full_name", "username", "email", "class_name", "password", "confirm_password"})

    def test_password_dan_login(self):
        self.assertIsNotNone(validate_password("12345678"))
        self.assertIsNotNone(validate_password("abcdefgh"))
        self.assertIsNone(validate_password("bimo1234"))
        self.assertEqual(set(validate_login("", "")), {"email", "password"})

    def test_rute(self):
        self.assertTrue(is_private_path("/missions/radius-base"))
        self.assertFalse(is_private_path("/labirin"))
        self.assertEqual(safe_next("https://evil.com"), "/dashboard")
        self.assertEqual(safe_next("//evil.com"), "/dashboard")
        self.assertEqual(safe_next("/lab"), "/lab")


if __name__ == "__main__":
    unittest.main()
