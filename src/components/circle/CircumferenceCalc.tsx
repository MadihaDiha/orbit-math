"use client";

import { Calculator } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PI_OPTIONS, calculateCircumference, formatNumber, parseNumberInput, piLabel, suggestPi, type CircumferenceResult, type PiChoice } from "@/lib/math";
import { validateMeasurement } from "@/lib/validation";

/** Kalkulator keliling dengan validasi & langkah penyelesaian. Semua dihitung dinamis. */
export function CircumferenceCalc() {
  const [mode, setMode] = useState<"radius" | "diameter">("radius");
  const [raw, setRaw] = useState("");
  const [pi, setPi] = useState<PiChoice>("3.14");
  const [unit, setUnit] = useState("cm");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CircumferenceResult | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseNumberInput(raw);
    const err = validateMeasurement(raw, parsed);
    if (err || parsed === null) {
      setError(err ?? "Input tidak valid.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateCircumference(mode, parsed, pi, unit));
  };

  const parsed = parseNumberInput(raw);
  const tip = parsed && parsed > 0 && suggestPi(parsed) !== pi && pi !== "exact" ? suggestPi(parsed) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="panel space-y-4 p-5" noValidate>
        <fieldset>
          <legend className="label">Hitung berdasarkan</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["radius", "diameter"] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setResult(null); }} className={`choice justify-center ${mode === m ? "choice-selected" : ""}`} aria-pressed={mode === m}>
                {m === "radius" ? "Jari-jari (r)" : "Diameter (d)"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div>
            <label htmlFor="calc-value" className="label">Nilai {mode === "radius" ? "r" : "d"}</label>
            <input
              id="calc-value"
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="contoh: 14 atau 7,5"
              className={`input ${error ? "input-error" : ""}`}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "calc-error" : undefined}
            />
          </div>
          <div>
            <label htmlFor="calc-unit" className="label">Satuan</label>
            <select id="calc-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="input">
              {["mm", "cm", "m", "km"].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p id="calc-error" className="field-error" role="alert">{error}</p>}

        <div>
          <label htmlFor="calc-pi" className="label">Nilai π</label>
          <select id="calc-pi" value={pi} onChange={(e) => setPi(e.target.value as PiChoice)} className="input">
            {PI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {tip && <p className="mt-1.5 text-xs text-gold/90">Tips: {formatNumber(parsed ?? 0, 4)} {tip === "22/7" ? "adalah kelipatan 7, coba" : "bukan kelipatan 7, coba"} π = {piLabel(tip)}.</p>}
        </div>

        <button type="submit" className="btn-primary w-full">
          <Calculator size={18} /> Hitung Keliling
        </button>
      </form>

      <div className="panel-hud p-5" aria-live="polite">
        {!result ? (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center text-soft/60">
            <p className="font-hud text-sm tracking-widest text-ice/70">MENUNGGU DATA</p>
            <p className="mt-2 text-sm">Masukkan ukuran lalu tekan Hitung Keliling.</p>
          </div>
        ) : (
          <div className="animate-pop-in space-y-4">
            <div>
              <p className="eyebrow">Hasil</p>
              <p className="font-hud text-4xl font-black text-gold glow-text">K ≈ {formatNumber(result.circumference)} {unit}</p>
              <p className="mt-1 text-sm text-soft/70">Rumus: <span className="font-bold text-ice">{result.formula}</span></p>
            </div>
            <ol className="space-y-2">
              {result.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neon text-xs font-black">{i + 1}</span>
                  <span><span className="font-bold text-ice">{s.label}:</span> {s.expression}</span>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/5 px-3 py-2">r = {formatNumber(result.radius, 4)} {unit}</div>
              <div className="rounded-xl bg-white/5 px-3 py-2">d = {formatNumber(result.diameter, 4)} {unit}</div>
            </div>
            <p className="text-sm leading-relaxed text-soft/85">{result.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
