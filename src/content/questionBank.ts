// FILE INI DIHASILKAN OTOMATIS oleh scripts/gen-question-bank.mjs dari supabase/seed.sql.
// Jangan diedit manual â€” ubah seed.sql lalu jalankan `npm run gen:bank`.
import type { BankAchievement, BankGame, BankLesson, BankQuestion, BankQuiz } from "./bank-types";

export const BANK_LESSONS: BankLesson[] = [
  {
    "id": 1,
    "slug": "circle-station",
    "title": "Mengenal Lingkaran",
    "planet_name": "Circle Station",
    "xp_reward": 100
  },
  {
    "id": 2,
    "slug": "radius-base",
    "title": "Unsur-Unsur Lingkaran",
    "planet_name": "Radius Base",
    "xp_reward": 100
  },
  {
    "id": 3,
    "slug": "pi-observatory",
    "title": "Memahami Nilai Pi",
    "planet_name": "Pi Observatory",
    "xp_reward": 100
  },
  {
    "id": 4,
    "slug": "circle-motion",
    "title": "Konsep Keliling Lingkaran",
    "planet_name": "Circle Motion",
    "xp_reward": 100
  },
  {
    "id": 5,
    "slug": "formula-core",
    "title": "Rumus Keliling Lingkaran",
    "planet_name": "Formula Core",
    "xp_reward": 120
  },
  {
    "id": 6,
    "slug": "real-world-galaxy",
    "title": "Penerapan Keliling Lingkaran",
    "planet_name": "Real World Galaxy",
    "xp_reward": 120
  },
  {
    "id": 7,
    "slug": "final-cosmic-mission",
    "title": "Evaluasi Keseluruhan",
    "planet_name": "Final Cosmic Mission",
    "xp_reward": 150
  }
];

export const BANK_QUIZZES: BankQuiz[] = [
  {
    "slug": "lesson-1",
    "title": "Mini Quiz Misi 1 — Circle Station",
    "kind": "lesson",
    "lesson_id": 1,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 5,
    "shuffle": false
  },
  {
    "slug": "lesson-2",
    "title": "Mini Quiz Misi 2 — Radius Base",
    "kind": "lesson",
    "lesson_id": 2,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 5,
    "shuffle": false
  },
  {
    "slug": "lesson-3",
    "title": "Mini Quiz Misi 3 — Pi Observatory",
    "kind": "lesson",
    "lesson_id": 3,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 5,
    "shuffle": false
  },
  {
    "slug": "lesson-4",
    "title": "Mini Quiz Misi 4 — Circle Motion",
    "kind": "lesson",
    "lesson_id": 4,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 5,
    "shuffle": false
  },
  {
    "slug": "lesson-5",
    "title": "Mini Quiz Misi 5 — Formula Core",
    "kind": "lesson",
    "lesson_id": 5,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 5,
    "shuffle": false
  },
  {
    "slug": "lesson-6",
    "title": "Mini Quiz Misi 6 — Real World Galaxy",
    "kind": "lesson",
    "lesson_id": 6,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 5,
    "shuffle": false
  },
  {
    "slug": "lesson-7",
    "title": "Mini Quiz Misi 7 — Pemanasan Final",
    "kind": "lesson",
    "lesson_id": 7,
    "level": null,
    "pass_score": 60,
    "xp_reward": 0,
    "default_count": 6,
    "shuffle": false
  },
  {
    "slug": "training-1",
    "title": "Training Level 1 — Beginner Explorer",
    "kind": "training",
    "lesson_id": null,
    "level": 1,
    "pass_score": 70,
    "xp_reward": 50,
    "default_count": 10,
    "shuffle": true
  },
  {
    "slug": "training-2",
    "title": "Training Level 2 — Space Navigator",
    "kind": "training",
    "lesson_id": null,
    "level": 2,
    "pass_score": 70,
    "xp_reward": 75,
    "default_count": 10,
    "shuffle": true
  },
  {
    "slug": "training-3",
    "title": "Training Level 3 — Galaxy Expert",
    "kind": "training",
    "lesson_id": null,
    "level": 3,
    "pass_score": 70,
    "xp_reward": 100,
    "default_count": 8,
    "shuffle": true
  },
  {
    "slug": "exam",
    "title": "Final Examination",
    "kind": "exam",
    "lesson_id": null,
    "level": null,
    "pass_score": 70,
    "xp_reward": 200,
    "default_count": 20,
    "shuffle": true
  },
  {
    "slug": "daily",
    "title": "Tantangan Harian",
    "kind": "daily",
    "lesson_id": null,
    "level": null,
    "pass_score": 100,
    "xp_reward": 30,
    "default_count": 1,
    "shuffle": false
  }
];

export const BANK_GAMES: BankGame[] = [
  {
    "id": 1,
    "slug": "circle-hunter",
    "title": "Circle Hunter",
    "description": "Temukan semua benda berbentuk lingkaran sebelum waktu habis.",
    "max_score": 200,
    "pass_score": 120,
    "xp_reward": 50
  },
  {
    "id": 2,
    "slug": "radius-or-diameter",
    "title": "Radius or Diameter?",
    "description": "Tentukan jenis garis yang menyala pada diagram lingkaran.",
    "max_score": 100,
    "pass_score": 70,
    "xp_reward": 50
  },
  {
    "id": 3,
    "slug": "pi-detective",
    "title": "Pi Detective",
    "description": "Buka petunjuk dan pecahkan kasus misteri nilai π.",
    "max_score": 180,
    "pass_score": 100,
    "xp_reward": 50
  },
  {
    "id": 4,
    "slug": "orbit-calculation",
    "title": "Orbit Calculation",
    "description": "Hitung keliling orbit secara bertahap dan kumpulkan poin.",
    "max_score": 160,
    "pass_score": 100,
    "xp_reward": 60
  },
  {
    "id": 5,
    "slug": "bimo-space-rescue",
    "title": "BIMO Space Rescue",
    "description": "Isi energi pesawat BIMO dengan menjawab soal keliling.",
    "max_score": 100,
    "pass_score": 60,
    "xp_reward": 75
  }
];

export const BANK_ACHIEVEMENTS: BankAchievement[] = [
  {
    "slug": "first-discovery",
    "title": "First Discovery",
    "description": "Menyelesaikan misi pertama.",
    "icon": "rocket",
    "xp_reward": 25,
    "sort_order": 1
  },
  {
    "slug": "radius-specialist",
    "title": "Radius Specialist",
    "description": "Memahami jari-jari dan diameter (Misi 2 selesai).",
    "icon": "ruler",
    "xp_reward": 25,
    "sort_order": 2
  },
  {
    "slug": "pi-detective",
    "title": "Pi Detective",
    "description": "Menyelesaikan misi nilai π (Misi 3 selesai).",
    "icon": "search",
    "xp_reward": 25,
    "sort_order": 3
  },
  {
    "slug": "circle-explorer",
    "title": "Circle Explorer",
    "description": "Menyelesaikan seluruh materi lingkaran (Misi 1–6).",
    "icon": "orbit",
    "xp_reward": 75,
    "sort_order": 4
  },
  {
    "slug": "formula-master",
    "title": "Formula Master",
    "description": "Lulus latihan rumus keliling (Training Level 2).",
    "icon": "sigma",
    "xp_reward": 50,
    "sort_order": 5
  },
  {
    "slug": "cosmic-calculator",
    "title": "Cosmic Calculator",
    "description": "Berhasil menuntaskan tantangan Orbit Calculation.",
    "icon": "calculator",
    "xp_reward": 50,
    "sort_order": 6
  },
  {
    "slug": "daily-hero",
    "title": "Daily Spark",
    "description": "Menjawab benar Tantangan Harian.",
    "icon": "zap",
    "xp_reward": 25,
    "sort_order": 7
  },
  {
    "slug": "game-explorer",
    "title": "Playground Voyager",
    "description": "Memainkan kelima permainan di Cosmic Playground.",
    "icon": "gamepad",
    "xp_reward": 50,
    "sort_order": 8
  },
  {
    "slug": "galaxy-champion",
    "title": "Galaxy Champion",
    "description": "Lulus Evaluasi Akhir (Final Examination).",
    "icon": "trophy",
    "xp_reward": 100,
    "sort_order": 9
  },
  {
    "slug": "perfect-orbit",
    "title": "Perfect Orbit",
    "description": "Meraih nilai sempurna 100 pada Evaluasi Akhir.",
    "icon": "star",
    "xp_reward": 100,
    "sort_order": 10
  }
];

