/**
 * BIMO Tutor Offline — bimbingan pemecahan soal Keliling Lingkaran TANPA AI berbayar.
 * Berjalan di browser (gratis, tanpa akun), juga di situs statis GitHub Pages, dan menjadi
 * cadangan otomatis saat AI online tidak tersedia.
 *
 * Pedagogi sama dengan BIMO AI:
 *  - 6 langkah: memahami situasi → diketahui & ditanya → konsep → strategi → menghitung → memeriksa & refleksi
 *  - Intrinsic load: satu langkah per balasan. Extraneous load: kalimat pendek & pilihan jelas.
 *  - Germane load: menghubungkan d = 2 × r, π = K ÷ d, dan refleksi di akhir.
 *  - Jawaban akhir tidak diberikan sebelum siswa mencoba; kesalahan umum didiagnosis.
 */
import { formatNumber, parseNumberInput, piLabel, piValue, round, suggestPi, type PiChoice } from "@/lib/math";

export type Quantity = "r" | "d" | "K";

export interface TutorProblem {
  given: Quantity;
  value: number;
  unit: string;
  asked: Quantity;
  /** Banyak putaran (soal jarak tempuh roda), opsional. */
  turns?: number;
  context: string;
}

export interface TutorState {
  problem: TutorProblem | null;
  /** Langkah yang sedang ditunggu jawabannya (0 = tidak ada soal aktif). */
  step: number;
  attempts: number;
}

export interface TutorReply {
  reply: string;
  step: number;
  state: TutorState;
}

export const EMPTY_TUTOR: TutorState = { problem: null, step: 0, attempts: 0 };

const NAME: Record<Quantity, string> = { r: "jari-jari (r)", d: "diameter (d)", K: "keliling (K)" };
const NUM = String.raw`(\d+(?:[.,]\d+)*)`;
/** Kata benda yang boleh terselip antara label dan angka, mis. "keliling lingkaran 88 cm". */
const FILLER = String.raw`(?:\s*(?:lingkaran|roda|sepeda|ban|taman|kolam|meja|jam|lintasan|piring|koin|tersebut|itu|ini))*`;

const CONTEXTS: [RegExp, string][] = [
  [/sepeda/, "roda sepeda"],
  [/roda|ban\b/, "roda"],
  [/taman|kebun/, "taman bundar"],
  [/kolam/, "kolam bundar"],
  [/meja/, "meja bundar"],
  [/jam/, "jam dinding"],
  [/pita|kado|kue|toples|kaleng/, "benda yang dililit pita"],
  [/lintasan|lari|stadion/, "lintasan lari"],
  [/piring/, "piring"],
  [/koin|uang/, "uang koin"],
];

const parseNum = (s: string) => parseNumberInput(s.replace(/\s/g, ""));

// ------------------------------------------------------------ pembacaan soal
function extract(text: string, re: RegExp): number | null {
  const m = re.exec(text);
  if (!m) return null;
  const n = parseNum(m[1]);
  return n !== null && n > 0 ? n : null;
}

/** Mencoba membaca soal keliling dari kalimat siswa. */
export function readProblem(raw: string): TutorProblem | null {
  const t = raw.toLowerCase().replace(/\s+/g, " ");
  const SEP = String.raw`\s*(?:=|:|adalah|sebesar|sepanjang|nya|yaitu)?\s*`;
  const r = extract(t, new RegExp(String.raw`(?:jari[- ]?jari(?:nya)?|\br\b)` + FILLER + SEP + NUM));
  const d = extract(t, new RegExp(String.raw`(?:diameter(?:nya)?|garis tengah(?:nya)?|\bd\b)` + FILLER + SEP + NUM));
  const k = extract(t, new RegExp(String.raw`(?:keliling(?:nya)?|\bk\b)` + FILLER + SEP + NUM));
  const turnsM = /(\d+)\s*(?:kali|x)\s*(?:putaran|berputar)?|berputar\s*(\d+)\s*kali|(\d+)\s*putaran/.exec(t);
  const turns = turnsM ? Number(turnsM[1] ?? turnsM[2] ?? turnsM[3]) : undefined;
  const unit = /\d\s*(mm|cm|km|m)\b/.exec(t)?.[1] ?? "cm";
  const context = CONTEXTS.find(([re]) => re.test(t))?.[1] ?? "lingkaran";

  if (r !== null) return { given: "r", value: r, unit, asked: "K", turns: turns && turns > 1 ? turns : undefined, context };
  if (d !== null) return { given: "d", value: d, unit, asked: "K", turns: turns && turns > 1 ? turns : undefined, context };
  if (k !== null) return { given: "K", value: k, unit, asked: /jari/.test(t) && !/diameter/.test(t) ? "r" : "d", context };
  return null;
}

