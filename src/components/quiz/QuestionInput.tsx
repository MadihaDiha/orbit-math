"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { formatNumber, parseNumberInput } from "@/lib/math";
import type { CorrectAnswer, GivenAnswer, MatchOptions, PublicQuestion } from "@/lib/types";
import { Illustration } from "@/components/circle/Illustration";

export const TYPE_LABELS: Record<PublicQuestion["type"], string> = {
  mcq: "Pilihan Ganda",
  true_false: "Benar / Salah",
  numeric: "Isian Angka",
  identify: "Identifikasi Unsur",
  match: "Memasangkan",
  fill_formula: "Melengkapi Rumus",
  story: "Soal Cerita",
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function isMatch(options: PublicQuestion["options"]): options is MatchOptions {
  return !!options && !Array.isArray(options) && "left" in options;
}

export function isAnswered(q: PublicQuestion, a: GivenAnswer | null | undefined): boolean {
  if (!a) return false;
  if ("pairs" in a) return isMatch(q.options) && a.pairs.length === q.options.left.length && a.pairs.every((p) => p >= 0);
  return true;
}

/** Teks jawaban yang mudah dibaca (untuk pembahasan). */
export function describeAnswer(q: PublicQuestion, a: GivenAnswer | CorrectAnswer | null | undefined): string {
  if (!a) return "(tidak dijawab)";
  if ("value" in a) return `${formatNumber(a.value, 4)}${q.unit ? ` ${q.unit}` : ""}`;
  if ("pairs" in a && isMatch(q.options)) {
    const opts = q.options;
    return opts.left.map((l, i) => `${l} → ${a.pairs[i] >= 0 ? opts.right[a.pairs[i]] : "?"}`).join("; ");
  }
  if ("index" in a && Array.isArray(q.options)) return `${LETTERS[a.index] ?? ""}. ${q.options[a.index] ?? ""}`;
  return "-";
}

interface QuestionInputProps {
  question: PublicQuestion;
  value: GivenAnswer | null;
  onChange: (value: GivenAnswer | null) => void;
  disabled?: boolean;
  /** setelah diperiksa: tandai benar/salah */
  correct?: CorrectAnswer | null;
  autoFocus?: boolean;
}

export function QuestionInput({ question, value, onChange, disabled = false, correct = null, autoFocus = false }: QuestionInputProps) {
  const q = question;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{TYPE_LABELS[q.type]}</span>
        <span className="chip border-nebula/30 bg-nebula/10 text-nebula">{q.topic}</span>
      </div>
      <p className="text-lg font-bold leading-relaxed sm:text-xl">{q.prompt}</p>
      {q.illustration && (
        <div className="panel-hud grid-hud p-3">
          <Illustration name={q.illustration} />
        </div>
      )}

      {(q.type === "numeric" || q.type === "story") && Array.isArray(q.options) === false && !isMatch(q.options) ? (
        <NumericInput key={q.id} unit={q.unit} value={value} onChange={onChange} disabled={disabled} correct={correct} autoFocus={autoFocus} />
      ) : isMatch(q.options) ? (
        <MatchInput options={q.options} value={value} onChange={onChange} disabled={disabled} correct={correct} />
      ) : Array.isArray(q.options) ? (
        <div className={`grid gap-2.5 ${q.type === "true_false" ? "grid-cols-2" : ""}`} role="radiogroup">
          {q.options.map((opt, i) => {
            const selected = value && "index" in value && value.index === i;
            const isCorrect = correct && "index" in correct && correct.index === i;
            const state = correct ? (isCorrect ? "choice-correct" : selected ? "choice-wrong" : "opacity-60") : selected ? "choice-selected" : "";
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={Boolean(selected)}
                disabled={disabled}
                onClick={() => onChange({ index: i })}
                className={`choice ${state} ${q.type === "fill_formula" ? "font-hud" : ""}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 font-hud text-sm font-black">
                  {correct && isCorrect ? <Check size={16} /> : correct && selected ? <X size={16} /> : q.type === "true_false" ? (i === 0 ? "B" : "S") : LETTERS[i]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function NumericInput({
  unit,
  value,
  onChange,
  disabled,
  correct,
  autoFocus,
}: {
  unit: string | null;
  value: GivenAnswer | null;
  onChange: (v: GivenAnswer | null) => void;
  disabled: boolean;
  correct: CorrectAnswer | null;
  autoFocus: boolean;
}) {
  const initial = value && "value" in value ? String(value.value).replace(".", ",") : "";
  const [raw, setRaw] = useState(initial);
  const parsed = parseNumberInput(raw);
  const invalid = raw.trim() !== "" && parsed === null;

  return (
    <div>
      <label className="label" htmlFor="numeric-answer">Jawabanmu</label>
      <div className="flex items-center gap-2">
        <input
          id="numeric-answer"
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          disabled={disabled}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            const n = parseNumberInput(e.target.value);
            onChange(n === null ? null : { value: n });
          }}
          placeholder="contoh: 44 atau 62,8"
          className={`input max-w-xs font-hud text-lg ${invalid ? "input-error" : ""}`}
        />
        {unit && <span className="font-bold text-soft/70">{unit}</span>}
      </div>
      {invalid && <p className="field-error">Tulis angka saja, gunakan koma untuk desimal (contoh 7,5).</p>}
      {correct && "value" in correct && (
        <p className="mt-2 text-sm font-bold text-emerald-200">Kunci: {formatNumber(correct.value, 4)} {unit ?? ""}</p>
      )}
    </div>
  );
}

function MatchInput({
  options,
  value,
  onChange,
  disabled,
  correct,
}: {
  options: MatchOptions;
  value: GivenAnswer | null;
  onChange: (v: GivenAnswer | null) => void;
  disabled: boolean;
  correct: CorrectAnswer | null;
}) {
  const pairs = value && "pairs" in value ? value.pairs : options.left.map(() => -1);
  const correctPairs = correct && "pairs" in correct ? correct.pairs : null;

  return (
    <div className="space-y-3">
      {options.left.map((left, i) => {
        const ok = correctPairs ? correctPairs[i] === pairs[i] : null;
        return (
          <div key={i} className={`grid gap-2 rounded-2xl border p-3 sm:grid-cols-[10rem_1fr] sm:items-center ${ok === null ? "border-ice/15 bg-navy/40" : ok ? "border-emerald-300/60 bg-emerald-400/10" : "border-rose-300/60 bg-rose-400/10"}`}>
            <span className="font-hud font-bold text-ice">{left}</span>
            <select
              aria-label={`Pasangan untuk ${left}`}
              disabled={disabled}
              value={pairs[i]}
              onChange={(e) => {
                const next = [...pairs];
                next[i] = Number(e.target.value);
                onChange({ pairs: next });
              }}
              className="input py-2.5 text-sm"
            >
              <option value={-1}>— pilih pengertian —</option>
              {options.right.map((r, j) => (
                <option key={j} value={j}>{r}</option>
              ))}
            </select>
            {correctPairs && !ok && <p className="text-sm text-emerald-200 sm:col-span-2">Seharusnya: {options.right[correctPairs[i]]}</p>}
          </div>
        );
      })}
    </div>
  );
}
