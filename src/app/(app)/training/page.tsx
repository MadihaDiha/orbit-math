import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Rocket, Telescope } from "lucide-react";
import { getSession } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { BimoSays } from "@/components/bimo/BimoSays";

export const metadata: Metadata = { title: "Training Zone" };

const LEVELS = [
  { level: 1, slug: "training-1", name: "Beginner Explorer", icon: Telescope, color: "#62E5F5", topics: ["Mengenal lingkaran", "Mengidentifikasi unsur lingkaran", "Jari-jari dan diameter"] },
  { level: 2, slug: "training-2", name: "Space Navigator", icon: Compass, color: "#318BFF", topics: ["Memahami nilai π", "Menggunakan rumus keliling", "Keliling dari r dan d"] },
  { level: 3, slug: "training-3", name: "Galaxy Expert", icon: Rocket, color: "#FFD76A", topics: ["Soal cerita", "Penerapan sehari-hari", "Soal beberapa langkah"] },
];

export default async function TrainingPage() {
  const { supabase, user } = await getSession();
  const { data } = await supabase.from("quiz_attempts").select("score, quizzes!inner(slug)").eq("user_id", user.id).in("quizzes.slug", LEVELS.map((l) => l.slug));
  const best: Record<string, { best: number; count: number }> = {};
  for (const row of (data ?? []) as unknown as { score: number; quizzes: { slug: string } }[]) {
    const s = row.quizzes.slug;
    best[s] = { best: Math.max(best[s]?.best ?? 0, row.score), count: (best[s]?.count ?? 0) + 1 };
  }

  return (
    <div>
      <PageHeader eyebrow="Training Zone" title="Zona Latihan" description="Bank soal bervariasi: pilihan ganda, benar/salah, isian angka, identifikasi unsur, memasangkan, melengkapi rumus, menghitung, dan soal cerita." />
      <div className="mb-8 max-w-2xl">
        <BimoSays mood="happy" size={80}>Setiap jawaban langsung diperiksa. Kalau salah, BIMO tunjukkan langkah yang benar. Soal diacak setiap kali kamu berlatih!</BimoSays>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {LEVELS.map((l) => {
          const b = best[l.slug];
          return (
            <section key={l.slug} className="panel relative flex flex-col overflow-hidden p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl" style={{ background: l.color }} />
              <l.icon size={36} style={{ color: l.color }} />
              <p className="eyebrow mt-4" style={{ color: l.color }}>Level {l.level}</p>
              <h2 className="font-hud text-2xl font-black">{l.name}</h2>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-soft/80">
                {l.topics.map((t) => <li key={t}>• {t}</li>)}
              </ul>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-soft/60">{b ? `${b.count}× dicoba` : "Belum dicoba"}</span>
                {b && <span className="font-hud font-black text-gold">Terbaik {b.best}</span>}
              </div>
              <Link href={`/training/${l.level}`} className="btn-primary mt-4">Mulai latihan</Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