export const BANK_QUESTIONS: BankQuestion[] = [
  {
    "id": 1,
    "quiz": "lesson-1",
    "qtype": "mcq",
    "topic": "Pengertian lingkaran",
    "difficulty": 1,
    "prompt": "Lingkaran adalah kumpulan titik-titik yang ...",
    "options": [
      "berjarak sama terhadap satu titik pusat",
      "membentuk sudut siku-siku",
      "mempunyai empat sisi sama panjang",
      "tersusun dalam satu garis lurus"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Lingkaran adalah kumpulan semua titik yang jaraknya SAMA terhadap satu titik tertentu, yaitu titik pusat.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 2,
    "quiz": "lesson-1",
    "qtype": "true_false",
    "topic": "Pengertian lingkaran",
    "difficulty": 1,
    "prompt": "Setiap titik pada lingkaran memiliki jarak yang sama ke titik pusat.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. Jarak yang sama itu disebut jari-jari. Inilah ciri utama lingkaran.",
    "illustration": "anatomy:radius",
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 3,
    "quiz": "lesson-1",
    "qtype": "mcq",
    "topic": "Benda berbentuk lingkaran",
    "difficulty": 1,
    "prompt": "Manakah benda berikut yang permukaannya berbentuk lingkaran?",
    "options": [
      "Papan tulis",
      "Uang koin",
      "Buku tulis",
      "Penggaris"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Permukaan uang koin berbentuk lingkaran. Papan tulis, buku, dan penggaris berbentuk persegi panjang.",
    "illustration": null,
    "unit": null,
    "sort_order": 3
  },
  {
    "id": 4,
    "quiz": "lesson-1",
    "qtype": "true_false",
    "topic": "Karakteristik lingkaran",
    "difficulty": 1,
    "prompt": "Lingkaran mempunyai titik sudut seperti segitiga.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Salah. Lingkaran dibentuk oleh garis lengkung yang mulus, jadi tidak mempunyai titik sudut maupun sisi lurus.",
    "illustration": null,
    "unit": null,
    "sort_order": 4
  },
  {
    "id": 5,
    "quiz": "lesson-1",
    "qtype": "mcq",
    "topic": "Titik pusat",
    "difficulty": 1,
    "prompt": "Titik yang berada tepat di tengah lingkaran disebut ...",
    "options": [
      "Titik sudut",
      "Titik pusat",
      "Titik potong",
      "Titik puncak"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Titik di tengah lingkaran disebut titik pusat. Semua titik pada lingkaran berjarak sama ke titik ini.",
    "illustration": "anatomy:center",
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 6,
    "quiz": "lesson-2",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Garis yang menyala pada gambar adalah ...",
    "options": [
      "Jari-jari",
      "Diameter",
      "Tali busur",
      "Busur"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Garis itu menghubungkan titik pusat dengan satu titik pada lingkaran, jadi namanya jari-jari (r).",
    "illustration": "anatomy:radius",
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 7,
    "quiz": "lesson-2",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Sebuah lingkaran memiliki jari-jari 9 cm. Berapa panjang diameternya?",
    "options": null,
    "answer": {
      "value": 18
    },
    "explanation": "d = 2 × r = 2 × 9 = 18 cm. Diameter selalu dua kali jari-jari.",
    "illustration": "circle-r:9 cm",
    "unit": "cm",
    "sort_order": 2
  },
  {
    "id": 8,
    "quiz": "lesson-2",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Diameter sebuah piring 26 cm. Berapa panjang jari-jarinya?",
    "options": null,
    "answer": {
      "value": 13
    },
    "explanation": "r = d ÷ 2 = 26 ÷ 2 = 13 cm. Jari-jari adalah setengah diameter.",
    "illustration": "circle-d:26 cm",
    "unit": "cm",
    "sort_order": 3
  },
  {
    "id": 9,
    "quiz": "lesson-2",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Garis yang menyala pada gambar adalah ...",
    "options": [
      "Diameter",
      "Jari-jari",
      "Tali busur",
      "Juring"
    ],
    "answer": {
      "index": 2
    },
    "explanation": "Garis lurus yang menghubungkan dua titik pada lingkaran TANPA melalui titik pusat disebut tali busur.",
    "illustration": "anatomy:chord",
    "unit": null,
    "sort_order": 4
  },
  {
    "id": 10,
    "quiz": "lesson-2",
    "qtype": "match",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Pasangkan setiap istilah dengan pengertiannya.",
    "options": {
      "left": [
        "Busur",
        "Juring",
        "Tembereng"
      ],
      "right": [
        "Daerah yang dibatasi tali busur dan busur",
        "Bagian dari keliling lingkaran (garis lengkung)",
        "Daerah yang dibatasi dua jari-jari dan busur"
      ]
    },
    "answer": {
      "pairs": [
        1,
        2,
        0
      ]
    },
    "explanation": "Busur = garis lengkung bagian keliling. Juring = daerah \"potongan pizza\" antara dua jari-jari dan busur. Tembereng = daerah antara tali busur dan busur.",
    "illustration": null,
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 11,
    "quiz": "lesson-3",
    "qtype": "mcq",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "Nilai π diperoleh dari perbandingan ...",
    "options": [
      "keliling dengan diameter",
      "keliling dengan jari-jari",
      "diameter dengan jari-jari",
      "luas dengan keliling"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "π = K ÷ d. Untuk lingkaran sebesar apa pun, keliling dibagi diameter hasilnya selalu sekitar 3,14.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 12,
    "quiz": "lesson-3",
    "qtype": "mcq",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "Pendekatan nilai π dalam bentuk desimal yang sering digunakan adalah ...",
    "options": [
      "2,14",
      "3,14",
      "3,41",
      "4,13"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "π = 3,14159... biasanya dibulatkan menjadi 3,14.",
    "illustration": null,
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 13,
    "quiz": "lesson-3",
    "qtype": "mcq",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "Bentuk pecahan yang mendekati nilai π adalah ...",
    "options": [
      "7/22",
      "22/7",
      "14/3",
      "3/14"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "22/7 = 3,142857... sangat dekat dengan π. Hati-hati, 7/22 itu terbalik!",
    "illustration": null,
    "unit": null,
    "sort_order": 3
  },
  {
    "id": 14,
    "quiz": "lesson-3",
    "qtype": "mcq",
    "topic": "Memilih nilai pi",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 21 cm. Nilai π yang paling memudahkan perhitungan adalah ...",
    "options": [
      "22/7 karena 21 habis dibagi 7",
      "3,14 karena selalu lebih tepat",
      "22/7 karena 21 bilangan genap",
      "Tidak perlu memakai π"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Gunakan 22/7 bila ukuran merupakan kelipatan 7, karena angka 7 bisa langsung dicoret: 22/7 × 21 = 22 × 3 = 66.",
    "illustration": null,
    "unit": null,
    "sort_order": 4
  },
  {
    "id": 15,
    "quiz": "lesson-3",
    "qtype": "true_false",
    "topic": "Nilai pi",
    "difficulty": 2,
    "prompt": "Nilai π untuk lingkaran besar lebih besar daripada untuk lingkaran kecil.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Salah. π adalah konstanta, artinya nilainya tetap untuk SEMUA lingkaran, besar maupun kecil.",
    "illustration": null,
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 16,
    "quiz": "lesson-4",
    "qtype": "mcq",
    "topic": "Konsep keliling",
    "difficulty": 1,
    "prompt": "Keliling lingkaran adalah ...",
    "options": [
      "panjang garis lengkung yang mengelilingi lingkaran",
      "daerah di dalam lingkaran",
      "jarak dari pusat ke tepi",
      "garis yang melalui pusat"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Keliling adalah panjang lintasan satu putaran penuh di tepi lingkaran. Daerah di dalam lingkaran adalah luas, bukan keliling.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 17,
    "quiz": "lesson-4",
    "qtype": "true_false",
    "topic": "Satu putaran",
    "difficulty": 1,
    "prompt": "Jarak yang ditempuh roda saat berputar satu kali penuh (tanpa tergelincir) sama dengan keliling roda.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. Saat roda berputar satu kali, seluruh tepi roda menyentuh jalan tepat satu kali, sehingga jaraknya = keliling roda.",
    "illustration": "wheel:1 putaran",
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 18,
    "quiz": "lesson-4",
    "qtype": "mcq",
    "topic": "Hubungan keliling dan diameter",
    "difficulty": 2,
    "prompt": "Jika diameter lingkaran diperbesar dua kali, kelilingnya menjadi ...",
    "options": [
      "tetap",
      "dua kali semula",
      "empat kali semula",
      "setengah kali semula"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "K = π × d. Jika d menjadi 2d, maka K menjadi π × 2d = 2 × (π × d). Jadi keliling juga dua kali semula.",
    "illustration": null,
    "unit": null,
    "sort_order": 3
  },
  {
    "id": 19,
    "quiz": "lesson-4",
    "qtype": "mcq",
    "topic": "Hubungan keliling dan diameter",
    "difficulty": 1,
    "prompt": "Keliling lingkaran kira-kira berapa kali panjang diameternya?",
    "options": [
      "2 kali",
      "3,14 kali",
      "4 kali",
      "1,5 kali"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Keliling ≈ 3,14 × diameter. Angka 3,14 inilah yang disebut π.",
    "illustration": null,
    "unit": null,
    "sort_order": 4
  },
  {
    "id": 20,
    "quiz": "lesson-4",
    "qtype": "numeric",
    "topic": "Satu putaran",
    "difficulty": 1,
    "prompt": "Keliling sebuah roda 88 cm. Berapa cm jarak yang ditempuh roda jika berputar 1 kali penuh?",
    "options": null,
    "answer": {
      "value": 88
    },
    "explanation": "Jarak satu putaran = keliling roda = 88 cm.",
    "illustration": "wheel:K = 88 cm",
    "unit": "cm",
    "sort_order": 5
  },
  {
    "id": 21,
    "quiz": "lesson-5",
    "qtype": "fill_formula",
    "topic": "Rumus keliling",
    "difficulty": 1,
    "prompt": "Lengkapi rumus: K = π × ___",
    "options": [
      "r",
      "d",
      "r²",
      "2d"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "K = π × d, dengan d adalah diameter.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 22,
    "quiz": "lesson-5",
    "qtype": "fill_formula",
    "topic": "Rumus keliling",
    "difficulty": 1,
    "prompt": "Lengkapi rumus: K = 2 × π × ___",
    "options": [
      "d",
      "r",
      "K",
      "π"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "K = 2 × π × r, dengan r adalah jari-jari. Ingat 2 × r = d.",
    "illustration": null,
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 23,
    "quiz": "lesson-5",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Hitung keliling lingkaran dengan diameter 14 cm. (π = 22/7)",
    "options": null,
    "answer": {
      "value": 44,
      "alt": [
        43.96
      ]
    },
    "explanation": "K = π × d = 22/7 × 14 = 22 × 2 = 44 cm.",
    "illustration": "circle-d:14 cm",
    "unit": "cm",
    "sort_order": 3
  },
  {
    "id": 24,
    "quiz": "lesson-5",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Hitung keliling lingkaran dengan jari-jari 10 cm. (π = 3,14)",
    "options": null,
    "answer": {
      "value": 62.8,
      "alt": [
        62.86
      ]
    },
    "explanation": "K = 2 × π × r = 2 × 3,14 × 10 = 62,8 cm.",
    "illustration": "circle-r:10 cm",
    "unit": "cm",
    "sort_order": 4
  },
  {
    "id": 25,
    "quiz": "lesson-5",
    "qtype": "true_false",
    "topic": "Hubungan dua rumus",
    "difficulty": 2,
    "prompt": "Rumus K = π × d dan K = 2 × π × r memberikan hasil yang sama, karena d = 2 × r.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. Karena d = 2 × r, maka π × d = π × 2 × r = 2 × π × r. Keduanya rumus yang sama dalam bentuk berbeda.",
    "illustration": null,
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 26,
    "quiz": "lesson-6",
    "qtype": "story",
    "topic": "Roda sepeda",
    "difficulty": 2,
    "prompt": "Roda sepeda Dimas berjari-jari 35 cm. Berapa cm jarak yang ditempuh roda dalam satu putaran? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 220,
      "alt": [
        219.8
      ]
    },
    "explanation": "Diketahui r = 35 cm. Jarak 1 putaran = keliling = 2 × 22/7 × 35 = 2 × 22 × 5 = 220 cm.",
    "illustration": "wheel:r = 35 cm",
    "unit": "cm",
    "sort_order": 1
  },
  {
    "id": 27,
    "quiz": "lesson-6",
    "qtype": "story",
    "topic": "Pagar taman",
    "difficulty": 2,
    "prompt": "Taman berbentuk lingkaran berdiameter 20 m akan dipagari mengelilinginya. Berapa meter panjang pagar yang diperlukan? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 62.8,
      "alt": [
        62.86
      ]
    },
    "explanation": "Panjang pagar = keliling taman = π × d = 3,14 × 20 = 62,8 m.",
    "illustration": "garden:d = 20 m",
    "unit": "m",
    "sort_order": 2
  },
  {
    "id": 28,
    "quiz": "lesson-6",
    "qtype": "story",
    "topic": "Meja bundar",
    "difficulty": 2,
    "prompt": "Meja bundar berdiameter 140 cm akan dipasangi pita di tepinya. Berapa cm panjang pita yang dibutuhkan? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 440,
      "alt": [
        439.6
      ]
    },
    "explanation": "Panjang pita = keliling meja = 22/7 × 140 = 22 × 20 = 440 cm.",
    "illustration": "table:d = 140 cm",
    "unit": "cm",
    "sort_order": 3
  },
  {
    "id": 29,
    "quiz": "lesson-6",
    "qtype": "story",
    "topic": "Jarak tempuh roda",
    "difficulty": 3,
    "prompt": "Roda berjari-jari 14 cm berputar 10 kali. Berapa cm jarak yang ditempuh? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 880,
      "alt": [
        879.2
      ]
    },
    "explanation": "Keliling = 2 × 22/7 × 14 = 88 cm. Jarak 10 putaran = 10 × 88 = 880 cm.",
    "illustration": "wheel:r = 14 cm",
    "unit": "cm",
    "sort_order": 4
  },
  {
    "id": 30,
    "quiz": "lesson-6",
    "qtype": "mcq",
    "topic": "Lintasan lari",
    "difficulty": 3,
    "prompt": "Lintasan lari berbentuk lingkaran dengan diameter 70 m. Rani berlari 2 putaran. Jarak yang ditempuh Rani adalah ... (π = 22/7)",
    "options": [
      "220 m",
      "440 m",
      "140 m",
      "880 m"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Keliling lintasan = 22/7 × 70 = 220 m. Dua putaran = 2 × 220 = 440 m.",
    "illustration": "track:d = 70 m",
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 31,
    "quiz": "lesson-7",
    "qtype": "mcq",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Hubungan diameter (d) dan jari-jari (r) yang benar adalah ...",
    "options": [
      "d = r ÷ 2",
      "d = 2 × r",
      "d = r + 2",
      "d = r × r"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Diameter terdiri dari dua jari-jari yang segaris, jadi d = 2 × r.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 32,
    "quiz": "lesson-7",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Daerah yang menyala pada gambar adalah ...",
    "options": [
      "Tembereng",
      "Juring",
      "Busur",
      "Tali busur"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Daerah yang dibatasi dua jari-jari dan sebuah busur disebut juring (bentuknya seperti potongan pizza).",
    "illustration": "anatomy:sector",
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 33,
    "quiz": "lesson-7",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Keliling lingkaran berjari-jari 21 cm adalah ... cm. (π = 22/7)",
    "options": null,
    "answer": {
      "value": 132,
      "alt": [
        131.88
      ]
    },
    "explanation": "K = 2 × 22/7 × 21 = 2 × 22 × 3 = 132 cm.",
    "illustration": "circle-r:21 cm",
    "unit": "cm",
    "sort_order": 3
  },
  {
    "id": 34,
    "quiz": "lesson-7",
    "qtype": "numeric",
    "topic": "Mencari diameter",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 31,4 cm. Berapa cm diameternya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 10
    },
    "explanation": "K = π × d, jadi d = K ÷ π = 31,4 ÷ 3,14 = 10 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 4
  },
  {
    "id": 35,
    "quiz": "lesson-7",
    "qtype": "true_false",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "Nilai π dapat dihitung dengan membagi keliling lingkaran dengan diameternya.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. π = K ÷ d.",
    "illustration": null,
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 36,
    "quiz": "lesson-7",
    "qtype": "story",
    "topic": "Jam dinding",
    "difficulty": 2,
    "prompt": "Sebuah jam dinding berdiameter 28 cm. Berapa cm panjang bingkai di tepi jam? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 88,
      "alt": [
        87.92
      ]
    },
    "explanation": "Panjang bingkai = keliling = 22/7 × 28 = 22 × 4 = 88 cm.",
    "illustration": "clock:d = 28 cm",
    "unit": "cm",
    "sort_order": 6
  },
  {
    "id": 37,
    "quiz": "training-1",
    "qtype": "mcq",
    "topic": "Benda berbentuk lingkaran",
    "difficulty": 1,
    "prompt": "Benda berikut yang BUKAN berbentuk lingkaran adalah ...",
    "options": [
      "Roda",
      "Jam dinding bundar",
      "Pintu kelas",
      "Tutup botol"
    ],
    "answer": {
      "index": 2
    },
    "explanation": "Pintu kelas berbentuk persegi panjang (punya 4 sisi lurus dan 4 sudut). Benda lainnya berbentuk lingkaran.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 38,
    "quiz": "training-1",
    "qtype": "true_false",
    "topic": "Karakteristik lingkaran",
    "difficulty": 1,
    "prompt": "Telur berbentuk lingkaran sempurna jika dilihat dari samping.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Salah. Telur berbentuk oval (lonjong). Jarak tepi ke titik tengahnya tidak sama di semua arah, jadi bukan lingkaran.",
    "illustration": null,
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 39,
    "quiz": "training-1",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Garis yang menyala pada gambar adalah ...",
    "options": [
      "Jari-jari",
      "Diameter",
      "Busur",
      "Tali busur"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Garis lurus yang melewati titik pusat dan menghubungkan dua titik pada lingkaran adalah diameter.",
    "illustration": "anatomy:diameter",
    "unit": null,
    "sort_order": 3
  },
  {
    "id": 40,
    "quiz": "training-1",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Bagian yang menyala pada gambar adalah ...",
    "options": [
      "Busur",
      "Tembereng",
      "Juring",
      "Diameter"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Garis lengkung yang merupakan bagian dari keliling lingkaran disebut busur.",
    "illustration": "anatomy:arc",
    "unit": null,
    "sort_order": 4
  },
  {
    "id": 41,
    "quiz": "training-1",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Daerah yang menyala pada gambar adalah ...",
    "options": [
      "Juring",
      "Tembereng",
      "Busur",
      "Jari-jari"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Daerah yang dibatasi tali busur dan busur disebut tembereng. Jika dibatasi dua jari-jari, namanya juring.",
    "illustration": "anatomy:segment",
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 42,
    "quiz": "training-1",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Garis yang menyala pada gambar adalah ...",
    "options": [
      "Diameter",
      "Tali busur",
      "Jari-jari",
      "Busur"
    ],
    "answer": {
      "index": 2
    },
    "explanation": "Garis dari titik pusat ke tepi lingkaran adalah jari-jari.",
    "illustration": "anatomy:radius",
    "unit": null,
    "sort_order": 6
  },
  {
    "id": 43,
    "quiz": "training-1",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Jari-jari lingkaran 12 cm. Berapa cm diameternya?",
    "options": null,
    "answer": {
      "value": 24
    },
    "explanation": "d = 2 × r = 2 × 12 = 24 cm.",
    "illustration": "circle-r:12 cm",
    "unit": "cm",
    "sort_order": 7
  },
  {
    "id": 44,
    "quiz": "training-1",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Diameter lingkaran 50 cm. Berapa cm jari-jarinya?",
    "options": null,
    "answer": {
      "value": 25
    },
    "explanation": "r = d ÷ 2 = 50 ÷ 2 = 25 cm.",
    "illustration": "circle-d:50 cm",
    "unit": "cm",
    "sort_order": 8
  },
  {
    "id": 45,
    "quiz": "training-1",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 2,
    "prompt": "Jari-jari sebuah roda mainan 7,5 cm. Berapa cm diameternya?",
    "options": null,
    "answer": {
      "value": 15
    },
    "explanation": "d = 2 × r = 2 × 7,5 = 15 cm.",
    "illustration": "wheel:r = 7,5 cm",
    "unit": "cm",
    "sort_order": 9
  },
  {
    "id": 46,
    "quiz": "training-1",
    "qtype": "match",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Pasangkan setiap istilah dengan pengertiannya.",
    "options": {
      "left": [
        "Titik pusat",
        "Jari-jari",
        "Diameter"
      ],
      "right": [
        "Garis dari pusat ke tepi lingkaran",
        "Titik tepat di tengah lingkaran",
        "Tali busur terpanjang yang melalui pusat"
      ]
    },
    "answer": {
      "pairs": [
        1,
        0,
        2
      ]
    },
    "explanation": "Titik pusat = titik di tengah. Jari-jari = garis pusat ke tepi. Diameter = tali busur terpanjang yang melewati pusat.",
    "illustration": null,
    "unit": null,
    "sort_order": 10
  },
  {
    "id": 47,
    "quiz": "training-1",
    "qtype": "true_false",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Diameter adalah tali busur yang paling panjang.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. Dari semua tali busur, yang melewati titik pusat (diameter) adalah yang terpanjang.",
    "illustration": "anatomy:diameter",
    "unit": null,
    "sort_order": 11
  },
  {
    "id": 48,
    "quiz": "training-1",
    "qtype": "mcq",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Garis lurus yang menghubungkan dua titik pada lingkaran tanpa melalui pusat disebut ...",
    "options": [
      "Jari-jari",
      "Tali busur",
      "Busur",
      "Juring"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Itulah tali busur. Busur berbentuk lengkung, sedangkan tali busur berbentuk lurus.",
    "illustration": "anatomy:chord",
    "unit": null,
    "sort_order": 12
  },
  {
    "id": 49,
    "quiz": "training-1",
    "qtype": "fill_formula",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Lengkapi rumus: d = ___ × r",
    "options": [
      "1",
      "2",
      "3",
      "π"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "d = 2 × r. Diameter sama dengan dua jari-jari.",
    "illustration": null,
    "unit": null,
    "sort_order": 13
  },
  {
    "id": 50,
    "quiz": "training-1",
    "qtype": "fill_formula",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Lengkapi rumus: r = d ÷ ___",
    "options": [
      "2",
      "π",
      "4",
      "r"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "r = d ÷ 2. Jari-jari adalah setengah diameter.",
    "illustration": null,
    "unit": null,
    "sort_order": 14
  },
  {
    "id": 51,
    "quiz": "training-2",
    "qtype": "mcq",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "π adalah hasil bagi ...",
    "options": [
      "K ÷ d",
      "K ÷ r",
      "d ÷ r",
      "r ÷ d"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "π = keliling ÷ diameter = K ÷ d.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 52,
    "quiz": "training-2",
    "qtype": "true_false",
    "topic": "Nilai pi",
    "difficulty": 2,
    "prompt": "Nilai π tepat sama dengan 3,14.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Salah. π = 3,14159265... angka desimalnya tidak pernah berakhir. 3,14 dan 22/7 hanyalah nilai pendekatan.",
    "illustration": null,
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 53,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 1,
    "prompt": "Diameter lingkaran 10 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 31.4,
      "alt": [
        31.43
      ]
    },
    "explanation": "K = π × d = 3,14 × 10 = 31,4 cm.",
    "illustration": "circle-d:10 cm",
    "unit": "cm",
    "sort_order": 3
  },
  {
    "id": 54,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 1,
    "prompt": "Jari-jari lingkaran 7 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 44,
      "alt": [
        43.96
      ]
    },
    "explanation": "K = 2 × π × r = 2 × 22/7 × 7 = 2 × 22 = 44 cm.",
    "illustration": "circle-r:7 cm",
    "unit": "cm",
    "sort_order": 4
  },
  {
    "id": 55,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Diameter lingkaran 28 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 88,
      "alt": [
        87.92
      ]
    },
    "explanation": "K = π × d = 22/7 × 28 = 22 × 4 = 88 cm.",
    "illustration": "circle-d:28 cm",
    "unit": "cm",
    "sort_order": 5
  },
  {
    "id": 56,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 1,
    "prompt": "Jari-jari lingkaran 5 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 31.4,
      "alt": [
        31.43
      ]
    },
    "explanation": "K = 2 × 3,14 × 5 = 31,4 cm.",
    "illustration": "circle-r:5 cm",
    "unit": "cm",
    "sort_order": 6
  },
  {
    "id": 57,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 20 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 125.6,
      "alt": [
        125.71
      ]
    },
    "explanation": "K = 2 × 3,14 × 20 = 125,6 cm.",
    "illustration": "circle-r:20 cm",
    "unit": "cm",
    "sort_order": 7
  },
  {
    "id": 58,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Diameter lingkaran 35 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 110,
      "alt": [
        109.9
      ]
    },
    "explanation": "K = 22/7 × 35 = 22 × 5 = 110 cm.",
    "illustration": "circle-d:35 cm",
    "unit": "cm",
    "sort_order": 8
  },
  {
    "id": 59,
    "quiz": "training-2",
    "qtype": "fill_formula",
    "topic": "Hubungan dua rumus",
    "difficulty": 2,
    "prompt": "K = 2 × π × r dapat juga ditulis K = π × ___ karena 2 × r = d.",
    "options": [
      "r",
      "d",
      "2d",
      "r²"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Karena 2 × r = d, maka 2 × π × r = π × d.",
    "illustration": null,
    "unit": null,
    "sort_order": 9
  },
  {
    "id": 60,
    "quiz": "training-2",
    "qtype": "mcq",
    "topic": "Memilih nilai pi",
    "difficulty": 2,
    "prompt": "Jika r = 49 cm, nilai π yang paling mudah digunakan adalah ...",
    "options": [
      "3,14",
      "22/7",
      "2,14",
      "7/22"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "49 = 7 × 7, kelipatan 7. Dengan 22/7, angka 7 bisa langsung dicoret.",
    "illustration": null,
    "unit": null,
    "sort_order": 10
  },
  {
    "id": 61,
    "quiz": "training-2",
    "qtype": "mcq",
    "topic": "Konsep keliling",
    "difficulty": 2,
    "prompt": "Keliling lingkaran berdiameter 1 m kira-kira ...",
    "options": [
      "1 m",
      "2 m",
      "3,14 m",
      "6,28 m"
    ],
    "answer": {
      "index": 2
    },
    "explanation": "K = π × 1 = 3,14 m. Keliling ≈ 3,14 kali diameternya.",
    "illustration": null,
    "unit": null,
    "sort_order": 11
  },
  {
    "id": 62,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Mencari diameter",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 44 cm. Berapa cm diameternya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 14
    },
    "explanation": "d = K ÷ π = 44 ÷ 22/7 = 44 × 7/22 = 14 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 12
  },
  {
    "id": 63,
    "quiz": "training-2",
    "qtype": "numeric",
    "topic": "Mencari jari-jari",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 62,8 cm. Berapa cm jari-jarinya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 10
    },
    "explanation": "r = K ÷ (2 × π) = 62,8 ÷ 6,28 = 10 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 13
  },
  {
    "id": 64,
    "quiz": "training-2",
    "qtype": "mcq",
    "topic": "Rumus keliling",
    "difficulty": 1,
    "prompt": "Rumus keliling lingkaran jika diketahui jari-jari adalah ...",
    "options": [
      "K = π × r",
      "K = 2 × π × r",
      "K = π × r × r",
      "K = 2 × r"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "K = 2 × π × r. Rumus π × r × r adalah rumus luas, bukan keliling.",
    "illustration": null,
    "unit": null,
    "sort_order": 14
  },
  {
    "id": 65,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Roda",
    "difficulty": 2,
    "prompt": "Roda sepeda motor berdiameter 56 cm. Berapa cm jarak yang ditempuh dalam satu putaran? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 176,
      "alt": [
        175.84
      ]
    },
    "explanation": "Jarak 1 putaran = keliling = 22/7 × 56 = 22 × 8 = 176 cm.",
    "illustration": "wheel:d = 56 cm",
    "unit": "cm",
    "sort_order": 1
  },
  {
    "id": 66,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Jarak tempuh roda",
    "difficulty": 3,
    "prompt": "Roda berjari-jari 21 cm berputar 50 kali. Berapa METER jarak yang ditempuh? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 66,
      "alt": [
        65.94
      ]
    },
    "explanation": "Keliling = 2 × 22/7 × 21 = 132 cm. Jarak = 50 × 132 = 6.600 cm. Ubah ke meter: 6.600 ÷ 100 = 66 m.",
    "illustration": "wheel:r = 21 cm",
    "unit": "m",
    "sort_order": 2
  },
  {
    "id": 67,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Taman",
    "difficulty": 3,
    "prompt": "Kolam berbentuk lingkaran berjari-jari 7 m. Di tepinya akan ditanam pohon setiap 2 m. Berapa banyak pohon yang dibutuhkan? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 22
    },
    "explanation": "Keliling = 2 × 22/7 × 7 = 44 m. Karena tepi kolam melingkar (tertutup), banyak pohon = 44 ÷ 2 = 22 pohon.",
    "illustration": "garden:r = 7 m",
    "unit": "pohon",
    "sort_order": 3
  },
  {
    "id": 68,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Biaya pagar",
    "difficulty": 3,
    "prompt": "Pagar taman berbentuk lingkaran berdiameter 14 m. Biaya pagar Rp50.000 per meter. Berapa rupiah biaya seluruhnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 2200000,
      "tolerance": 1,
      "alt": [
        2198000
      ]
    },
    "explanation": "Keliling = 22/7 × 14 = 44 m. Biaya = 44 × Rp50.000 = Rp2.200.000.",
    "illustration": "garden:d = 14 m",
    "unit": "rupiah",
    "sort_order": 4
  },
  {
    "id": 69,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Jarak tempuh roda",
    "difficulty": 2,
    "prompt": "Sebuah roda menempuh jarak 440 cm dalam 5 putaran. Berapa cm keliling roda tersebut?",
    "options": null,
    "answer": {
      "value": 88
    },
    "explanation": "Keliling = jarak ÷ banyak putaran = 440 ÷ 5 = 88 cm.",
    "illustration": "wheel:5 putaran",
    "unit": "cm",
    "sort_order": 5
  },
  {
    "id": 70,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Mencari jari-jari",
    "difficulty": 3,
    "prompt": "Sebuah roda menempuh 1.320 cm setelah berputar 10 kali. Berapa cm jari-jari roda? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 21
    },
    "explanation": "Keliling = 1.320 ÷ 10 = 132 cm. r = K ÷ (2 × π) = 132 ÷ (2 × 22/7) = 132 × 7/44 = 21 cm.",
    "illustration": "wheel:10 putaran",
    "unit": "cm",
    "sort_order": 6
  },
  {
    "id": 71,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Lintasan lari",
    "difficulty": 2,
    "prompt": "Seorang atlet berlari mengelilingi lintasan berdiameter 70 m sebanyak 3 kali. Berapa meter jarak yang ditempuh? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 660,
      "alt": [
        659.4
      ]
    },
    "explanation": "Keliling = 22/7 × 70 = 220 m. Jarak = 3 × 220 = 660 m.",
    "illustration": "track:d = 70 m",
    "unit": "m",
    "sort_order": 7
  },
  {
    "id": 72,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Pita",
    "difficulty": 3,
    "prompt": "Pita akan dililitkan satu kali mengelilingi kaleng berdiameter 7 cm, ditambah 3 cm untuk sambungan. Berapa cm panjang pita? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 25,
      "alt": [
        24.98
      ]
    },
    "explanation": "Keliling kaleng = 22/7 × 7 = 22 cm. Panjang pita = 22 + 3 = 25 cm.",
    "illustration": "ribbon:d = 7 cm",
    "unit": "cm",
    "sort_order": 8
  },
  {
    "id": 73,
    "quiz": "training-3",
    "qtype": "mcq",
    "topic": "Membandingkan keliling",
    "difficulty": 3,
    "prompt": "Roda A berjari-jari 14 cm, roda B berdiameter 14 cm. Pernyataan yang benar adalah ...",
    "options": [
      "Keliling A dua kali keliling B",
      "Keliling A sama dengan keliling B",
      "Keliling B dua kali keliling A",
      "Keliling A empat kali keliling B"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Keliling A = 2 × 22/7 × 14 = 88 cm. Keliling B = 22/7 × 14 = 44 cm. Jadi keliling A dua kali keliling B. Perhatikan beda jari-jari dan diameter!",
    "illustration": null,
    "unit": null,
    "sort_order": 9
  },
  {
    "id": 74,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Meja bundar",
    "difficulty": 3,
    "prompt": "Tepi meja bundar berjari-jari 35 cm akan dihias renda. Berapa METER renda yang dibutuhkan? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 2.2,
      "tolerance": 0.01
    },
    "explanation": "Keliling = 2 × 22/7 × 35 = 220 cm. Ubah ke meter: 220 ÷ 100 = 2,2 m.",
    "illustration": "table:r = 35 cm",
    "unit": "m",
    "sort_order": 10
  },
  {
    "id": 75,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Jarak tempuh roda",
    "difficulty": 2,
    "prompt": "Keliling ban sepeda 1,76 m. Berapa kali ban harus berputar untuk menempuh 176 m?",
    "options": null,
    "answer": {
      "value": 100
    },
    "explanation": "Banyak putaran = jarak ÷ keliling = 176 ÷ 1,76 = 100 kali.",
    "illustration": "wheel:K = 1,76 m",
    "unit": "kali",
    "sort_order": 11
  },
  {
    "id": 76,
    "quiz": "training-3",
    "qtype": "story",
    "topic": "Jarum jam",
    "difficulty": 3,
    "prompt": "Jarum panjang sebuah jam dinding panjangnya 14 cm. Berapa cm lintasan ujung jarum panjang dalam 1 jam? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 88,
      "alt": [
        87.92
      ]
    },
    "explanation": "Dalam 1 jam, jarum panjang berputar 1 kali penuh. Ujungnya membentuk lingkaran dengan r = 14 cm. K = 2 × 22/7 × 14 = 88 cm.",
    "illustration": "clock:r = 14 cm",
    "unit": "cm",
    "sort_order": 12
  },
  {
    "id": 77,
    "quiz": "exam",
    "qtype": "mcq",
    "topic": "Pengertian lingkaran",
    "difficulty": 1,
    "prompt": "Pernyataan yang benar tentang lingkaran adalah ...",
    "options": [
      "Lingkaran memiliki 4 titik sudut",
      "Semua titik pada lingkaran berjarak sama ke titik pusat",
      "Lingkaran tersusun dari garis-garis lurus",
      "Jari-jari selalu lebih panjang dari diameter"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Ciri utama lingkaran: semua titik pada lingkaran berjarak sama (jari-jari) ke titik pusat.",
    "illustration": null,
    "unit": null,
    "sort_order": 1
  },
  {
    "id": 78,
    "quiz": "exam",
    "qtype": "true_false",
    "topic": "Benda berbentuk lingkaran",
    "difficulty": 1,
    "prompt": "Permukaan uang koin berbentuk lingkaran.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. Uang koin adalah contoh benda berbentuk lingkaran.",
    "illustration": null,
    "unit": null,
    "sort_order": 2
  },
  {
    "id": 79,
    "quiz": "exam",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Bagian yang menyala pada gambar adalah ...",
    "options": [
      "Titik pusat",
      "Busur",
      "Juring",
      "Tembereng"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Titik di tengah lingkaran adalah titik pusat.",
    "illustration": "anatomy:center",
    "unit": null,
    "sort_order": 3
  },
  {
    "id": 80,
    "quiz": "exam",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 1,
    "prompt": "Garis yang menyala pada gambar adalah ...",
    "options": [
      "Jari-jari",
      "Tali busur",
      "Diameter",
      "Busur"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Garis lurus yang menghubungkan dua titik pada lingkaran tanpa melewati pusat adalah tali busur.",
    "illustration": "anatomy:chord",
    "unit": null,
    "sort_order": 4
  },
  {
    "id": 81,
    "quiz": "exam",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Daerah yang menyala pada gambar adalah ...",
    "options": [
      "Juring",
      "Tembereng",
      "Busur",
      "Diameter"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Daerah antara dua jari-jari dan busur disebut juring.",
    "illustration": "anatomy:sector",
    "unit": null,
    "sort_order": 5
  },
  {
    "id": 82,
    "quiz": "exam",
    "qtype": "identify",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Daerah yang menyala pada gambar adalah ...",
    "options": [
      "Busur",
      "Juring",
      "Tembereng",
      "Tali busur"
    ],
    "answer": {
      "index": 2
    },
    "explanation": "Daerah antara tali busur dan busur disebut tembereng.",
    "illustration": "anatomy:segment",
    "unit": null,
    "sort_order": 6
  },
  {
    "id": 83,
    "quiz": "exam",
    "qtype": "match",
    "topic": "Unsur lingkaran",
    "difficulty": 2,
    "prompt": "Pasangkan setiap istilah dengan pengertiannya.",
    "options": {
      "left": [
        "Busur",
        "Tali busur",
        "Juring"
      ],
      "right": [
        "Daerah antara dua jari-jari dan busur",
        "Garis lengkung bagian dari keliling",
        "Garis lurus penghubung dua titik pada lingkaran"
      ]
    },
    "answer": {
      "pairs": [
        1,
        2,
        0
      ]
    },
    "explanation": "Busur = garis lengkung. Tali busur = garis lurus penghubung dua titik pada lingkaran. Juring = daerah antara dua jari-jari dan busur.",
    "illustration": null,
    "unit": null,
    "sort_order": 7
  },
  {
    "id": 84,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Jari-jari lingkaran 16 cm. Berapa cm diameternya?",
    "options": null,
    "answer": {
      "value": 32
    },
    "explanation": "d = 2 × r = 2 × 16 = 32 cm.",
    "illustration": "circle-r:16 cm",
    "unit": "cm",
    "sort_order": 8
  },
  {
    "id": 85,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Jari-jari dan diameter",
    "difficulty": 1,
    "prompt": "Diameter lingkaran 45 cm. Berapa cm jari-jarinya?",
    "options": null,
    "answer": {
      "value": 22.5
    },
    "explanation": "r = d ÷ 2 = 45 ÷ 2 = 22,5 cm.",
    "illustration": "circle-d:45 cm",
    "unit": "cm",
    "sort_order": 9
  },
  {
    "id": 86,
    "quiz": "exam",
    "qtype": "mcq",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "Nilai π mendekati ...",
    "options": [
      "2,72",
      "3,14",
      "1,41",
      "1,73"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "π ≈ 3,14 atau 22/7.",
    "illustration": null,
    "unit": null,
    "sort_order": 10
  },
  {
    "id": 87,
    "quiz": "exam",
    "qtype": "true_false",
    "topic": "Nilai pi",
    "difficulty": 1,
    "prompt": "22/7 dan 3,14 adalah nilai pendekatan untuk π.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "Benar. π sebenarnya 3,14159... sehingga 22/7 dan 3,14 adalah pendekatannya.",
    "illustration": null,
    "unit": null,
    "sort_order": 11
  },
  {
    "id": 88,
    "quiz": "exam",
    "qtype": "mcq",
    "topic": "Nilai pi",
    "difficulty": 2,
    "prompt": "Hasil pengukuran tutup toples: keliling 47,1 cm dan diameter 15 cm. Hasil K ÷ d adalah ...",
    "options": [
      "3,14",
      "2,14",
      "4,71",
      "1,5"
    ],
    "answer": {
      "index": 0
    },
    "explanation": "47,1 ÷ 15 = 3,14. Hasil bagi keliling dan diameter selalu mendekati π.",
    "illustration": null,
    "unit": null,
    "sort_order": 12
  },
  {
    "id": 89,
    "quiz": "exam",
    "qtype": "mcq",
    "topic": "Konsep keliling",
    "difficulty": 1,
    "prompt": "Keliling lingkaran merupakan ...",
    "options": [
      "daerah di dalam lingkaran",
      "panjang garis lengkung yang membatasi lingkaran",
      "jarak pusat ke tepi lingkaran",
      "dua kali jari-jari"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Keliling = panjang garis lengkung yang mengelilingi lingkaran. Dua kali jari-jari adalah diameter.",
    "illustration": null,
    "unit": null,
    "sort_order": 13
  },
  {
    "id": 90,
    "quiz": "exam",
    "qtype": "true_false",
    "topic": "Satu putaran",
    "difficulty": 2,
    "prompt": "Roda yang berputar satu kali penuh menempuh jarak yang sama dengan diameternya.",
    "options": [
      "Benar",
      "Salah"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Salah. Jarak satu putaran sama dengan KELILING roda (sekitar 3,14 kali diameternya).",
    "illustration": "wheel:1 putaran",
    "unit": null,
    "sort_order": 14
  },
  {
    "id": 91,
    "quiz": "exam",
    "qtype": "fill_formula",
    "topic": "Rumus keliling",
    "difficulty": 1,
    "prompt": "Lengkapi rumus: K = ___ × d",
    "options": [
      "2",
      "π",
      "r",
      "2π"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "K = π × d.",
    "illustration": null,
    "unit": null,
    "sort_order": 15
  },
  {
    "id": 92,
    "quiz": "exam",
    "qtype": "fill_formula",
    "topic": "Rumus keliling",
    "difficulty": 1,
    "prompt": "Lengkapi rumus: K = 2 × ___ × r",
    "options": [
      "d",
      "π",
      "K",
      "2"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "K = 2 × π × r.",
    "illustration": null,
    "unit": null,
    "sort_order": 16
  },
  {
    "id": 93,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Diameter lingkaran 21 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 66,
      "alt": [
        65.94
      ]
    },
    "explanation": "K = 22/7 × 21 = 22 × 3 = 66 cm.",
    "illustration": "circle-d:21 cm",
    "unit": "cm",
    "sort_order": 17
  },
  {
    "id": 94,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 14 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 88,
      "alt": [
        87.92
      ]
    },
    "explanation": "K = 2 × 22/7 × 14 = 2 × 22 × 2 = 88 cm.",
    "illustration": "circle-r:14 cm",
    "unit": "cm",
    "sort_order": 18
  },
  {
    "id": 95,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Diameter lingkaran 30 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 94.2,
      "alt": [
        94.29
      ]
    },
    "explanation": "K = 3,14 × 30 = 94,2 cm.",
    "illustration": "circle-d:30 cm",
    "unit": "cm",
    "sort_order": 19
  },
  {
    "id": 96,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 15 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 94.2,
      "alt": [
        94.29
      ]
    },
    "explanation": "K = 2 × 3,14 × 15 = 94,2 cm.",
    "illustration": "circle-r:15 cm",
    "unit": "cm",
    "sort_order": 20
  },
  {
    "id": 97,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 3,5 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 22,
      "alt": [
        21.98
      ]
    },
    "explanation": "K = 2 × 22/7 × 3,5 = 22/7 × 7 = 22 cm.",
    "illustration": "circle-r:3,5 cm",
    "unit": "cm",
    "sort_order": 21
  },
  {
    "id": 98,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Mencari diameter",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 154 cm. Berapa cm diameternya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 49
    },
    "explanation": "d = K ÷ π = 154 × 7/22 = 49 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 22
  },
  {
    "id": 99,
    "quiz": "exam",
    "qtype": "numeric",
    "topic": "Mencari jari-jari",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 125,6 cm. Berapa cm jari-jarinya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 20
    },
    "explanation": "r = K ÷ (2 × π) = 125,6 ÷ 6,28 = 20 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 23
  },
  {
    "id": 100,
    "quiz": "exam",
    "qtype": "story",
    "topic": "Roda sepeda",
    "difficulty": 2,
    "prompt": "Roda sepeda berjari-jari 28 cm. Berapa cm jarak yang ditempuh dalam satu putaran? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 176,
      "alt": [
        175.84
      ]
    },
    "explanation": "Jarak 1 putaran = 2 × 22/7 × 28 = 176 cm.",
    "illustration": "wheel:r = 28 cm",
    "unit": "cm",
    "sort_order": 24
  },
  {
    "id": 101,
    "quiz": "exam",
    "qtype": "story",
    "topic": "Pagar taman",
    "difficulty": 2,
    "prompt": "Taman berbentuk lingkaran berdiameter 42 m akan dipagari. Berapa meter panjang pagar? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 132,
      "alt": [
        131.88
      ]
    },
    "explanation": "Panjang pagar = 22/7 × 42 = 22 × 6 = 132 m.",
    "illustration": "garden:d = 42 m",
    "unit": "m",
    "sort_order": 25
  },
  {
    "id": 102,
    "quiz": "exam",
    "qtype": "story",
    "topic": "Pita",
    "difficulty": 2,
    "prompt": "Pita akan dililitkan mengelilingi kue tart berdiameter 20 cm. Berapa cm panjang pita minimal? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 62.8,
      "alt": [
        62.86
      ]
    },
    "explanation": "Panjang pita = keliling = 3,14 × 20 = 62,8 cm.",
    "illustration": "ribbon:d = 20 cm",
    "unit": "cm",
    "sort_order": 26
  },
  {
    "id": 103,
    "quiz": "exam",
    "qtype": "story",
    "topic": "Jarak tempuh roda",
    "difficulty": 3,
    "prompt": "Roda berdiameter 70 cm berputar 100 kali. Berapa METER jarak yang ditempuh? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 220,
      "alt": [
        219.8
      ]
    },
    "explanation": "Keliling = 22/7 × 70 = 220 cm. Jarak = 100 × 220 = 22.000 cm = 220 m.",
    "illustration": "wheel:d = 70 cm",
    "unit": "m",
    "sort_order": 27
  },
  {
    "id": 104,
    "quiz": "exam",
    "qtype": "story",
    "topic": "Lintasan",
    "difficulty": 3,
    "prompt": "Lintasan berbentuk lingkaran berdiameter 100 m. Berapa meter jarak 2 putaran? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 628,
      "alt": [
        628.57
      ]
    },
    "explanation": "Keliling = 3,14 × 100 = 314 m. Dua putaran = 628 m.",
    "illustration": "track:d = 100 m",
    "unit": "m",
    "sort_order": 28
  },
  {
    "id": 105,
    "quiz": "exam",
    "qtype": "story",
    "topic": "Mencari diameter roda",
    "difficulty": 3,
    "prompt": "Sebuah roda menempuh 2.200 cm dalam 25 putaran. Berapa cm diameter roda? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 28
    },
    "explanation": "Keliling = 2.200 ÷ 25 = 88 cm. d = 88 ÷ 22/7 = 88 × 7/22 = 28 cm.",
    "illustration": "wheel:25 putaran",
    "unit": "cm",
    "sort_order": 29
  },
  {
    "id": 106,
    "quiz": "exam",
    "qtype": "mcq",
    "topic": "Membandingkan keliling",
    "difficulty": 3,
    "prompt": "Roda P berjari-jari 7 cm dan roda Q berjari-jari 14 cm. Keliling roda Q adalah ...",
    "options": [
      "sama dengan keliling P",
      "dua kali keliling P",
      "empat kali keliling P",
      "setengah keliling P"
    ],
    "answer": {
      "index": 1
    },
    "explanation": "Keliling P = 44 cm, keliling Q = 88 cm. Jari-jari dua kali lipat → keliling juga dua kali lipat.",
    "illustration": null,
    "unit": null,
    "sort_order": 30
  },
  {
    "id": 107,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 35 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 220,
      "alt": [
        219.8
      ]
    },
    "explanation": "K = 2 × 22/7 × 35 = 220 cm.",
    "illustration": "circle-r:35 cm",
    "unit": "cm",
    "sort_order": 1
  },
  {
    "id": 108,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 1,
    "prompt": "Diameter lingkaran 8 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 25.12,
      "alt": [
        25.14
      ]
    },
    "explanation": "K = 3,14 × 8 = 25,12 cm.",
    "illustration": "circle-d:8 cm",
    "unit": "cm",
    "sort_order": 2
  },
  {
    "id": 109,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 42 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 264,
      "alt": [
        263.76
      ]
    },
    "explanation": "K = 2 × 22/7 × 42 = 264 cm.",
    "illustration": "circle-r:42 cm",
    "unit": "cm",
    "sort_order": 3
  },
  {
    "id": 110,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Diameter lingkaran 63 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 198,
      "alt": [
        197.82
      ]
    },
    "explanation": "K = 22/7 × 63 = 22 × 9 = 198 cm.",
    "illustration": "circle-d:63 cm",
    "unit": "cm",
    "sort_order": 4
  },
  {
    "id": 111,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 25 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 157,
      "alt": [
        157.14
      ]
    },
    "explanation": "K = 2 × 3,14 × 25 = 157 cm.",
    "illustration": "circle-r:25 cm",
    "unit": "cm",
    "sort_order": 5
  },
  {
    "id": 112,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Mencari jari-jari",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 88 cm. Berapa cm jari-jarinya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 14
    },
    "explanation": "r = K ÷ (2 × π) = 88 ÷ 44/7 = 88 × 7/44 = 14 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 6
  },
  {
    "id": 113,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 1,
    "prompt": "Diameter lingkaran 12 cm. Berapa cm kelilingnya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 37.68,
      "alt": [
        37.71
      ]
    },
    "explanation": "K = 3,14 × 12 = 37,68 cm.",
    "illustration": "circle-d:12 cm",
    "unit": "cm",
    "sort_order": 7
  },
  {
    "id": 114,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Menghitung keliling",
    "difficulty": 2,
    "prompt": "Jari-jari lingkaran 10,5 cm. Berapa cm kelilingnya? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 66,
      "alt": [
        65.94
      ]
    },
    "explanation": "K = 2 × 22/7 × 10,5 = 22/7 × 21 = 66 cm.",
    "illustration": "circle-r:10,5 cm",
    "unit": "cm",
    "sort_order": 8
  },
  {
    "id": 115,
    "quiz": "daily",
    "qtype": "story",
    "topic": "Jarak tempuh roda",
    "difficulty": 3,
    "prompt": "Roda berjari-jari 7 cm berputar 5 kali. Berapa cm jarak yang ditempuh? (π = 22/7)",
    "options": null,
    "answer": {
      "value": 220,
      "alt": [
        219.8
      ]
    },
    "explanation": "Keliling = 2 × 22/7 × 7 = 44 cm. Jarak = 5 × 44 = 220 cm.",
    "illustration": "wheel:r = 7 cm",
    "unit": "cm",
    "sort_order": 9
  },
  {
    "id": 116,
    "quiz": "daily",
    "qtype": "numeric",
    "topic": "Mencari diameter",
    "difficulty": 3,
    "prompt": "Keliling lingkaran 94,2 cm. Berapa cm diameternya? (π = 3,14)",
    "options": null,
    "answer": {
      "value": 30
    },
    "explanation": "d = K ÷ π = 94,2 ÷ 3,14 = 30 cm.",
    "illustration": null,
    "unit": "cm",
    "sort_order": 10
  }
];
