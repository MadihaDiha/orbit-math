"""Memastikan logika Python, TypeScript, dan SQL tetap sinkron."""

import re
import unittest

from orbit_math.bank import ROOT, TS_OUT, load_bank, to_typescript, validate
from orbit_math.games import GAMES
from orbit_math.levels import LEVELS, level_for_xp, level_progress, stars_for_score


class TestLevel(unittest.TestCase):
    def test_level_dari_xp(self):
        self.assertEqual(level_for_xp(0).level, 1)
        self.assertEqual(level_for_xp(149).level, 1)
        self.assertEqual(level_for_xp(150).level, 2)
        self.assertEqual(level_for_xp(799).level, 3)
        self.assertEqual(level_for_xp(2200).level, 6)
        self.assertEqual(level_for_xp(99999).title, "Cosmic Legend")

    def test_progres_level(self):
        p = level_progress(275)
        self.assertEqual((p.current.level, p.next.level, p.percent, p.xp_needed), (2, 3, 50, 125))
        self.assertEqual(level_progress(5000).percent, 100)

    def test_bintang(self):
        self.assertEqual([stars_for_score(s) for s in (60, 80, 99, 100)], [1, 2, 2, 3])

    def test_sama_dengan_typescript_dan_sql(self):
        ts = (ROOT / "src" / "lib" / "levels.ts").read_text(encoding="utf-8")
        sql = (ROOT / "supabase" / "migrations" / "0003_functions.sql").read_text(encoding="utf-8")
        for lv in LEVELS:
            self.assertIn(f'{{ level: {lv.level}, minXp: {lv.min_xp}, title: "{lv.title}" }}', ts)
            if lv.level > 1:
                self.assertRegex(sql, rf"p_xp >= {lv.min_xp}\s+then {lv.level}")


class TestBankSoal(unittest.TestCase):
    def test_bank_lengkap_dan_valid(self):
        bank = load_bank()
        self.assertEqual(len(bank.lessons), 7)
        self.assertEqual(len(bank.questions_for("exam")), 30)
        self.assertGreaterEqual(len(bank.questions), 100)
        self.assertEqual(validate(bank), [])

    def test_questionbank_ts_sesuai_seed(self):
        """src/content/questionBank.ts harus hasil generate terbaru dari seed.sql."""
        self.assertEqual(TS_OUT.read_text(encoding="utf-8").replace("\r\n", "\n"), to_typescript(load_bank()))

    def test_game_sama_dengan_seed(self):
        bank = load_bank()
        seed = {g["slug"]: (g["max_score"], g["pass_score"]) for g in bank.games}
        for g in GAMES:
            self.assertEqual(seed[g.slug], (g.max_score, g.pass_score), g.slug)

    def test_game_sama_dengan_typescript(self):
        ts = (ROOT / "src" / "lib" / "games.ts").read_text(encoding="utf-8")
        for g in GAMES:
            block = ts[ts.index(f'slug: "{g.slug}"') :]
            self.assertEqual(int(re.search(r"maxScore: (\d+)", block).group(1)), g.max_score)
            self.assertEqual(int(re.search(r"passScore: (\d+)", block).group(1)), g.pass_score)


if __name__ == "__main__":
    unittest.main()