// ----------------------------------------------------------- perhitungan
function piFor(p: TutorProblem): PiChoice {
  if (p.given === "K") return Number.isInteger(round(p.value / 22, 6)) || Number.isInteger(round((p.value * 7) / 22, 6)) ? "22/7" : "3.14";
  return suggestPi(p.value);
}

export function solve(p: TutorProblem, choice: PiChoice = piFor(p)): number {
  const pi = piValue(choice);
  let ans: number;
  if (p.given === "r") ans = 2 * pi * p.value;
  else if (p.given === "d") ans = pi * p.value;
  else ans = p.asked === "d" ? p.value / pi : p.value / (2 * pi);
  if (p.turns && p.given !== "K") ans *= p.turns;
  return round(ans, 2);
}

function formula(p: TutorProblem): string {
  if (p.given === "r") return "K = 2 × π × r";
  if (p.given === "d") return "K = π × d";
  return p.asked === "d" ? "d = K ÷ π" : "r = K ÷ (2 × π)";
}

function substitution(p: TutorProblem): string {
  const pl = piLabel(piFor(p));
  const v = formatNumber(p.value, 4);
  const base =
    p.given === "r" ? `K = 2 × ${pl} × ${v}` : p.given === "d" ? `K = ${pl} × ${v}` : p.asked === "d" ? `d = ${v} ÷ ${pl}` : `r = ${v} ÷ (2 × ${pl})`;
  return p.turns && p.given !== "K" ? `${base}, lalu jarak = ${p.turns} × K` : base;
}

const isClose = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.06, Math.abs(b) * 0.003);

function firstNumber(text: string): number | null {
  const m = /-?\d+(?:[.,]\d+)*/.exec(text);
  return m ? parseNum(m[0]) : null;
}

// ------------------------------------------------------------- teks bantu
const PRAISE = ["Mantap, penjelajah! 🚀", "Tepat sekali! ⭐", "Keren, orbitmu stabil! 🌟", "Yes, betul!"];
const pick = (list: string[], seed: number) => list[Math.abs(seed) % list.length];

function problemSentence(p: TutorProblem): string {
  const sizeName = p.given === "r" ? "jari-jari" : p.given === "d" ? "diameter" : "keliling";
  const asked = p.turns ? `jarak yang ditempuh setelah ${p.turns} putaran` : NAME[p.asked].replace(/ \(.\)/, "");
  return `Sebuah **${p.context}** memiliki ${sizeName} **${formatNumber(p.value, 4)} ${p.unit}**. Berapa **${asked}**-nya?`;
}

function stepPrompt(p: TutorProblem, step: number): string {
  switch (step) {
    case 1:
      return `**Langkah 1 — Memahami situasi.** Soal ini tentang ${p.context} yang berbentuk lingkaran.\nCoba sebutkan dengan kata-katamu: **apa yang ditanyakan** soal ini?`;
    case 2:
      return p.given === "K"
        ? `**Langkah 2 — Diketahui & ditanya.** Angka **${formatNumber(p.value, 4)} ${p.unit}** itu ukuran apa: jari-jari, diameter, atau keliling?`
        : `**Langkah 2 — Diketahui & ditanya.** Ukuran **${formatNumber(p.value, 4)} ${p.unit}** itu **jari-jari** atau **diameter**?`;
    case 3:
      return `**Langkah 3 — Mengenali konsep.** ${formulaChoices(p)}`;
    case 4:
      return `**Langkah 4 — Strategi.** Kita pakai **${formula(p)}**. Nilai π mana yang paling memudahkan: **22/7** atau **3,14**?\n(Petunjuk: lihat apakah angkanya kelipatan 7.)`;
    case 5:
      return `**Langkah 5 — Menghitung.** Substitusi: \`${substitution(p)}\`.\nHitung pelan-pelan, lalu kirim hasilnya (pakai koma untuk desimal).`;
    default:
      return "";
  }
}

