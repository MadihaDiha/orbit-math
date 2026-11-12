/** Kalimat BIMO. Ramah, tidak merendahkan, memberi semangat. */
export const BIMO_LINES = {
  correct: [
    "YEAH! Jawabanmu tepat! Kamu berhasil mendapatkan energi galaksi!",
    "Mantap, penjelajah! Navigasimu akurat sekali!",
    "Benar! Mesin roketku makin bertenaga berkat kamu!",
    "Tepat sasaran! Orbitmu stabil!",
  ],
  wrong: [
    "Ups! Sepertinya ada sedikit gangguan sinyal. Coba kita periksa lagi langkahnya, ya!",
    "Wah, hampir benar! Yuk, kita periksa lagi langkah perhitungannya.",
    "Tidak apa-apa, semua astronaut pernah salah hitung. Baca pembahasannya, ya!",
    "Hmm, sinyalnya belum pas. Lihat penjelasan BIMO di bawah ini!",
  ],
  missionDone: "LUAR BIASA! Wilayah baru berhasil kamu jelajahi!",
  newRegion: "Hebat! Kamu berhasil membuka wilayah galaksi baru!",
} as const;

export function pickLine(kind: "correct" | "wrong", seed: number): string {
  const list = BIMO_LINES[kind];
  return list[Math.abs(seed) % list.length];
}

export function scoreMessage(score: number, pass: number): { mood: "proud" | "happy" | "oops"; text: string } {
  if (score === 100) return { mood: "proud", text: "SEMPURNA! Nilai 100 — kamu benar-benar Galaxy Expert!" };
  if (score >= pass) return { mood: "happy", text: "Selamat, kamu lulus! Energi galaksimu terisi penuh." };
  return { mood: "oops", text: `Belum mencapai ${pass}, tapi tidak masalah! Baca pembahasan, lalu coba lagi. BIMO yakin kamu bisa!` };
}
