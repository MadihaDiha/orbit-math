import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCircumference,
  circumferenceFromDiameter,
  circumferenceFromRadius,
  diameterFromCircumference,
  diameterFromRadius,
  formatNumber,
  isClose,
  parseNumberInput,
  piValue,
  radiusFromCircumference,
  radiusFromDiameter,
  round,
  suggestPi,
} from "../src/lib/math";

test("d = 2r dan r = d/2", () => {
  assert.equal(diameterFromRadius(7), 14);
  assert.equal(radiusFromDiameter(26), 13);
  assert.equal(radiusFromDiameter(45), 22.5);
});

test("keliling dengan π = 22/7 (kelipatan 7)", () => {
  assert.equal(round(circumferenceFromRadius(7, piValue("22/7"))), 44);
  assert.equal(round(circumferenceFromDiameter(14, piValue("22/7"))), 44);
  assert.equal(round(circumferenceFromRadius(35, piValue("22/7"))), 220);
  assert.equal(round(circumferenceFromDiameter(140, piValue("22/7"))), 440);
});

test("keliling dengan π = 3,14", () => {
  assert.equal(round(circumferenceFromDiameter(10, 3.14)), 31.4);
  assert.equal(round(circumferenceFromRadius(10, 3.14)), 62.8);
  assert.equal(round(circumferenceFromRadius(20, 3.14)), 125.6);
  assert.equal(round(circumferenceFromDiameter(30, 3.14)), 94.2);
});

test("kebalikan: dari keliling ke d dan r", () => {
  assert.equal(round(diameterFromCircumference(154, 22 / 7)), 49);
  assert.equal(round(radiusFromCircumference(125.6, 3.14)), 20);
  assert.equal(round(radiusFromCircumference(88, 22 / 7)), 14);
});

test("kalkulator menghasilkan langkah & nilai benar", () => {
  const r = calculateCircumference("radius", 7, "22/7");
  assert.equal(round(r.circumference), 44);
  assert.equal(r.diameter, 14);
  assert.equal(r.formula, "K = 2 × π × r");
  assert.ok(r.steps.length >= 4);
  const d = calculateCircumference("diameter", 50, "3.14");
  assert.equal(round(d.circumference), 157);
  assert.equal(d.radius, 25);
});

test("parseNumberInput mendukung format Indonesia", () => {
  assert.equal(parseNumberInput("7,5"), 7.5);
  assert.equal(parseNumberInput("62.8"), 62.8);
  assert.equal(parseNumberInput(" 44 "), 44);
  assert.equal(parseNumberInput("2.200.000"), 2200000);
  assert.equal(parseNumberInput("1.234,5"), 1234.5);
  assert.equal(parseNumberInput("-3"), -3);
  assert.equal(parseNumberInput(""), null);
  assert.equal(parseNumberInput("abc"), null);
  assert.equal(parseNumberInput("12,3,4"), null);
});

test("saran π dan pembulatan", () => {
  assert.equal(suggestPi(21), "22/7");
  assert.equal(suggestPi(10.5), "3.14");
  assert.equal(suggestPi(20), "3.14");
  assert.equal(round(0.1 + 0.2), 0.3);
  assert.equal(formatNumber(62.8), "62,8");
  assert.ok(isClose(43.96, 44, 0.05));
  assert.ok(!isClose(43.8, 44, 0.05));
});
