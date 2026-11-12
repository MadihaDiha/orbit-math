/** Pilihan nilai π yang dipakai di kelas VIII. */
export type PiChoice = "3.14" | "22/7" | "exact";

export const PI_OPTIONS: { value: PiChoice; label: string }[] = [
  { value: "3.14", label: "π = 3,14" },
  { value: "22/7", label: "π = 22/7" },
  { value: "exact", label: "π = 3,14159… (lebih teliti)" },
];

export function piValue(choice: PiChoice): number {
  if (choice === "22/7") return 22 / 7;
  if (choice === "3.14") return 3.14;
  return Math.PI;
}

export function piLabel(choice: PiChoice): string {
  if (choice === "22/7") return "22/7";
  if (choice === "3.14") return "3,14";
  return "3,14159…";
}

/** Pembulatan aman (menghindari 0.1+0.2 = 0.30000000000000004). */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

export const diameterFromRadius = (r: number) => 2 * r;
export const radiusFromDiameter = (d: number) => d / 2;
export const circumferenceFromDiameter = (d: number, pi: number) => pi * d;
export const circumferenceFromRadius = (r: number, pi: number) => 2 * pi * r;
export const diameterFromCircumference = (k: number, pi: number) => k / pi;
export const radiusFromCircumference = (k: number, pi: number) => k / (2 * pi);

/** Format angka gaya Indonesia: koma desimal, titik ribuan. */
export function formatNumber(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: maxDecimals }).format(round(value, maxDecimals));
}

/** Membaca input angka siswa: mendukung "12,5", "12.5", dan "2.200.000". */
export function parseNumberInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "");
  if (cleaned === "") return null;
  let normalized = cleaned;
  if (cleaned.includes(",")) {
    // Format Indonesia: titik = ribuan, koma = desimal.
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3}){2,}$/.test(cleaned)) {
    // "2.200.000" = pemisah ribuan
    normalized = cleaned.replace(/\./g, "");
  }
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Saran π: 22/7 bila bilangan kelipatan 7, selain itu 3,14. */
export function suggestPi(n: number): PiChoice {
  return n !== 0 && Number.isInteger(round(n / 7, 6)) ? "22/7" : "3.14";
}

export interface CalcStep {
  label: string;
  expression: string;
}

export interface CircumferenceResult {
  radius: number;
  diameter: number;
  circumference: number;
  formula: string;
  steps: CalcStep[];
  explanation: string;
}

export function calculateCircumference(mode: "radius" | "diameter", value: number, choice: PiChoice, unit = "cm"): CircumferenceResult {
  const pi = piValue(choice);
  const pl = piLabel(choice);
  const radius = mode === "radius" ? value : radiusFromDiameter(value);
  const diameter = mode === "radius" ? diameterFromRadius(value) : value;
  const circumference = mode === "radius" ? circumferenceFromRadius(value, pi) : circumferenceFromDiameter(value, pi);
  const v = formatNumber(value, 4);
  const k = formatNumber(circumference);

  const steps: CalcStep[] =
    mode === "radius"
      ? [
          { label: "Diketahui", expression: `r = ${v} ${unit}, π = ${pl}` },
          { label: "Rumus", expression: "K = 2 × π × r" },
          { label: "Substitusi", expression: `K = 2 × ${pl} × ${v}` },
          { label: "Sederhanakan", expression: `K = ${pl} × ${formatNumber(2 * value, 4)}` },
          { label: "Hasil", expression: `K = ${k} ${unit}` },
        ]
      : [
          { label: "Diketahui", expression: `d = ${v} ${unit}, π = ${pl}` },
          { label: "Rumus", expression: "K = π × d" },
          { label: "Substitusi", expression: `K = ${pl} × ${v}` },
          { label: "Hasil", expression: `K = ${k} ${unit}` },
        ];

  return {
    radius,
    diameter,
    circumference,
    formula: mode === "radius" ? "K = 2 × π × r" : "K = π × d",
    steps,
    explanation: `Panjang garis yang mengelilingi lingkaran ini ≈ ${k} ${unit}. Artinya, roda berdiameter ${formatNumber(diameter, 4)} ${unit} akan menempuh ${k} ${unit} dalam satu putaran penuh.`,
  };
}

/** Membandingkan jawaban angka dengan toleransi (sama seperti di server). */
export function isClose(given: number, expected: number, tolerance = 0.05): boolean {
  return Math.abs(given - expected) <= tolerance;
}
