"use client";

import { useMemo, useState } from "react";
import { Check, Lightbulb, RotateCcw, Ruler, Shuffle } from "lucide-react";
import type { ActivityKey } from "@/content/missions";
import { OBJECT_INFO } from "@/lib/objects";
import { formatNumber, parseNumberInput } from "@/lib/math";
import { shuffle } from "@/lib/games";
import { ObjectIcon } from "@/components/cosmic/ObjectIcon";
import { CircleAnatomy } from "@/components/circle/CircleAnatomy";
import { RotationSimulator } from "@/components/circle/RotationSimulator";
import { BimoSays } from "@/components/bimo/BimoSays";

export function MissionActivity({ kind }: { kind: ActivityKey }) {
  switch (kind) {
    case "circle-hunt":
      return <ShapeScanner />;
    case "anatomy":
      return <CircleAnatomy />;
    case "pi-measure":
      return <PiMeasure />;
    case "rolling-wheel":
      return <RotationSimulator />;
    case "formula-builder":
      return <FormulaBuilder />;
    case "real-world":
      return <RealWorldSolver />;
    case "final-recap":
      return <FlashCards />;
  }
}

// ---------- Misi 1: Pemindai bentuk ----------
const SCAN_OBJECTS = ["coin", "book", "clock", "egg", "wheel", "slice", "plate", "kite"];

