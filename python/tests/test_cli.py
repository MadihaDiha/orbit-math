"""Menjalankan aplikasi terminal dengan masukan otomatis (tanpa keyboard)."""

import random
import unittest

from orbit_math.cli import Terminal


def scripted(inputs):
    it = iter(inputs)
    out = []
    term_ask = lambda prompt="": next(it)  # noqa: E731
    term_say = lambda *a, **k: out.append(" ".join(str(x) for x in a))  # noqa: E731
    return term_ask, term_say, out


class TestTerminal(unittest.TestCase):
    def test_kalkulator_dan_keluar(self):
        # menu 1 → jari-jari → input salah dulu ("abc", "-5") → 7 → π 22/7 → keluar
        ask, say, out = scripted(["1", "A", "abc", "-5", "7", "B", "0"])
        Terminal(ask, say, random.Random(0)).run()
        text = "\n".join(out)
        self.assertIn("Input harus berupa angka", text)
        self.assertIn("tidak boleh negatif", text)
        self.assertIn("K = 44 cm", text)
        self.assertIn("Sampai jumpa", text)

    def test_rangkuman_dan_menu_salah(self):
        ask, say, out = scripted(["9", "4", "0"])
        Terminal(ask, say).run()
        text = "\n".join(out)
        self.assertIn("Menu tidak dikenal", text)
        self.assertIn("K = π × d", text)

    def test_training_memberi_nilai(self):
        # Level 1, jawab "A"/"1" untuk semua soal (pilihan & angka & pasangan)
        answers = ["2", "A"] + ["1"] * 200
        ask, say, out = scripted(answers)
        t = Terminal(ask, say, random.Random(5))
        t.training()
        text = "\n".join(out)
        self.assertRegex(text, r"Nilai: \d+ \(\d+/10 benar\)")
        self.assertIn("Pembahasan:", text)


if __name__ == "__main__":
    unittest.main()
