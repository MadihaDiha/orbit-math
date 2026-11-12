import unittest

from orbit_math.circle import (
    calculate_circumference,
    circumference_from_diameter,
    circumference_from_radius,
    diameter_from_circumference,
    diameter_from_radius,
    distance_travelled,
    format_number,
    is_close,
    parse_number_input,
    pi_value,
    radius_from_circumference,
    radius_from_diameter,
    round_half,
    suggest_pi,
)
from orbit_math.validation import validate_measurement


class TestRumusKeliling(unittest.TestCase):
    def test_jari_jari_dan_diameter(self):
        self.assertEqual(diameter_from_radius(7), 14)
        self.assertEqual(radius_from_diameter(26), 13)
        self.assertEqual(radius_from_diameter(45), 22.5)

    def test_pi_22_per_7(self):
        pi = pi_value("22/7")
        self.assertEqual(round_half(circumference_from_radius(7, pi)), 44)
        self.assertEqual(round_half(circumference_from_diameter(14, pi)), 44)
        self.assertEqual(round_half(circumference_from_radius(35, pi)), 220)
        self.assertEqual(round_half(circumference_from_diameter(140, pi)), 440)

    def test_pi_3_14(self):
        self.assertEqual(round_half(circumference_from_diameter(10, 3.14)), 31.4)
        self.assertEqual(round_half(circumference_from_radius(10, 3.14)), 62.8)
        self.assertEqual(round_half(circumference_from_radius(20, 3.14)), 125.6)
        self.assertEqual(round_half(circumference_from_diameter(30, 3.14)), 94.2)

    def test_kebalikan(self):
        self.assertEqual(round_half(diameter_from_circumference(154, 22 / 7)), 49)
        self.assertEqual(round_half(radius_from_circumference(125.6, 3.14)), 20)
        self.assertEqual(round_half(radius_from_circumference(88, 22 / 7)), 14)

    def test_jarak_tempuh_roda(self):
        # roda r = 14 cm berputar 10 kali → 880 cm
        self.assertEqual(round_half(distance_travelled(14, 10, 22 / 7)), 880)


class TestKalkulator(unittest.TestCase):
    def test_dari_jari_jari(self):
        r = calculate_circumference("radius", 7, "22/7")
        self.assertEqual(round_half(r.circumference), 44)
        self.assertEqual(r.diameter, 14)
        self.assertEqual(r.formula, "K = 2 × π × r")
        self.assertGreaterEqual(len(r.steps), 4)
        self.assertIn("44", r.steps[-1].expression)

    def test_dari_diameter(self):
        d = calculate_circumference("diameter", 50, "3.14")
        self.assertEqual(round_half(d.circumference), 157)
        self.assertEqual(d.radius, 25)

    def test_mode_tidak_valid(self):
        with self.assertRaises(ValueError):
            calculate_circumference("luas", 7, "22/7")  # type: ignore[arg-type]

    def test_validasi_input(self):
        self.assertIsNotNone(validate_measurement("", None))
        self.assertIsNotNone(validate_measurement("abc", None))
        self.assertIsNotNone(validate_measurement("-5", -5))
        self.assertIsNotNone(validate_measurement("0", 0))
        self.assertIsNone(validate_measurement("7", 7))


class TestAngkaIndonesia(unittest.TestCase):
    def test_parse(self):
        self.assertEqual(parse_number_input("7,5"), 7.5)
        self.assertEqual(parse_number_input("62.8"), 62.8)
        self.assertEqual(parse_number_input(" 44 "), 44)
        self.assertEqual(parse_number_input("2.200.000"), 2200000)
        self.assertEqual(parse_number_input("1.234,5"), 1234.5)
        self.assertEqual(parse_number_input("-3"), -3)
        self.assertIsNone(parse_number_input(""))
        self.assertIsNone(parse_number_input("abc"))
        self.assertIsNone(parse_number_input("12,3,4"))

    def test_format(self):
        self.assertEqual(format_number(62.8), "62,8")
        self.assertEqual(format_number(2200000), "2.200.000")
        self.assertEqual(format_number(43.96), "43,96")
        self.assertEqual(format_number(22 / 7, 4), "3,1429")
        self.assertEqual(format_number(float("nan")), "-")

    def test_saran_pi_dan_pembulatan(self):
        self.assertEqual(suggest_pi(21), "22/7")
        self.assertEqual(suggest_pi(10.5), "3.14")
        self.assertEqual(suggest_pi(20), "3.14")
        self.assertEqual(round_half(0.1 + 0.2), 0.3)
        self.assertEqual(round_half(2.675), 2.68)
        self.assertTrue(is_close(43.96, 44))
        self.assertFalse(is_close(43.8, 44))


if __name__ == "__main__":
    unittest.main()
