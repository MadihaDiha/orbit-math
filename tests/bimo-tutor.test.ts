import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_TUTOR, diagnose, readProblem, solve, tutorReply, type TutorState } from "../src/lib/bimo-tutor";

function run(messages: string[], seed = 1) {
  let state: TutorState = EMPTY_TUTOR;
  const out: { reply: string; step: number }[] = [];
  for (const m of messages) {
    const r = tutorReply(state, m, seed);
    state = r.state;
    out.push({ reply: r.reply, step: r.step });
  }
  return { out, state };
}

test("membaca berbagai bentuk soal", () => {
  assert.deepEqual(
    { ...readProblem("Roda sepeda berjari-jari 14 cm, berapa kelilingnya?")!, context: "x" },
    { given: "r", value: 14, unit: "cm", asked: "K", turns: undefined, context: "x" },
  );
  const d = readProblem("taman bundar diameternya 20 m dipagari, berapa panjang pagar?")!;
  assert.equal(d.given, "d"); assert.equal(d.value, 20); assert.equal(d.unit, "m"); assert.equal(d.context, "taman bundar");
  const k = readProblem("keliling lingkaran 88 cm, berapa jari-jarinya?")!;
  assert.equal(k.given, "K"); assert.equal(k.asked, "r");
  const turns = readProblem("roda jari-jari 7 cm berputar 10 kali, berapa jaraknya?")!;
  assert.equal(turns.turns, 10);
  assert.equal(readProblem("halo bimo"), null);
  assert.equal(readProblem("jari-jari 7,5 cm")!.value, 7.5);
});

test("perhitungan benar untuk semua jenis soal", () => {
  assert.equal(solve(readProblem("jari-jari 14 cm")!), 88);
  assert.equal(solve(readProblem("diameter 10 cm")!), 31.4);
  assert.equal(solve(readProblem("keliling 88 cm berapa diameternya")!), 28);
  assert.equal(solve(readProblem("keliling 88 cm berapa jari-jarinya")!), 14);
  assert.equal(solve(readProblem("roda jari-jari 7 cm berputar 10 kali")!), 440);
});

test("alur 6 langkah lengkap: jawaban akhir tidak diberikan di awal", () => {
  const { out, state } = run([
    "Roda sepeda berjari-jari 14 cm. Berapa kelilingnya?",
    "yang ditanya kelilingnya",
    "itu jari-jari",
    "B",
    "22/7",
    "88 cm",
    "karena yang diketahui jari-jari jadi dikali 2",
  ]);
  assert.deepEqual(out.map((o) => o.step), [1, 2, 3, 4, 5, 6, 6]);
  // sebelum siswa menghitung, angka 88 belum pernah disebut BIMO
  for (const o of out.slice(0, 5)) assert.ok(!/\b88\b/.test(o.reply), o.reply);
  assert.match(out[5].reply, /benar/i);
  assert.match(out[5].reply, /Langkah 6/);
  assert.deepEqual(state, EMPTY_TUTOR); // sesi ditutup setelah refleksi
});

test("kesalahan umum didiagnosis dengan penjelasan", () => {
  const p = readProblem("jari-jari 14 cm")!;
  assert.match(diagnose(p, 44), /lupa dikali 2/);
  assert.match(diagnose(p, 616), /rumus \*\*luas\*\*/);
  assert.match(diagnose(p, 28), /diameter/);
  const d = readProblem("diameter 14 cm")!;
  assert.match(diagnose(d, 88), /diameter seperti jari-jari/);
  const t = readProblem("roda jari-jari 7 cm berputar 10 kali")!;
  assert.match(diagnose(t, 44), /1 putaran/);
});

test("dua kali salah → penyelesaian lengkap ditunjukkan; minta jawaban di awal → diajak mencoba", () => {
  const { out } = run(["jari-jari 14 cm, berapa kelilingnya?", "keliling", "jari-jari", "B", "22/7", "44", "50"]);
  assert.match(out[5].reply, /lupa dikali 2/);
  assert.equal(out[5].step, 5);
  assert.match(out[6].reply, /penyelesaian lengkap/);
  assert.match(out[6].reply, /88/);

  const early = run(["jari-jari 14 cm, berapa kelilingnya?", "kasih tahu jawabannya aja"]);
  assert.match(early.out[1].reply, /yakin kamu bisa/);
  assert.ok(!/\b88\b/.test(early.out[1].reply));
});

test("jawaban dengan π lain tetap diterima; konsep dijawab; di luar topik diarahkan", () => {
  const { out } = run(["jari-jari 14 cm berapa kelilingnya", "keliling", "jari", "B", "3,14", "87,92"]);
  assert.match(out[5].reply, /benar/);
  assert.match(tutorReply(EMPTY_TUTOR, "apa bedanya jari-jari dan diameter?").reply, /d = 2 × r/);
  assert.match(tutorReply(EMPTY_TUTOR, "jelaskan nilai pi").reply, /22\/7/);
  assert.match(tutorReply(EMPTY_TUTOR, "siapa presiden pertama?").reply, /keliling lingkaran/);
  const latihan = tutorReply(EMPTY_TUTOR, "beri aku soal latihan", 4);
  assert.equal(latihan.step, 1);
  assert.ok(latihan.state.problem);
});
