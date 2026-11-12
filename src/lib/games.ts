import { CIRCLE_OBJECTS, NON_CIRCLE_OBJECTS } from "@/lib/objects";
import { formatNumber, round } from "@/lib/math";

export type Rand = () => number;

export const GAMES = [
  {
    slug: "circle-hunter",
    title: "Circle Hunter",
    tagline: "Pindai & tangkap benda berbentuk lingkaran!",
    mechanic: "Pilih banyak objek + waktu",
    color: "#62E5F5",
    maxScore: 200,
    passScore: 120,
    rules: [
      "Ada 5 ronde. Setiap ronde menampilkan 8 objek.",
      "Ketuk SEMUA objek yang berbentuk lingkaran, lalu tekan Periksa.",
      "Benar +10 poin, salah pilih −5 poin. Waktu tiap ronde 25 detik.",
      "Setelah diperiksa, BIMO menjelaskan setiap objek.",
    ],
  },
  {
    slug: "radius-or-diameter",
    title: "Radius or Diameter?",
    tagline: "Garis menyala — apa namanya?",
    mechanic: "Klasifikasi cepat + combo",
    color: "#318BFF",
    maxScore: 100,
    passScore: 70,
    rules: [
      "Ada 10 sinyal. Setiap sinyal menyalakan satu garis pada lingkaran.",
      "Tentukan apakah garis itu Jari-jari, Diameter, atau Tali busur.",
      "Setiap jawaban benar +10 poin. Jaga combo-mu!",
      "Petunjuk: perhatikan apakah garis melewati titik pusat.",
    ],
  },
  {
    slug: "pi-detective",
    title: "Pi Detective",
    tagline: "Buka petunjuk, pecahkan kasus π.",
    mechanic: "Buka petunjuk (biaya poin)",
    color: "#8D7CFF",
    maxScore: 180,
    passScore: 100,
    rules: [
      "Ada 6 berkas kasus tentang nilai π.",
      "Setiap kasus bernilai 30 poin. Petunjuk pertama gratis.",
      "Membuka petunjuk tambahan mengurangi 10 poin kasus tersebut.",
      "Pilih jawaban yang tepat untuk menutup kasus.",
    ],
  },
  {
    slug: "orbit-calculation",
    title: "Orbit Calculation",
    tagline: "Hitung orbit satelit tahap demi tahap.",
    mechanic: "Isian angka bertahap + bonus waktu",
    color: "#FFD76A",
    maxScore: 160,
    passScore: 100,
    rules: [
      "8 orbit dalam 3 tahap: diameter → keliling, jari-jari → keliling, keliling → diameter.",
      "Ketik jawabanmu (boleh pakai koma).",
      "Tepat = 15 poin, + bonus 5 poin bila dijawab dalam 30 detik.",
      "Jawaban yang hampir tepat (selisih ≤ 1%) tetap dapat 8 poin.",
    ],
  },
  {
    slug: "bimo-space-rescue",
    title: "BIMO Space Rescue",
    tagline: "Isi energi pesawat BIMO untuk pulang!",
    mechanic: "Petualangan: energi & perisai",
    color: "#5BE3A1",
    maxScore: 100,
    passScore: 60,
    rules: [
      "Pesawat BIMO kehabisan energi! Ada 5 sel energi yang harus diisi.",
      "Setiap tantangan menampilkan 3 sel energi berisi angka. Ketuk sel dengan jawaban yang benar.",
      "Benar: +20% energi dan pesawat maju. Salah: perisai berkurang 1 (ada 3 perisai).",
      "Misi berhasil bila energi 100% sebelum perisai habis.",
    ],
  },
] as const;

export type GameSlug = (typeof GAMES)[number]["slug"];

export function getGame(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}

