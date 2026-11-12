"""Validasi formulir & keamanan rute — setara ``src/lib/validation.ts`` dan ``src/lib/routes.ts``."""

from __future__ import annotations

import re
from dataclasses import dataclass

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
USERNAME_RE = re.compile(r"^[a-z0-9_]{3,20}$")

PRIVATE_PREFIXES = (
    "/dashboard",
    "/galaxy",
    "/missions",
    "/lab",
    "/training",
    "/playground",
    "/exam",
    "/profile",
    "/history",
    "/achievements",
)


def validate_email(email: str) -> str | None:
    if not email.strip():
        return "Email wajib diisi."
    if not EMAIL_RE.match(email.strip()):
        return "Format email belum benar, contoh: nama@email.com"
    return None


def validate_password(password: str) -> str | None:
    if not password:
        return "Password wajib diisi."
    if len(password) < 8:
        return "Password minimal 8 karakter."
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        return "Password harus berisi huruf dan angka."
    return None


def password_strength(password: str) -> tuple[int, str]:
    score = 0
    if len(password) >= 8:
        score += 1
    if re.search(r"[a-z]", password) and re.search(r"[A-Z]", password):
        score += 1
    if re.search(r"\d", password):
        score += 1
    if re.search(r"[^A-Za-z0-9]", password) or len(password) >= 12:
        score += 1
    labels = ["Sangat lemah", "Lemah", "Cukup", "Kuat", "Sangat kuat"]
    return score, labels[score]


def validate_full_name(name: str) -> str | None:
    n = name.strip()
    if not n:
        return "Nama lengkap wajib diisi."
    if len(n) < 2:
        return "Nama lengkap terlalu pendek."
    if len(n) > 80:
        return "Nama lengkap maksimal 80 karakter."
    return None


def validate_username(username: str) -> str | None:
    u = username.strip()
    if not u:
        return "Username wajib diisi."
    if not USERNAME_RE.match(u):
        return "Username 3–20 karakter: huruf kecil, angka, atau garis bawah (_)."
    return None


def validate_class_name(cls: str) -> str | None:
    c = cls.strip()
    if not c:
        return "Kelas wajib diisi."
    if len(c) > 20:
        return "Kelas maksimal 20 karakter."
    return None


@dataclass
class RegisterInput:
    full_name: str
    username: str
    email: str
    class_name: str
    password: str
    confirm_password: str


def validate_register(data: RegisterInput) -> dict[str, str]:
    """Mengembalikan pesan kesalahan per kolom (kosong = valid)."""
    checks = {
        "full_name": validate_full_name(data.full_name),
        "username": validate_username(data.username),
        "email": validate_email(data.email),
        "class_name": validate_class_name(data.class_name),
        "password": validate_password(data.password),
    }
    errors = {k: v for k, v in checks.items() if v}
    if not data.confirm_password:
        errors["confirm_password"] = "Konfirmasi password wajib diisi."
    elif data.confirm_password != data.password:
        errors["confirm_password"] = "Konfirmasi password tidak sama dengan password."
    return errors


def validate_login(email: str, password: str) -> dict[str, str]:
    errors: dict[str, str] = {}
    e = validate_email(email)
    if e:
        errors["email"] = e
    if not password:
        errors["password"] = "Password wajib diisi."
    return errors


def validate_measurement(raw: str, parsed: float | None) -> str | None:
    """Validasi input kalkulator keliling (kosong, bukan angka, negatif, nol, terlalu besar)."""
    if not raw.strip():
        return "Masukkan angka terlebih dahulu."
    if parsed is None:
        return "Input harus berupa angka, contoh: 14 atau 7,5."
    if parsed < 0:
        return "Ukuran tidak boleh negatif. Panjang selalu bernilai positif."
    if parsed == 0:
        return "Ukuran harus lebih dari 0."
    if parsed > 1_000_000:
        return "Angkanya terlalu besar untuk laboratorium ini (maks. 1.000.000)."
    return None


def is_private_path(pathname: str) -> bool:
    """Halaman yang wajib login."""
    return any(pathname == p or pathname.startswith(p + "/") for p in PRIVATE_PREFIXES)


def safe_next(next_path: str | None, fallback: str = "/dashboard") -> str:
    """Mencegah open redirect: hanya izinkan path internal."""
    if not next_path or not next_path.startswith("/") or next_path.startswith("//") or next_path.startswith("/\\"):
        return fallback
    return next_path
