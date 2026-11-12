# ORBIT MATH 🪐
### *Explore the Galaxy, Master Mathematics!*

🌐 **Coba langsung (Mode Demo):** https://madihadiha.github.io/orbit-math/

**ORBIT MATH** adalah platform pembelajaran matematika interaktif untuk siswa **SMP kelas VIII** dengan materi utama **Keliling Lingkaran**. Siswa berperan sebagai penjelajah luar angkasa yang membuka wilayah galaksi satu per satu bersama **BIMO**, astronaut kecil berkostum biru-putih beraksen cyan.

Semua fitur terhubung ke **Supabase** (Auth + PostgreSQL + Row Level Security). Siswa **wajib registrasi/login** sebelum mengakses halaman belajar.

> 🧪 **Mode Demo** — Selama variabel Supabase belum diisi, ORBIT MATH berjalan otomatis dalam *Mode Demo*: siswa tetap harus "masuk" (nama, username, kelas) sebelum belajar, tetapi akun & progres disimpan di **localStorage browser** (tanpa email/password, tidak tersinkron antar-perangkat). Penilaian, XP anti-refresh, level, bintang, lencana, dan tantangan harian memakai logika yang sama dengan fungsi SQL dan bank soal yang sama (`src/content/questionBank.ts` dihasilkan dari `supabase/seed.sql` oleh modul Python `orbit_math.bank` lewat `npm run gen:bank`). Begitu `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` diisi, Mode Demo nonaktif dan aplikasi memakai Supabase Auth + database.

---

## Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Teknologi](#teknologi)
3. [Struktur Folder](#struktur-folder)
4. [Instalasi](#instalasi)
5. [Membuat Proyek Supabase](#membuat-proyek-supabase)
6. [Konfigurasi Supabase](#konfigurasi-supabase)
7. [Menjalankan Migrasi Database & Seed](#menjalankan-migrasi-database--seed)
8. [Menjalankan Aplikasi](#menjalankan-aplikasi)
9. [Pengujian](#pengujian)
10. [Deployment ke Vercel](#deployment-ke-vercel)
11. [Keamanan](#keamanan)
12. [Rancangan Database](#rancangan-database)

---

## Fitur Utama

| Area | Isi |
|---|---|
| **Landing page** | Hero BIMO + planet, Tentang, materi yang dipelajari, fitur unggulan, cara menggunakan. |
| **Autentikasi** | Registrasi (nama, username unik, email, kelas, password + konfirmasi), login (tampil/sembunyi password), lupa & reset password via email, logout. |
| **Perlindungan halaman** | Middleware + pemeriksaan sesi di server. Belum login → `/login?next=…`; sudah login membuka `/login` → `/dashboard`. |
| **Space Control Center** | Sapaan, level & XP, progres %, misi selesai, planet terbuka, streak, lencana, aktivitas terakhir, rekomendasi misi, peta galaksi mini, **tantangan harian**. |
| **Galaxy Map** | 7 planet misi, terbuka berurutan, misi selesai bisa diulang, bintang 1–3 per misi. |
| **7 Misi** | Circle Station, Radius Base, Pi Observatory, Circle Motion, Formula Core, Real World Galaxy, Final Cosmic Mission — masing-masing berisi 15 komponen (tujuan, konsep, ilustrasi, istilah, contoh nyata, contoh soal bertahap, fakta, mini quiz, rangkuman, selesaikan misi, misi berikutnya) + aktivitas interaktif. |
| **Circle Laboratory** | Anatomi lingkaran interaktif (SVG), slider jari-jari, simulator roda berputar (mulai/jeda/ulangi), kalkulator keliling dengan validasi & langkah. |
| **Training Zone** | 3 level, 8 jenis soal (pilihan ganda, benar/salah, isian angka, identifikasi unsur, memasangkan, melengkapi rumus, menghitung, soal cerita), pembahasan saat salah. |
| **Cosmic Playground** | 5 game bermekanisme berbeda: Circle Hunter, Radius or Diameter?, Pi Detective, Orbit Calculation, BIMO Space Rescue. |
| **Final Examination** | Jumlah soal 10/15/20, timer opsional, navigasi nomor, tandai ragu, periksa ulang, skor otomatis, pembahasan, riwayat. |
| **Gamifikasi** | XP anti-refresh, 6 level astronaut, 10 lencana, bintang, koleksi wilayah, tantangan harian, streak. |
| **Profil & Riwayat** | Edit nama/username/kelas/warna avatar BIMO, statistik, sumber XP, log aktivitas dengan filter. |

## Teknologi

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, Lucide React, SVG + CSS Animation.
- **Backend:** Supabase Auth, PostgreSQL, Row Level Security, fungsi PL/pgSQL (RPC) untuk penilaian.
- **Pengujian:** `node:test` via `tsx`, ESLint, TypeScript compiler.

## Modul Python (`python/orbit_math`)

Logika inti ORBIT MATH juga tersedia sebagai paket **Python** (tanpa dependensi tambahan, Python ≥ 3.10):

| Modul | Isi |
|---|---|
| `circle.py` | Rumus d = 2r, K = πd = 2πr, kebalikannya, jarak tempuh roda, format & parsing angka Indonesia, kalkulator langkah demi langkah |
| `levels.py` | XP → level astronaut, progres level, bintang misi |
| `grading.py` | Penilaian jawaban (setara fungsi SQL `grade_answer`) & penilaian satu kuis |
| `validation.py` | Validasi registrasi/login, password, input kalkulator, proteksi rute & anti open-redirect |
| `games.py` | Generator soal & penilaian 5 mini game |
| `bank.py` | Membaca `supabase/seed.sql`, memvalidasi bank soal, menghasilkan `src/content/questionBank.ts` |
| `cli.py` | **Aplikasi terminal**: kalkulator keliling, Training Zone, game Orbit Calculation, rangkuman rumus |

```bash
cd python
python -m orbit_math                    # aplikasi terminal ORBIT MATH
python -m orbit_math.bank --check       # validasi bank soal
python -m unittest discover -s tests    # 35 unit test (juga memeriksa sinkron dengan TypeScript & SQL)
```

Dari root proyek: `npm run gen:bank` (generate bank soal) dan `npm run test:py`.

## Struktur Folder

```
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql      # tabel
│   │   ├── 0002_rls.sql         # Row Level Security & hak akses
│   │   └── 0003_functions.sql   # RPC: penilaian, XP, level, lencana, trigger profil
│   └── seed.sql                 # 7 misi, 12 kuis, ±110 soal, 5 game, 10 lencana
├── src/
│   ├── middleware.ts            # refresh sesi + proteksi rute
│   ├── app/
│   │   ├── page.tsx             # landing page (publik)
│   │   ├── (auth)/              # login, register, forgot-password, reset-password
│   │   ├── auth/callback|confirm# tukar kode email → sesi
│   │   └── (app)/               # HALAMAN PRIVAT: dashboard, galaxy, missions/[slug], lab,
│   │                            #   training, playground, exam, profile, history, achievements
│   ├── components/
│   │   ├── bimo/                # Maskot BIMO (SVG, 6 ekspresi, 6 warna kostum)
│   │   ├── circle/              # Diagram, anatomi, slider, simulator roda, kalkulator
│   │   ├── quiz/                # Input 8 jenis soal, Training, Mini quiz, Exam, pembahasan
│   │   ├── games/               # GameShell + 5 game
│   │   ├── missions/            # Aktivitas misi, mini quiz & tombol selesai
│   │   ├── cosmic/ nav/ reward/ dashboard/ profile/ history/ ui/
│   ├── content/missions.ts      # Konten materi 7 misi
│   └── lib/                     # supabase client/server, rpc, math, levels, validasi, games
├── python/orbit_math/           # logika inti & aplikasi terminal (Python) + python/tests
├── tests/                       # unit test JavaScript (math, level, validasi, game, demo)
├── .env.example
└── README.md
```

## Instalasi

Prasyarat: **Node.js 20 LTS atau lebih baru** (https://nodejs.org) dan akun **Supabase** (gratis).

```bash
npm install
```

## Membuat Proyek Supabase

1. Buka https://supabase.com → **Sign in** → **New project**.
2. Isi nama proyek (misal `orbit-math`), buat **database password**, pilih region terdekat (Singapore).
3. Tunggu hingga proyek siap (±2 menit).

## Konfigurasi Supabase

1. **Kunci API** — *Project Settings → API*: salin **Project URL** dan **anon / publishable key**.
2. Salin `.env.example` menjadi `.env.local` lalu isi:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   > ⚠️ **Jangan** memasukkan `service_role` key ke file ini atau ke frontend.
3. **URL autentikasi** — *Authentication → URL Configuration*:
   - **Site URL:** `http://localhost:3000` (ganti dengan domain Vercel saat produksi).
   - **Redirect URLs:** tambahkan `http://localhost:3000/auth/callback` dan `https://<domain-vercel>/auth/callback`.
4. **Verifikasi email** — *Authentication → Providers → Email*:
   - **Confirm email ON** (disarankan): siswa harus klik tautan di email sebelum login.
   - **Confirm email OFF**: siswa langsung masuk dashboard setelah registrasi (praktis untuk uji coba di kelas).
5. *(Opsional)* Jika memakai template email berbasis `token_hash`, arahkan tautan ke `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (atau `type=recovery` untuk reset password). Route `/auth/confirm` sudah tersedia.

## Menjalankan Migrasi Database & Seed

**Cara A — SQL Editor (paling mudah)**
Buka *SQL Editor → New query*, lalu jalankan isi file berikut **berurutan**:
1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_functions.sql`
4. `supabase/seed.sql`

**Cara B — Supabase CLI**
```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push               # menjalankan folder migrations
psql "<connection-string>" -f supabase/seed.sql   # atau tempel seed.sql di SQL Editor
```

Seed aman dijalankan ulang (idempotent). Menjalankan ulang seed akan mengganti bank soal.

## Menjalankan Aplikasi

```bash
npm run dev      # mode pengembangan → http://localhost:3000
npm run build    # build produksi
npm start        # menjalankan hasil build
```

Tanpa `.env.local`, aplikasi berjalan dalam **Mode Demo** (lihat penjelasan di atas) — cocok untuk mencoba semua fitur atau demo di kelas. Untuk login asli dan penyimpanan di server, isi `.env.local` lalu jalankan ulang.

## Pengujian

### Otomatis
```bash
npm test           # unit test: rumus keliling, parsing angka, level XP (cocok dgn SQL), validasi form, anti open-redirect, logika 5 game
npm run typecheck  # pemeriksaan TypeScript
npm run lint       # ESLint
npm run build      # memastikan tidak ada error build
```

### Manual (setelah Supabase dikonfigurasi)
| Area | Langkah | Hasil yang diharapkan |
|---|---|---|
| Registrasi | Daftar dengan data valid | Akun dibuat; baris baru di `profiles` & `user_stats` |
| Validasi | Kosongkan kolom / password beda / username dipakai | Pesan kesalahan jelas per kolom |
| Login | Password salah | "Email atau password salah" |
| Proteksi | Buka `/dashboard` dalam jendela penyamaran | Diarahkan ke `/login?next=/dashboard`, setelah login kembali ke dashboard |
| Lupa password | Kirim email, klik tautan | Masuk `/reset-password`, password baru tersimpan |
| Misi | Buka Misi 2 sebelum Misi 1 selesai | Terkunci |
| Mini quiz | Kerjakan, nilai ≥ 60, tekan Selesaikan Misi | +XP, lencana First Discovery, Misi 2 terbuka |
| Anti-refresh XP | Tekan Selesaikan Misi lagi / refresh | XP tidak bertambah |
| Lab | Geser slider, jalankan roda, kalkulator input `-5`/`abc`/kosong | Nilai berubah otomatis; validasi muncul |
| Game | Mainkan kelima game | Skor tersimpan di `game_attempts`, muncul di Riwayat |
| Evaluasi | Selesaikan Misi 1–6 → Final Exam | Navigasi nomor, timer, review, skor & pembahasan, riwayat tersimpan |
| Logout | Keluar lalu login lagi | Progres, XP, lencana tetap |
| RLS | Login sebagai siswa B, coba `select * from lesson_progress` via API | Hanya baris milik siswa B |

## Deployment ke GitHub Pages (Mode Demo)

Situs demo statis di https://madihadiha.github.io/orbit-math/ dibuat dari branch `main` dengan:

```bash
npm run build:pages          # menghasilkan folder out/ (basePath /orbit-math)
cd out && git init -b gh-pages && git add -A && git commit -m "Deploy" \
  && git remote add origin https://github.com/MadihaDiha/orbit-math.git && git push -f origin gh-pages
```

GitHub Pages (Settings → Pages) membaca branch `gh-pages`. Versi statis selalu berjalan dalam Mode Demo karena GitHub Pages tidak menjalankan server; untuk login asli Supabase gunakan Vercel (di bawah).

## Deployment ke Vercel

1. Push proyek ke GitHub.
2. Di https://vercel.com → **Add New Project** → impor repositori (framework terdeteksi: Next.js).
3. Tambahkan *Environment Variables*: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL=https://<proyek>.vercel.app`.
4. **Deploy**.
5. Kembali ke Supabase → *Authentication → URL Configuration*: ubah **Site URL** ke domain Vercel dan tambahkan `https://<proyek>.vercel.app/auth/callback` ke Redirect URLs.

## Keamanan

- **Password** dikelola Supabase Auth (bcrypt). Aplikasi tidak pernah menyimpan password.
- **RLS aktif di semua tabel.** Siswa hanya dapat `SELECT` baris miliknya (`auth.uid() = user_id`) dan hanya boleh mengubah kolom profil tertentu (nama, username, kelas, warna avatar).
- **Anti-manipulasi skor:** klien tidak bisa menulis langsung ke tabel progres, skor, XP, atau lencana. Semua lewat fungsi `SECURITY DEFINER`:
  - `start_quiz` mengirim soal **tanpa kunci jawaban** (tabel `quiz_questions` tidak bisa dibaca klien).
  - `submit_quiz` menilai di server hanya untuk soal di sesi itu dan hanya sekali per sesi.
  - `award_xp` memakai `source_key` unik → XP tidak bertambah karena refresh/klik ulang.
  - `submit_game` membatasi skor ke rentang sah (0…skor maksimal). *Catatan:* permainan berjalan di browser, sehingga skor game tetap berasal dari klien; dampaknya dibatasi oleh batas skor dan XP sekali-per-game/per-hari.
- **Sesi** divalidasi dengan `auth.getUser()` di middleware dan di layout server.
- **Open redirect** dicegah (`safeNext` hanya menerima path internal).
- **Service role key tidak digunakan** sama sekali.

## Rancangan Database

| Tabel | Fungsi |
|---|---|
| `profiles` | Profil siswa (1:1 `auth.users`): nama, username unik, email, kelas, avatar, tanggal daftar |
| `lessons` | 7 misi |
| `lesson_progress` | Status misi per siswa, nilai mini quiz terbaik, bintang |
| `quizzes` | Mini quiz, Training L1–L3, Final Exam, Tantangan Harian |
| `quiz_questions` | Bank soal + kunci + pembahasan (tersembunyi dari klien) |
| `quiz_sessions` | Daftar soal yang dibagikan per sesi (dasar penilaian server) |
| `quiz_attempts` | Nilai latihan & evaluasi |
| `games` / `game_attempts` | Data & hasil 5 permainan |
| `user_stats` | Total XP, level, bintang, streak |
| `xp_events` | Buku besar XP (unik per sumber) |
| `achievements` / `user_achievements` | Lencana & yang diperoleh |
| `daily_challenge_attempts` | Satu percobaan tantangan harian per hari |
| `activity_logs` | Riwayat aktivitas |

Total XP & level siswa dihitung otomatis saat XP diberikan; ambang level (`0, 150, 400, 800, 1400, 2200`) sama di `src/lib/levels.ts` dan `private.level_for_xp()` — diverifikasi oleh unit test.

---

© ORBIT MATH — Media pembelajaran Keliling Lingkaran SMP Kelas VIII bersama BIMO.