function ShapeScanner() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const circles = SCAN_OBJECTS.filter((o) => OBJECT_INFO[o].circle);
  const right = SCAN_OBJECTS.filter((o) => selected.has(o) === OBJECT_INFO[o].circle).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SCAN_OBJECTS.map((o) => {
          const sel = selected.has(o);
          const info = OBJECT_INFO[o];
          const state = checked ? (sel === info.circle ? "border-emerald-300/70 bg-emerald-400/10" : "border-rose-300/70 bg-rose-400/10") : sel ? "border-ice bg-royal/40 ring-2 ring-ice/40" : "border-ice/15 bg-navy/40 hover:border-ice/50";
          return (
            <button
              key={o}
              type="button"
              disabled={checked}
              aria-pressed={sel}
              onClick={() => setSelected((s) => { const n = new Set(s); if (n.has(o)) n.delete(o); else n.add(o); return n; })}
              className={`flex flex-col items-center gap-1 rounded-3xl border p-3 text-center transition ${state}`}
            >
              <ObjectIcon name={o} size={64} />
              <span className="text-sm font-bold">{info.name}</span>
              {checked && <span className="text-xs text-soft/75">{info.why}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!checked ? (
          <button type="button" onClick={() => setChecked(true)} disabled={selected.size === 0} className="btn-cyan"><Check size={16} /> Periksa</button>
        ) : (
          <button type="button" onClick={() => { setChecked(false); setSelected(new Set()); }} className="btn-ghost"><RotateCcw size={16} /> Ulangi</button>
        )}
        {checked && (
          <p className={`font-bold ${right === SCAN_OBJECTS.length ? "text-emerald-200" : "text-gold"}`}>
            {right}/{SCAN_OBJECTS.length} objek tepat. {right === SCAN_OBJECTS.length ? "Pemindaian sempurna!" : `Lingkarannya: ${circles.map((c) => OBJECT_INFO[c].name).join(", ")}.`}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Misi 3: Pita ukur ----------
const MEASURE = [
  { icon: "lid", name: "Tutup gelas", d: 7, k: 22 },
  { icon: "cd", name: "Keping CD", d: 12, k: 37.7 },
  { icon: "plate", name: "Piring", d: 20, k: 62.8 },
  { icon: "clock", name: "Jam dinding", d: 28, k: 88 },
  { icon: "wheel", name: "Roda sepeda", d: 56, k: 175.9 },
];

function PiMeasure() {
  const [measured, setMeasured] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);

  const measure = (i: number) => {
    if (measured.includes(i)) return;
    setActive(i);
    setTimeout(() => {
      setMeasured((m) => [...m, i]);
      setActive(null);
    }, 900);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {MEASURE.map((o, i) => (
          <button key={o.name} type="button" onClick={() => measure(i)} disabled={measured.includes(i) || active !== null} className={`flex flex-col items-center gap-1 rounded-3xl border p-3 transition ${measured.includes(i) ? "border-emerald-300/50 bg-emerald-400/10" : "border-ice/15 bg-navy/40 hover:border-ice/50"}`}>
            <span className={active === i ? "animate-spin-med" : ""}><ObjectIcon name={o.icon} size={56} /></span>
            <span className="text-sm font-bold">{o.name}</span>
            <span className="flex items-center gap-1 text-xs text-ice"><Ruler size={12} /> {measured.includes(i) ? "terukur" : active === i ? "mengukur..." : "ukur"}</span>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-ice/15">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-royal/30 font-hud text-xs text-ice">
            <tr><th className="px-4 py-2">Benda</th><th className="px-4 py-2">Keliling (K)</th><th className="px-4 py-2">Diameter (d)</th><th className="px-4 py-2">K ÷ d</th></tr>
          </thead>
          <tbody>
            {measured.length === 0 && <tr><td colSpan={4} className="px-4 py-4 text-center text-soft/50">Ketuk benda untuk mengukurnya.</td></tr>}
            {measured.map((i) => {
              const o = MEASURE[i];
              return (
                <tr key={o.name} className="animate-slide-up border-t border-white/5">
                  <td className="px-4 py-2 font-bold">{o.name}</td>
                  <td className="px-4 py-2">{formatNumber(o.k)} cm</td>
                  <td className="px-4 py-2">{o.d} cm</td>
                  <td className="px-4 py-2 font-hud font-black text-gold">{formatNumber(o.k / o.d, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {measured.length >= 3 && (
        <BimoSays mood="wow" size={72}>Lihat kolom terakhir! Besar atau kecil bendanya, K ÷ d selalu sekitar 3,14. Itulah π!</BimoSays>
      )}
    </div>
  );
}

// ---------- Misi 5: Rakit rumus ----------
const TOKENS = ["π", "r", "=", "×", "K", "2", "×"]; // urutan sengaja diacak

function isValidFormula(seq: string[]): boolean {
  if (seq.length !== 7 || seq[0] !== "K" || seq[1] !== "=" || seq[3] !== "×" || seq[5] !== "×") return false;
  const factors = [seq[2], seq[4], seq[6]].sort().join(",");
  return factors === ["2", "π", "r"].sort().join(",");
}

function FormulaBuilder() {
  const [pool, setPool] = useState(() => TOKENS.map((t, i) => ({ t, id: i })));
  const [built, setBuilt] = useState<{ t: string; id: number }[]>([]);
  const [rRaw, setRRaw] = useState("7");
  const valid = built.length === 7 && isValidFormula(built.map((b) => b.t));
  const r = parseNumberInput(rRaw);

  return (
    <div className="space-y-5">
      <div className="panel-hud flex min-h-[72px] flex-wrap items-center gap-2 p-4" aria-live="polite">
        {built.length === 0 && <span className="text-sm text-soft/50">Ketuk kepingan di bawah untuk menyusun rumus keliling dari jari-jari…</span>}
        {built.map((b) => (
          <button key={b.id} type="button" onClick={() => { setBuilt((x) => x.filter((y) => y.id !== b.id)); setPool((p) => [...p, b]); }} className="rounded-xl bg-neon px-3 py-2 font-hud text-lg font-black">
            {b.t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((p) => (
          <button key={p.id} type="button" onClick={() => { setPool((x) => x.filter((y) => y.id !== p.id)); setBuilt((b) => [...b, p]); }} className="rounded-xl border border-ice/40 bg-navy/60 px-3 py-2 font-hud text-lg font-black hover:border-ice">
            {p.t}
          </button>
        ))}
        <button type="button" onClick={() => { setPool(shuffle(TOKENS.map((t, i) => ({ t, id: i })))); setBuilt([]); }} className="btn-ghost px-3 py-2 text-sm"><Shuffle size={14} /> Acak ulang</button>
      </div>
      {built.length === 7 && (
        <p className={`rounded-2xl px-4 py-3 text-sm font-bold ${valid ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>
          {valid ? "Rumus inti aktif! K = 2 × π × r (urutan perkalian boleh ditukar)." : "Belum tepat. Ingat: K = … lalu kalikan 2, π, dan r."}
        </p>
      )}
      {valid && (
        <div className="panel animate-pop-in flex flex-wrap items-end gap-4 p-4">
          <div>
            <label htmlFor="fb-r" className="label">Uji rumus: r =</label>
            <input id="fb-r" inputMode="decimal" value={rRaw} onChange={(e) => setRRaw(e.target.value)} className="input w-32" />
          </div>
          {r !== null && r > 0 ? (
            <div className="space-y-1 text-sm">
              <p>π = 22/7 → K = 2 × 22/7 × {formatNumber(r)} = <b className="text-gold">{formatNumber((44 / 7) * r)}</b></p>
              <p>π = 3,14 → K = 2 × 3,14 × {formatNumber(r)} = <b className="text-gold">{formatNumber(6.28 * r)}</b></p>
              <p className="text-soft/60">Cek dengan K = π × d: d = {formatNumber(2 * r)}, K = 3,14 × {formatNumber(2 * r)} = {formatNumber(3.14 * 2 * r)} ✓ sama!</p>
            </div>
          ) : (
            <p className="field-error">Masukkan angka positif.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Misi 6: Misi lapangan ----------
const CASES = [
  { icon: "wheel", title: "Roda gerobak", q: "Roda gerobak berjari-jari 21 cm. Berapa cm jarak satu putaran?", answer: 132, unit: "cm", hint: "Satu putaran = keliling. Pakai K = 2 × π × r dengan π = 22/7.", steps: ["K = 2 × 22/7 × 21", "K = 2 × 22 × 3 = 132 cm"] },
  { icon: "garden", title: "Pagar kolam", q: "Kolam bundar berdiameter 14 m dipagari. Berapa meter pagarnya?", answer: 44, unit: "m", hint: "Pagar mengelilingi kolam = keliling. Diketahui diameter → K = π × d.", steps: ["K = 22/7 × 14", "K = 22 × 2 = 44 m"] },
  { icon: "ribbon", title: "Pita toples", q: "Toples berdiameter 35 cm dililit pita 1 kali + 5 cm untuk simpul. Berapa cm pitanya?", answer: 115, unit: "cm", hint: "Hitung keliling dulu, lalu tambah 5 cm.", steps: ["K = 22/7 × 35 = 110 cm", "Pita = 110 + 5 = 115 cm"] },
  { icon: "track", title: "Lari 2 putaran", q: "Lintasan berjari-jari 70 m. Doni berlari 2 putaran. Berapa meter jaraknya?", answer: 880, unit: "m", hint: "Jarak = banyak putaran × keliling.", steps: ["K = 2 × 22/7 × 70 = 440 m", "Jarak = 2 × 440 = 880 m"] },
];

function RealWorldSolver() {
  const [i, setI] = useState(0);
  const [raw, setRaw] = useState("");
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<"ok" | "no" | null>(null);
  const c = CASES[i];
  const altAnswer = useMemo(() => {
    // Toleransi untuk siswa yang memakai π = 3,14.
    return c.answer * (3.14 / (22 / 7));
  }, [c]);

  const check = () => {
    const n = parseNumberInput(raw);
    if (n === null) return setResult("no");
    setResult(Math.abs(n - c.answer) <= 0.05 || Math.abs(n - altAnswer) <= 0.06 ? "ok" : "no");
  };

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="flex flex-row gap-2 overflow-x-auto md:flex-col">
        {CASES.map((cs, idx) => (
          <button key={cs.title} type="button" onClick={() => { setI(idx); setRaw(""); setHint(false); setResult(null); }} className={`choice shrink-0 ${idx === i ? "choice-selected" : ""}`}>
            <ObjectIcon name={cs.icon} size={32} /> {cs.title}
          </button>
        ))}
      </div>
      <div key={i} className="panel animate-slide-up space-y-4 p-5">
        <div className="flex items-center gap-4">
          <ObjectIcon name={c.icon} size={72} />
          <p className="font-bold">{c.q}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input inputMode="decimal" value={raw} onChange={(e) => { setRaw(e.target.value); setResult(null); }} placeholder="jawabanmu" aria-label="Jawaban" className="input max-w-[180px]" />
          <span className="font-bold text-soft/70">{c.unit}</span>
          <button type="button" onClick={check} disabled={!raw.trim()} className="btn-cyan">Cek</button>
          <button type="button" onClick={() => setHint(true)} className="btn-ghost"><Lightbulb size={16} /> Petunjuk</button>
        </div>
        {hint && <p className="rounded-2xl bg-gold/10 px-4 py-2 text-sm text-gold">BIMO: {c.hint}</p>}
        {result && (
          <div className={`rounded-2xl p-4 text-sm ${result === "ok" ? "bg-emerald-400/10 text-emerald-100" : "bg-rose-400/10 text-rose-100"}`}>
            <p className="font-bold">{result === "ok" ? "YEAH! Jawabanmu tepat!" : "Hampir! Coba periksa langkahnya:"}</p>
            <ol className="mt-1 list-decimal pl-5 text-soft/90">
              {c.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Misi 7: Kartu kilat ----------
const CARDS = [
  ["Apa itu lingkaran?", "Kumpulan titik yang berjarak sama ke titik pusat."],
  ["Hubungan d dan r?", "d = 2 × r, r = d ÷ 2"],
  ["Beda busur & tali busur?", "Busur = lengkung; tali busur = garis lurus."],
  ["Beda juring & tembereng?", "Juring dibatasi 2 jari-jari; tembereng dibatasi tali busur."],
  ["Apa itu π?", "K ÷ d ≈ 3,14 ≈ 22/7, sama untuk semua lingkaran."],
  ["Kapan pakai 22/7?", "Saat r atau d kelipatan 7."],
  ["Rumus keliling?", "K = π × d = 2 × π × r"],
  ["Roda berputar n kali?", "Jarak = n × keliling roda."],
];

function FlashCards() {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CARDS.map(([q, a], i) => {
          const f = flipped.has(i);
          return (
            <button
              key={q}
              type="button"
              onClick={() => setFlipped((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
              aria-pressed={f}
              className={`min-h-[130px] rounded-3xl border p-4 text-left transition duration-300 ${f ? "border-gold/50 bg-gold/10" : "border-ice/20 bg-royal/25 hover:-translate-y-1"}`}
            >
              <span className="font-hud text-[10px] font-bold text-ice">{f ? "JAWABAN" : `KARTU ${i + 1}`}</span>
              <span key={String(f)} className="mt-2 block animate-pop-in font-bold">{f ? a : q}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-soft/65">{flipped.size}/{CARDS.length} kartu dibuka. {flipped.size === CARDS.length && "Ingatanmu siap untuk Final Examination!"}</p>
    </div>
  );
}
