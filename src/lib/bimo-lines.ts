/** Kalimat BIMO. Ramah, tidak merendahkan, memberi semangat. */
export const BIMO_LINES = {
  correct: [
    "Wah, hebat sekali! Kamu memang astronot matematika yang pintar!",
    "YEAH! Jawabanmu tepat! Kamu berhasil mendapatkan energi galaksi!",
    "Mantap, penjelajah! Navigasimu akurat sekali!",
    "Tepat sasaran! Orbitmu stabil!",
  ],
  wrong: [
    "Ups, belum tepat! Ayo kita coba lagi. Bimo yakin kamu bisa!",
    "Ups! Sepertinya ada sedikit gangguan sinyal. Coba kita periksa lagi langkahnya, ya!",
    "Tidak apa-apa, semua astronot pernah salah hitung. Baca penjelasannya, ya!",
    "Hampir! Lihat penjelasan Bimo di bawah, lalu kita lanjut lagi.",
  ],
  openLesson: "Yuk, kita pelajari rahasia lingkaran!",
  missionDone: "Yeay! Satu planet berhasil kamu taklukkan!",
  newRegion: "Hebat! Kamu berhasil membuka wilayah galaksi baru!",
} as const;

export function pickLine(kind: "correct" | "wrong", seed: number): string {
  const list = BIMO_LINES[kind];
  return list[Math.abs(seed) % list.length];
}

export function scoreMessage(score: number, pass: number): { mood: "proud" | "happy" | "oops"; text: string } {
  if (score === 100) return { mood: "proud", text: "SEMPURNA! Nilai 100 — kamu benar-benar Galaxy Expert!" };
  if (score >= pass) return { mood: "happy", text: "Selamat, kamu lulus! Energi galaksimu terisi penuh." };
  return { mood: "oops", text: `Belum mencapai ${pass}, tapi tidak masalah! Baca pembahasan, lalu coba lagi. Bimo yakin kamu bisa!` };
}

/** Dialog perkenalan BIMO (halaman /kenalan-bimo). */
export const BIMO_INTRO = [
  "Hai, Astronot Muda! Kenalin, namaku Bimo!",
  "Aku akan menjadi teman petualanganmu menjelajahi Galaksi Lingkaran.",
  "Di perjalanan ini, kita akan belajar tentang keliling lingkaran, menyelesaikan berbagai tantangan, dan mengumpulkan bintang!",
  "Jangan takut salah, ya! Kita belajar dan mencoba bersama-sama!",
] as const;

/** Petunjuk BIMO per halaman (BimoGuide). */
export const BIMO_TIPS: { prefix: string; greet: string; tips: string[] }[] = [
  { prefix: "/dashboard", greet: "Selamat datang di Control Center! Planet yang berdenyut adalah misi berikutnya.", tips: ["Ikuti jalur orbit dari landasan peluncuran sampai portal pulang.", "Kumpulkan bintang di setiap planet: nilai mini quiz 100 = 3 bintang!", "Jangan lupa Tantangan Harian untuk +30 XP."] },
  { prefix: "/galaxy", greet: "Ketuk planet untuk melihat misinya. Planet redup masih terkunci.", tips: ["Planet terbuka berurutan: selesaikan satu untuk membuka berikutnya.", "Planet yang sudah selesai bisa kamu kunjungi lagi kapan saja."] },
  { prefix: "/pretest", greet: "Tenang saja, ini bukan ujian yang menakutkan. Bimo hanya ingin tahu sejauh mana kamu sudah mengenal lingkaran.", tips: ["Jawab sesuai yang kamu tahu, tidak apa-apa kalau ragu.", "Nilai pre-test nanti dibandingkan dengan post-test untuk melihat perkembanganmu."] },
  { prefix: "/missions", greet: "Yuk, kita pelajari rahasia lingkaran!", tips: ["Baca konsepnya, coba aktivitasnya, lalu kerjakan mini quiz.", "Mini quiz minimal 60 untuk menaklukkan planet.", "Lihat Contoh Soal: ketuk untuk membuka langkah penyelesaiannya."] },
  { prefix: "/lab", greet: "Laboratorium siap! Semua angka dihitung langsung.", tips: ["Geser slider jari-jari dan perhatikan keliling ikut berubah.", "Di simulator roda, perhatikan: 1 putaran = 1 keliling."] },
  { prefix: "/training", greet: "Latihan bikin otot matematikamu makin kuat!", tips: ["Kalau salah, baca pembahasannya — itu kunci jadi jago!", "Soal diacak setiap kali kamu berlatih."] },
  { prefix: "/playground", greet: "Waktunya bermain! Pilih game favoritmu.", tips: ["Mainkan kelima game untuk lencana Playground Voyager!", "Orbit Calculation: jawab dalam 30 detik untuk bonus poin."] },
  { prefix: "/posttest", greet: "Ini misi pulang ke Bumi! Tunjukkan semua yang sudah kamu pelajari.", tips: ["K = π × d = 2 × π × r.", "Kelipatan 7? Pakai π = 22/7 supaya mudah."] },
  { prefix: "/exam", greet: "Final Examination! Tarik napas, kamu sudah siap.", tips: ["Tandai soal yang ragu, lalu periksa lagi sebelum mengumpulkan.", "Ingat beda jari-jari dan diameter: d = 2 × r."] },
  { prefix: "/results", greet: "Lihat seberapa jauh kamu sudah berkembang!", tips: ["Bandingkan nilai pre-test dan post-test-mu.", "Ulangi planet favoritmu untuk menambah bintang."] },
  { prefix: "/", greet: "Butuh bantuan? Bimo selalu siap menemanimu!", tips: ["Rumus keliling: K = π × d atau K = 2 × π × r.", "π ≈ 3,14 ≈ 22/7.", "Jarak tempuh roda = banyak putaran × keliling."] },
];
