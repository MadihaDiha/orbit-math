/** Menerjemahkan pesan error Supabase menjadi bahasa yang mudah dipahami siswa. */
export function friendlyError(err: unknown): string {
  let raw = "";
  if (err instanceof Error) raw = err.message;
  else if (typeof err === "object" && err !== null && "message" in err) raw = String((err as { message: unknown }).message);
  else raw = String(err ?? "");
  const msg = raw.toLowerCase();

  if (msg.includes("supabase_not_configured")) return "Supabase belum dikonfigurasi. Isi file .env.local sesuai README.";
  if (msg.includes("invalid login credentials")) return "Email atau password salah. Coba periksa lagi, ya!";
  if (msg.includes("email not confirmed")) return "Email belum diverifikasi. Cek kotak masuk emailmu dan klik tautan verifikasi.";
  if (msg.includes("user already registered") || msg.includes("already been registered")) return "Email ini sudah terdaftar. Silakan login.";
  if (msg.includes("database error saving new user")) return "Akun gagal dibuat. Kemungkinan username sudah dipakai — coba username lain.";
  if (msg.includes("duplicate key") || msg.includes("profiles_username_key")) return "Username sudah dipakai penjelajah lain.";
  if (msg.includes("password should be at least")) return "Password terlalu pendek.";
  if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("security purposes")) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "Koneksi ke server terputus. Periksa internetmu.";
  if (msg.includes("new password should be different")) return "Password baru harus berbeda dari password lama.";
  if (msg.includes("auth session missing") || msg.includes("not_authenticated")) return "Sesi login berakhir. Silakan login kembali.";
  if (msg.includes("lesson_locked")) return "Misi ini masih terkunci. Selesaikan misi sebelumnya dulu.";
  if (msg.includes("exam_locked")) return "Evaluasi akhir terbuka setelah Misi 6 selesai.";
  if (msg.includes("quiz_not_passed")) return "Selesaikan mini quiz dengan nilai minimal 60 terlebih dahulu.";
  if (msg.includes("session_already_submitted")) return "Jawaban untuk sesi ini sudah dikumpulkan.";
  if (msg.includes("session_expired")) return "Sesi kuis sudah kedaluwarsa. Mulai ulang kuisnya.";
  if (msg.includes("daily_already_done")) return "Tantangan hari ini sudah kamu kerjakan. Kembali lagi besok!";
  if (msg.includes("quiz_empty") || msg.includes("quiz_not_found")) return "Soal belum tersedia. Pastikan seed.sql sudah dijalankan.";
  if (msg.includes("could not find the function") || msg.includes("does not exist") || msg.includes("schema cache"))
    return "Database belum disiapkan. Jalankan file migrasi & seed sesuai README.";
  return raw ? `Terjadi gangguan sinyal: ${raw}` : "Terjadi gangguan sinyal. Coba lagi sebentar lagi.";
}