export function shuffle<T>(arr: readonly T[], rand: Rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(arr: readonly T[], rand: Rand) => arr[Math.floor(rand() * arr.length)];

// ---------------- Circle Hunter ----------------
export function hunterRound(rand: Rand = Math.random): string[] {
  const circles = shuffle(CIRCLE_OBJECTS, rand).slice(0, 4);
  const others = shuffle(NON_CIRCLE_OBJECTS, rand).slice(0, 4);
  return shuffle([...circles, ...others], rand);
}

export function scoreHunterRound(objects: string[], selected: Set<string>, isCircle: (o: string) => boolean) {
  let score = 0;
  let correct = 0;
  for (const o of objects) {
    const circ = isCircle(o);
    if (selected.has(o) && circ) {
      score += 10;
      correct++;
    } else if (selected.has(o) && !circ) score -= 5;
  }
  return { score: Math.max(0, score), correct };
}

// ---------------- Radius or Diameter ----------------
export type SegmentKind = "radius" | "diameter" | "chord";
export interface SegmentRound {
  kind: SegmentKind;
  angle: number; // derajat
}
export function segmentRound(rand: Rand = Math.random): SegmentRound {
  return { kind: pick(["radius", "diameter", "chord"] as const, rand), angle: Math.floor(rand() * 360) };
}

// ---------------- Orbit Calculation ----------------
export interface NumericProblem {
  stage: 1 | 2 | 3;
  prompt: string;
  answer: number;
  unit: string;
  explanation: string;
}

const SEVENS = [7, 14, 21, 28, 35, 42, 49, 56, 63, 70];
const TENS = [5, 10, 15, 20, 25, 30, 40, 50];

export function orbitProblem(stage: 1 | 2 | 3, rand: Rand = Math.random): NumericProblem {
  const useSeven = rand() < 0.5;
  const n = useSeven ? pick(SEVENS, rand) : pick(TENS, rand);
  const pi = useSeven ? 22 / 7 : 3.14;
  const pl = useSeven ? "22/7" : "3,14";
  if (stage === 1) {
    const k = round(pi * n, 2);
    return {
      stage,
      prompt: `Orbit satelit berdiameter ${n} km. Berapa km kelilingnya? (π = ${pl})`,
      answer: k,
      unit: "km",
      explanation: `K = π × d = ${pl} × ${n} = ${formatNumber(k)} km.`,
    };
  }
  if (stage === 2) {
    const k = round(2 * pi * n, 2);
    return {
      stage,
      prompt: `Orbit bulan kecil berjari-jari ${n} km. Berapa km kelilingnya? (π = ${pl})`,
      answer: k,
      unit: "km",
      explanation: `K = 2 × π × r = 2 × ${pl} × ${n} = ${formatNumber(k)} km.`,
    };
  }
  const k = round(pi * n, 2);
  return {
    stage,
    prompt: `Keliling orbit stasiun ${formatNumber(k)} km. Berapa km diameternya? (π = ${pl})`,
    answer: n,
    unit: "km",
    explanation: `d = K ÷ π = ${formatNumber(k)} ÷ ${pl} = ${n} km.`,
  };
}

export function orbitSet(rand: Rand = Math.random): NumericProblem[] {
  const stages: (1 | 2 | 3)[] = [1, 1, 1, 2, 2, 2, 3, 3];
  return stages.map((s) => orbitProblem(s, rand));
}

export function scoreOrbit(given: number, expected: number, seconds: number): { points: number; exact: boolean; close: boolean } {
  const tol = Math.max(0.05, Math.abs(expected) * 0.002);
  const exact = Math.abs(given - expected) <= tol;
  const close = !exact && Math.abs(given - expected) <= Math.abs(expected) * 0.01;
  const points = exact ? 15 + (seconds <= 30 ? 5 : 0) : close ? 8 : 0;
  return { points, exact, close };
}

// ---------------- BIMO Space Rescue ----------------
export interface RescueChallenge {
  prompt: string;
  options: number[];
  answer: number;
  unit: string;
  explanation: string;
}

export function rescueChallenge(rand: Rand = Math.random): RescueChallenge {
  const type = Math.floor(rand() * 4);
  const r = pick([7, 14, 21, 35], rand);
  let prompt: string;
  let answer: number;
  let wrong: number[];
  let explanation: string;
  const k = round(2 * (22 / 7) * r, 2);
  if (type === 0) {
    prompt = `Mesin pendorong berbentuk lingkaran berjari-jari ${r} cm. Berapa kelilingnya? (π = 22/7)`;
    answer = k;
    wrong = [round((22 / 7) * r, 2), round((22 / 7) * r * r, 2)];
    explanation = `K = 2 × 22/7 × ${r} = ${formatNumber(k)} cm. (Ingat dikali 2 karena memakai jari-jari!)`;
  } else if (type === 1) {
    const d = 2 * r;
    prompt = `Panel surya bundar berdiameter ${d} cm. Berapa jari-jarinya?`;
    answer = r;
    wrong = [d * 2, d];
    explanation = `r = d ÷ 2 = ${d} ÷ 2 = ${r} cm.`;
  } else if (type === 2) {
    const n = pick([2, 3, 5, 10], rand);
    prompt = `Roda rover berjari-jari ${r} cm berputar ${n} kali. Berapa cm jarak tempuhnya? (π = 22/7)`;
    answer = round(k * n, 2);
    wrong = [round(k, 2), round((22 / 7) * r * n, 2)];
    explanation = `K = ${formatNumber(k)} cm. Jarak = ${n} × ${formatNumber(k)} = ${formatNumber(answer)} cm.`;
  } else {
    const d = pick([10, 20, 30, 50], rand);
    prompt = `Jendela kapsul berdiameter ${d} cm. Berapa kelilingnya? (π = 3,14)`;
    answer = round(3.14 * d, 2);
    wrong = [round(3.14 * d * 2, 2), round(3.14 * (d / 2), 2)];
    explanation = `K = π × d = 3,14 × ${d} = ${formatNumber(answer)} cm.`;
  }
  const uniqueWrong = wrong.filter((w, i) => w !== answer && wrong.indexOf(w) === i);
  while (uniqueWrong.length < 2) uniqueWrong.push(round(answer + 10 * (uniqueWrong.length + 1), 2));
  return { prompt, answer, unit: "cm", explanation, options: shuffle([answer, ...uniqueWrong.slice(0, 2)], rand) };
}

// ---------------- Pi Detective ----------------
export interface PiCase {
  title: string;
  clues: string[];
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const PI_CASES: PiCase[] = [
  {
    title: "Kasus #1: Rasio Misterius",
    clues: [
      "Detektif mengukur tutup toples: kelilingnya 31,4 cm.",
      "Diameter tutup toples tersebut 10 cm.",
      "π = keliling ÷ diameter.",
    ],
    question: "Berapa nilai rasio K ÷ d pada tutup toples itu?",
    options: ["3,14", "10", "31,4", "2"],
    answer: 0,
    explanation: "31,4 ÷ 10 = 3,14. Inilah nilai π!",
  },
  {
    title: "Kasus #2: Pecahan Penyamar",
    clues: ["Tersangka berbentuk pecahan.", "Pembilangnya 22.", "Nilainya ≈ 3,142857…"],
    question: "Pecahan manakah yang menyamar sebagai π?",
    options: ["7/22", "22/7", "22/3", "3/22"],
    answer: 1,
    explanation: "22/7 = 3,142857… sangat dekat dengan π. 7/22 itu terbalik!",
  },
  {
    title: "Kasus #3: Angka Kelipatan Tujuh",
    clues: ["Sebuah roda berjari-jari 28 cm.", "28 = 4 × 7.", "Angka 7 bisa dicoret jika π memakai penyebut 7."],
    question: "Nilai π mana yang paling memudahkan menghitung keliling roda ini?",
    options: ["3,14", "22/7", "3", "Tidak perlu π"],
    answer: 1,
    explanation: "28 kelipatan 7, jadi 22/7 × 28 = 22 × 4 = 88 — sangat mudah!",
  },
  {
    title: "Kasus #4: Kelipatan Sepuluh",
    clues: ["Kolam bundar berdiameter 50 m.", "50 bukan kelipatan 7.", "Mengalikan dengan 10, 20, 50 paling mudah memakai desimal."],
    question: "Nilai π mana yang lebih tepat dipakai?",
    options: ["22/7", "3,14", "7/22", "1,57"],
    answer: 1,
    explanation: "50 bukan kelipatan 7, gunakan 3,14: 3,14 × 50 = 157 m.",
  },
  {
    title: "Kasus #5: Tuduhan Palsu",
    clues: [
      "Seorang saksi berkata: 'Lingkaran besar punya π lebih besar!'",
      "Detektif mengukur koin: K ÷ d ≈ 3,14.",
      "Detektif mengukur bianglala: K ÷ d ≈ 3,14.",
    ],
    question: "Apa kesimpulan detektif?",
    options: ["Saksi benar", "π selalu sama untuk semua lingkaran", "π lingkaran kecil lebih besar", "π hanya untuk roda"],
    answer: 1,
    explanation: "π adalah konstanta: nilainya sama untuk lingkaran kecil maupun besar.",
  },
  {
    title: "Kasus #6: Desimal Tanpa Akhir",
    clues: ["π = 3,14159265358979…", "Desimalnya terus berlanjut tanpa pola berulang.", "Karena itu kita memakai nilai pendekatan."],
    question: "Pernyataan yang benar tentang 3,14 adalah …",
    options: ["Nilai π yang tepat", "Nilai pendekatan π", "Bukan nilai π sama sekali", "Lebih besar dari π"],
    answer: 1,
    explanation: "3,14 adalah pendekatan (pembulatan) dari π yang sebenarnya 3,14159…",
  },
];

export function scorePiCase(cluesOpened: number, correct: boolean): number {
  if (!correct) return 0;
  return Math.max(10, 30 - 10 * Math.max(0, cluesOpened - 1));
}
