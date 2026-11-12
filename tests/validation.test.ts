import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLogin, validateMeasurement, validatePassword, validateRegister } from "../src/lib/validation";
import { safeNext, isPrivatePath } from "../src/lib/routes";

const valid = { fullName: "Rani Putri", username: "rani_08", email: "rani@sekolah.id", className: "VIII A", password: "Orbit2024", confirmPassword: "Orbit2024" };

test("registrasi valid tidak menghasilkan error", () => {
  assert.deepEqual(validateRegister(valid), {});
});

test("registrasi: kolom kosong & format salah", () => {
  const e = validateRegister({ fullName: "", username: "Ra Ni", email: "bukan-email", className: "", password: "abc", confirmPassword: "xyz" });
  assert.ok(e.fullName && e.username && e.email && e.className && e.password && e.confirmPassword);
});

test("registrasi: konfirmasi password harus sama", () => {
  const e = validateRegister({ ...valid, confirmPassword: "Orbit2025" });
  assert.equal(Object.keys(e).join(), "confirmPassword");
});

test("password: minimal 8 karakter berisi huruf dan angka", () => {
  assert.ok(validatePassword("12345678"));
  assert.ok(validatePassword("abcdefgh"));
  assert.ok(validatePassword("ab1"));
  assert.equal(validatePassword("bimo1234"), undefined);
});

test("login: kolom kosong", () => {
  const e = validateLogin("", "");
  assert.ok(e.email && e.password);
});

test("kalkulator: input kosong, negatif, nol, bukan angka", () => {
  assert.ok(validateMeasurement("", null));
  assert.ok(validateMeasurement("abc", null));
  assert.ok(validateMeasurement("-5", -5));
  assert.ok(validateMeasurement("0", 0));
  assert.equal(validateMeasurement("7", 7), undefined);
});

test("perlindungan rute & anti open-redirect", () => {
  assert.ok(isPrivatePath("/dashboard"));
  assert.ok(isPrivatePath("/missions/radius-base"));
  assert.ok(!isPrivatePath("/login"));
  assert.ok(!isPrivatePath("/"));
  assert.ok(!isPrivatePath("/labirin"));
  assert.equal(safeNext("/lab"), "/lab");
  assert.equal(safeNext("https://evil.com"), "/dashboard");
  assert.equal(safeNext("//evil.com"), "/dashboard");
  assert.equal(safeNext(undefined), "/dashboard");
});
