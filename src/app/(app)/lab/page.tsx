import type { Metadata } from "next";
import { Calculator, CircleDot, RotateCw, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CircleAnatomy } from "@/components/circle/CircleAnatomy";
import { RadiusLab } from "@/components/circle/RadiusLab";
import { RotationSimulator } from "@/components/circle/RotationSimulator";
import { CircumferenceCalc } from "@/components/circle/CircumferenceCalc";
import { BimoSays } from "@/components/bimo/BimoSays";

export const metadata: Metadata = { title: "Circle Laboratory" };

const STATIONS = [
  { id: "anatomy", code: "A", title: "Circle Anatomy", icon: CircleDot, desc: "Kenali tujuh unsur lingkaran.", node: <CircleAnatomy /> },
  { id: "radius", code: "B", title: "Radius Adjustment Lab", icon: SlidersHorizontal, desc: "Geser jari-jari, amati diameter & keliling berubah.", node: <RadiusLab /> },
  { id: "rotation", code: "C", title: "Circle Rotation Simulator", icon: RotateCw, desc: "Jarak satu putaran roda tanpa tergelincir = keliling roda.", node: <RotationSimulator /> },
  { id: "calculator", code: "D", title: "Circumference Calculator", icon: Calculator, desc: "Hitung keliling lengkap dengan langkah penyelesaian.", node: <CircumferenceCalc /> },
];

export default function LabPage() {
  return (
    <div>
      <PageHeader eyebrow="Circle Laboratory" title="Laboratorium Lingkaran" description="Empat stasiun eksperimen untuk mengeksplorasi bentuk dan perhitungan lingkaran." />
      <nav className="mb-8 flex gap-2 overflow-x-auto pb-1" aria-label="Stasiun laboratorium">
        {STATIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="chip shrink-0 py-2 text-sm hover:bg-ice/20">
            <s.icon size={14} /> {s.code}. {s.title}
          </a>
        ))}
      </nav>
      <div className="mb-8 max-w-2xl">
        <BimoSays mood="happy" size={80}>Selamat datang di lab! Semua angka di sini dihitung langsung — coba ubah-ubah nilainya dan lihat apa yang terjadi.</BimoSays>
      </div>
      <div className="space-y-8">
        {STATIONS.map((s) => (
          <section key={s.id} id={s.id} className="panel scroll-mt-28 p-5 sm:p-7" aria-labelledby={`${s.id}-title`}>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-neon/20 font-hud font-black text-ice">{s.code}</span>
              <div>
                <h2 id={`${s.id}-title`} className="font-hud text-xl font-black">{s.title}</h2>
                <p className="text-sm text-soft/65">{s.desc}</p>
              </div>
            </div>
            {s.node}
          </section>
        ))}
      </div>
    </div>
  );
}