function formulaChoices(p: TutorProblem): string {
  if (p.given === "K")
    return `Kita sudah tahu kelilingnya. Ingat **π = K ÷ d**. Rumus mana untuk mencari ${NAME[p.asked]}?\n- A. ${p.asked === "d" ? "d = K ÷ π" : "r = K ÷ (2 × π)"}\n- B. ${p.asked === "d" ? "d = K × π" : "r = K × π"}\n- C. ${p.asked === "d" ? "d = K ÷ 2" : "r = K ÷ π"}`;
  return `Yang dicari adalah **keliling**: panjang garis yang mengelilingi lingkaran. Rumus mana yang cocok bila diketahui ${NAME[p.given]}?\n- A. K = π × d\n- B. K = 2 × π × r\n- C. K = π × r × r`;
}

function correctChoice(p: TutorProblem): "a" | "b" {
  if (p.given === "K") return "a";
  return p.given === "d" ? "a" : "b";
}

function fullSolution(p: TutorProblem): string {
  const ans = solve(p);
  const lines = [`- Diketahui: ${p.given} = ${formatNumber(p.value, 4)} ${p.unit}`, `- Rumus: ${formula(p)}`, `- Substitusi: ${substitution(p)}`];
  if (p.turns && p.given !== "K") {
    const k = solve({ ...p, turns: undefined });
    lines.push(`- Keliling = ${formatNumber(k)} ${p.unit}, jarak = ${p.turns} × ${formatNumber(k)} = **${formatNumber(ans)} ${p.unit}**`);
  } else lines.push(`- Hasil: **${formatNumber(ans)} ${p.unit}**`);
  return lines.join("\n");
}

/** Mendiagnosis kesalahan umum dari jawaban angka siswa. */
export function diagnose(p: TutorProblem, v: number): string {
  const pi = piValue(piFor(p));
  const n = p.turns && p.given !== "K" ? p.turns : 1;
  if (p.given === "r") {
    if (isClose(v, pi * p.value * n)) return "Sepertinya kamu **lupa dikali 2**. Karena yang diketahui jari-jari, rumusnya K = **2** × π × r.";
    if (isClose(v, pi * p.value * p.value)) return "Itu rumus **luas** (π × r × r), bukan keliling. Keliling memakai K = 2 × π × r.";
    if (isClose(v, 2 * p.value)) return "Itu baru **diameter** (2 × r). Masih perlu dikalikan π, ya.";
  }
  if (p.given === "d") {
    if (isClose(v, 2 * pi * p.value * n)) return "Kamu memakai diameter seperti jari-jari (dikali 2 lagi). Kalau diketahui **diameter**, cukup K = π × d.";
    if (isClose(v, (pi * p.value * n) / 2)) return "Hasilmu setengah dari seharusnya — mungkin diameter dibagi 2 dulu tapi lupa dikali 2. Pakai saja K = π × d.";
    if (isClose(v, pi * (p.value / 2) ** 2)) return "Itu rumus **luas**, bukan keliling. Keliling: K = π × d.";
  }
  if (p.given !== "K" && n > 1 && isClose(v, solve({ ...p, turns: undefined }))) return `Itu baru keliling untuk **1 putaran**. Rodanya berputar ${n} kali, jadi kalikan dengan ${n}.`;
  if (p.given === "K" && p.asked === "r" && isClose(v, p.value / pi)) return "Itu **diameter**. Jari-jari = diameter ÷ 2.";
  if (p.given === "K" && p.asked === "d" && isClose(v, p.value / (2 * pi))) return "Itu **jari-jari**. Diameter = 2 × jari-jari.";
  if (p.given === "K" && isClose(v, p.value * pi)) return "Arahnya terbalik: untuk mencari ukuran dari keliling, **dibagi** π, bukan dikali.";
  return `Belum tepat, tapi tidak apa-apa! Ikuti lagi: \`${substitution(p)}\`. ${p.given === "r" ? `Hitung dulu 2 × ${formatNumber(p.value, 4)}, baru dikali π.` : "Kerjakan satu operasi dulu, lalu lanjutkan."}`;
}

