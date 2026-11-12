export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  className: string;
  password: string;
  confirmPassword: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email wajib diisi.";
  if (!EMAIL_RE.test(email.trim())) return "Format email belum benar, contoh: nama@email.com";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password wajib diisi.";
  if (password.length < 8) return "Password minimal 8 karakter.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Password harus berisi huruf dan angka.";
  return undefined;
}

export function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;
  const labels = ["Sangat lemah", "Lemah", "Cukup", "Kuat", "Sangat kuat"];
  return { score, label: labels[score] };
}

export function validateFullName(name: string): string | undefined {
  const n = name.trim();
  if (!n) return "Nama lengkap wajib diisi.";
  if (n.length < 2) return "Nama lengkap terlalu pendek.";
  if (n.length > 80) return "Nama lengkap maksimal 80 karakter.";
  return undefined;
}

export function validateUsername(username: string): string | undefined {
  const u = username.trim();
  if (!u) return "Username wajib diisi.";
  if (!USERNAME_RE.test(u)) return "Username 3–20 karakter: huruf kecil, angka, atau garis bawah (_).";
  return undefined;
}

export function validateClassName(cls: string): string | undefined {
  const c = cls.trim();
  if (!c) return "Kelas wajib diisi.";
  if (c.length > 20) return "Kelas maksimal 20 karakter.";
  return undefined;
}

export function validateRegister(input: RegisterInput): FieldErrors<RegisterInput> {
  const errors: FieldErrors<RegisterInput> = {};
  const set = (k: keyof RegisterInput, v: string | undefined) => {
    if (v) errors[k] = v;
  };
  set("fullName", validateFullName(input.fullName));
  set("username", validateUsername(input.username));
  set("email", validateEmail(input.email));
  set("className", validateClassName(input.className));
  set("password", validatePassword(input.password));
  if (!input.confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi.";
  else if (input.confirmPassword !== input.password) errors.confirmPassword = "Konfirmasi password tidak sama dengan password.";
  return errors;
}

export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  const e = validateEmail(email);
  if (e) errors.email = e;
  if (!password) errors.password = "Password wajib diisi.";
  return errors;
}

/** Validasi input kalkulator keliling. */
export function validateMeasurement(raw: string, parsed: number | null): string | undefined {
  if (!raw.trim()) return "Masukkan angka terlebih dahulu.";
  if (parsed === null) return "Input harus berupa angka, contoh: 14 atau 7,5.";
  if (parsed < 0) return "Ukuran tidak boleh negatif. Panjang selalu bernilai positif.";
  if (parsed === 0) return "Ukuran harus lebih dari 0.";
  if (parsed > 1_000_000) return "Angkanya terlalu besar untuk laboratorium ini (maks. 1.000.000).";
  return undefined;
}