// ------------------------------------------------------------- soal latihan
const PRACTICE_CONTEXTS = ["roda sepeda", "jam dinding", "taman bundar", "meja bundar", "kolam bundar", "piring"];
const PRACTICE_VALUES = [7, 14, 21, 28, 35, 10, 20, 50];

export function practiceProblem(seed: number = Date.now()): TutorProblem {
  const given: Quantity = seed % 2 === 0 ? "r" : "d";
  return {
    given,
    value: PRACTICE_VALUES[Math.floor(seed / 2) % PRACTICE_VALUES.length],
    unit: "cm",
    asked: "K",
    context: PRACTICE_CONTEXTS[Math.floor(seed / 7) % PRACTICE_CONTEXTS.length],
  };
}

// ------------------------------------------------------------ penjelasan konsep
const CONCEPTS: [RegExp, string][] = [
  [
    /beda|perbedaan|bedanya/,
    "**Jari-jari (r)** = garis dari titik pusat ke tepi lingkaran.\n**Diameter (d)** = garis yang melewati pusat dari tepi ke tepi.\nJadi **d = 2 × r** dan **r = d ÷ 2**.\nContoh: jari-jari 7 cm → diameter 14 cm. Coba: kalau diameter 20 cm, jari-jarinya berapa?",
  ],
  [
    /\bpi\b|π|22\/7|3[,.]14/,
    "**π (pi)** adalah hasil bagi keliling dengan diameter: **π = K ÷ d ≈ 3,14 ≈ 22/7** — sama untuk semua lingkaran!\nTips memilih: angka **kelipatan 7** → pakai **22/7** (7-nya bisa dicoret). Lainnya → **3,14**.\nCoba tebak: untuk r = 21 cm, π mana yang lebih mudah?",
  ],
  [
    /rumus|cara (menghitung|mencari)|bagaimana (menghitung|mencari)/,
    "Ada dua rumus keliling yang sebenarnya **sama**:\n- Diketahui diameter: **K = π × d**\n- Diketahui jari-jari: **K = 2 × π × r**\nKenapa sama? Karena **d = 2 × r**, jadi π × d = π × 2 × r.\nMau coba satu soal? Ketik **soal latihan**.",
  ],
  [
    /keliling/,
    "**Keliling** adalah panjang garis yang mengelilingi lingkaran satu putaran penuh — seperti jarak yang ditempuh semut berjalan di tepi piring.\nRoda yang berputar 1 kali menempuh jarak = kelilingnya.\nMau tahu rumusnya? Ketik **rumus keliling**.",
  ],
  [
    /unsur|busur|juring|tembereng|tali busur/,
    "Unsur lingkaran: **titik pusat**, **jari-jari**, **diameter**, **tali busur** (garis lurus antar dua titik di lingkaran), **busur** (garis lengkung), **juring** (daerah antara dua jari-jari, seperti potongan pizza), dan **tembereng** (daerah antara tali busur dan busur).\nCoba buka Circle Laboratory untuk melihatnya di diagram!",
  ],
];

const MENU =
  "Aku bisa membantu:\n- Menjelaskan **rumus keliling**, **nilai π**, atau **beda jari-jari dan diameter**\n- Membimbing soalmu langkah demi langkah — tulis soalnya, mis. *roda berjari-jari 14 cm, berapa kelilingnya?*\n- Memberi **soal latihan**";

// ------------------------------------------------------------------ mesin
function startProblem(p: TutorProblem, intro: string): TutorReply {
  return { reply: `${intro}\n\n${stepPrompt(p, 1)}`, step: 1, state: { problem: p, step: 1, attempts: 0 } };
}

/** Menghasilkan balasan BIMO berikutnya. Fungsi murni: state lama → state baru. */
export function tutorReply(state: TutorState, raw: string, seed: number = Date.now()): TutorReply {
  const text = raw.trim();
  const t = text.toLowerCase();
  const p = state.problem;

  // Permintaan soal latihan / soal baru
  if (/soal (latihan|baru|lagi)|latihan soal|beri(kan)? (aku )?soal|kasih soal/.test(t)) {
    const np = practiceProblem(seed);
    return startProblem(np, `Siap! Ini soal latihannya:\n${problemSentence(np)}`);
  }

  // Soal baru dari siswa (berisi ukuran berlabel) — saat belum ada soal atau di awal bimbingan
  const fresh = readProblem(text);
  if (fresh && (!p || state.step <= 1 || /berapa|hitung|tentukan|cari/.test(t))) {
    const asked = fresh.turns ? "jarak tempuh roda" : NAME[fresh.asked];
    return startProblem(fresh, `Wah, soal yang seru, penjelajah! 🚀 Kita pecahkan bersama, ya. Targetnya: mencari **${asked}**.`);
  }

  // Pertanyaan konsep (dijawab kapan saja, soal aktif tetap tersimpan)
  const concept = CONCEPTS.find(([re]) => re.test(t) && (!p || /apa|jelaskan|beda|kenapa|mengapa|bagaimana|maksud/.test(t)));
  if (concept && !(p && state.step === 5 && firstNumber(t) !== null)) {
    const back = p ? `\n\n(Soal kita masih menunggu — ${stepPrompt(p, state.step).split("\n")[0]})` : "";
    return { reply: concept[1] + back, step: p ? state.step : 3, state };
  }

  if (!p) {
    if (/^(hai|halo|hallo|hi|hello|pagi|siang|sore|malam|assalam)/.test(t))
      return { reply: `Halo, penjelajah! Aku **BIMO**. 🚀\n${MENU}`, step: 0, state };
    if (firstNumber(t) !== null)
      return { reply: "Angka itu ukuran apa, ya? Tulis lengkap, misalnya **jari-jari 14 cm** atau **diameter 20 cm**, supaya Bimo bisa membimbing langkah demi langkah.", step: 2, state };
    return { reply: `Hmm, Bimo khusus membahas **keliling lingkaran**, nih. 😊\n${MENU}`, step: 0, state };
  }

  // Minta jawaban langsung
  if (/jawaban(nya)?|kasih tahu|beri tahu|menyerah|nyerah|langsung saja|nggak bisa|tidak bisa|ga bisa/.test(t) && firstNumber(t) === null) {
    if (state.attempts === 0 && state.step < 5)
      return { reply: `Bimo yakin kamu bisa! Kita coba satu langkah dulu, ya.\n\n${stepPrompt(p, state.step)}`, step: state.step, state };
    return {
      reply: `Tidak apa-apa, ini penyelesaian lengkapnya:\n${fullSolution(p)}\n\n**Langkah 6 — Refleksi.** Bagian mana yang tadi paling sulit? Coba ceritakan dengan kata-katamu.`,
      step: 6,
      state: { ...state, step: 6 },
    };
  }

  switch (state.step) {
    case 1: {
      const ok = /keliling|jarak|diameter|jari|panjang|putaran/.test(t);
      const ask = p.turns ? `jarak tempuh setelah ${p.turns} putaran` : NAME[p.asked];
      const fb = ok ? `${pick(PRAISE, seed)} Yang ditanyakan memang **${ask}**.` : `Yang ditanyakan adalah **${ask}**.`;
      return { reply: `${fb}\n\n${stepPrompt(p, 2)}`, step: 2, state: { ...state, step: 2 } };
    }
    case 2: {
      const said: Quantity | null = /keliling|\bk\b/.test(t) ? "K" : /diameter|\bd\b|garis tengah/.test(t) ? "d" : /jari|\br\b/.test(t) ? "r" : null;
      const known = `Diketahui **${p.given} = ${formatNumber(p.value, 4)} ${p.unit}**, ditanya **${p.turns ? "jarak tempuh" : NAME[p.asked]}**.`;
      const fb =
        said === p.given
          ? `${pick(PRAISE, seed)} ${known}`
          : `Hampir! Di soal tertulis **${NAME[p.given]}**. ${p.given === "r" ? "Jari-jari = dari pusat ke tepi." : p.given === "d" ? "Diameter = dari tepi ke tepi melewati pusat." : ""} Jadi: ${known}`;
      return { reply: `${fb}\n\n${stepPrompt(p, 3)}`, step: 3, state: { ...state, step: 3 } };
    }
    case 3: {
      const want = correctChoice(p);
      const letter = /\b([abc])\b/.exec(t)?.[1];
      const byText = p.given === "r" ? /2\s*[x×*]?\s*(π|pi)/.test(t) : p.given === "d" ? /(π|pi)\s*[x×*]\s*d|k\s*=\s*(π|pi)\s*[x×*]?\s*d/.test(t) : /÷|bagi|\//.test(t);
      const ok = letter ? letter === want : byText;
      const why =
        p.given === "r"
          ? "Karena yang diketahui jari-jari dan d = 2 × r, rumusnya **K = 2 × π × r**. (π × r × r itu rumus luas.)"
          : p.given === "d"
            ? "Karena yang diketahui diameter, cukup **K = π × d**."
            : `Dari π = K ÷ d, kita dapat **${formula(p)}**.`;
      const fb = ok ? `${pick(PRAISE, seed)} ${why}` : `Belum tepat, tapi dekat! ${why}`;
      return { reply: `${fb}\n\n${stepPrompt(p, 4)}`, step: 4, state: { ...state, step: 4 } };
    }
    case 4: {
      const best = piFor(p);
      const chose: PiChoice | null = /22\s*\/\s*7/.test(t) ? "22/7" : /3[,.]14/.test(t) ? "3.14" : null;
      const reason = best === "22/7" ? "angkanya **kelipatan 7**, jadi 7-nya bisa dicoret" : "angkanya **bukan kelipatan 7**, jadi 3,14 lebih mudah";
      const fb =
        chose === best
          ? `${pick(PRAISE, seed)} π = ${piLabel(best)} paling mudah karena ${reason}.`
          : chose
            ? `Boleh juga, tapi π = **${piLabel(best)}** lebih mudah karena ${reason}. Kita pakai itu, ya.`
            : `Kita pakai π = **${piLabel(best)}**, karena ${reason}.`;
      return { reply: `${fb}\n\n${stepPrompt(p, 5)}`, step: 5, state: { ...state, step: 5, attempts: 0 } };
    }
    case 5: {
      const v = firstNumber(t);
      if (v === null) return { reply: `Kirim hasil hitunganmu berupa **angka**, ya. Contoh: 88 atau 62,8.\n\n${stepPrompt(p, 5)}`, step: 5, state };
      const ans = solve(p);
      const alt = solve(p, piFor(p) === "22/7" ? "3.14" : "22/7");
      if (isClose(v, ans) || isClose(v, alt)) {
        const check =
          p.given === "K"
            ? `Cek balik: ${p.asked === "d" ? `π × ${formatNumber(ans)}` : `2 × π × ${formatNumber(ans)}`} ≈ ${formatNumber(p.value)} ✓`
            : `Cek: K ÷ d harus ≈ 3,14 → ${formatNumber(solve({ ...p, turns: undefined }))} ÷ ${formatNumber(p.given === "r" ? 2 * p.value : p.value, 4)} ≈ 3,14 ✓`;
        return {
          reply: `${pick(PRAISE, seed)} **${formatNumber(ans)} ${p.unit}** — benar!\n\n**Langkah 6 — Memeriksa & refleksi.** ${check}\nSekarang jelaskan dengan kata-katamu: **kenapa** kita memakai rumus ${formula(p)}?`,
          step: 6,
          state: { ...state, step: 6, attempts: state.attempts + 1 },
        };
      }
      const attempts = state.attempts + 1;
      if (attempts >= 2)
        return {
          reply: `Hampir! ${diagnose(p, v)}\n\nKarena sudah mencoba dua kali, ini penyelesaian lengkapnya:\n${fullSolution(p)}\n\n**Langkah 6 — Refleksi.** Bandingkan dengan hitunganmu: di bagian mana bedanya?`,
          step: 6,
          state: { ...state, step: 6, attempts },
        };
      return { reply: `${diagnose(p, v)}\nCoba hitung sekali lagi, ya! Bimo yakin kamu bisa. 💪`, step: 5, state: { ...state, attempts } };
    }
    default: {
      // Langkah 6 selesai: tutup sesi dengan apresiasi
      return {
        reply: `Penjelasan yang bagus! 🌟 Kamu sudah melewati **6 langkah**: memahami soal, menulis diketahui-ditanya, memilih konsep, menentukan strategi, menghitung, dan memeriksa.\nMau lanjut? Ketik **soal latihan**, atau kirim soal lain.`,
        step: 6,
        state: EMPTY_TUTOR,
      };
    }
  }
}
