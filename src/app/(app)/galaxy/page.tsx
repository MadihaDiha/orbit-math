import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Star } from "lucide-react";
import { getLessonProgress, missionStates } from "@/lib/data";
import { MISSIONS } from "@/content/missions";
import { GalaxyMap } from "@/components/cosmic/GalaxyMap";
import { PageHeader } from "@/components/ui/PageHeader";
import { BimoSays } from "@/components/bimo/BimoSays";

export const metadata: Metadata = { title: "Galaxy Map" };

export default async function GalaxyPage() {
  const progress = await getLessonProgress();
  const states = missionStates(progress);
  const byId = new Map(progress.map((p) => [p.lesson_id, p]));
  const stars = Object.fromEntries(progress.map((p) => [p.lesson_id, p.stars]));
  const totalStars = progress.reduce((s, p) => s + p.stars, 0);

  return (
    <div>
      <PageHeader eyebrow="Galaxy Map" title="Peta Galaksi Lingkaran" description="Setiap planet adalah satu misi. Selesaikan misi untuk membuka wilayah berikutnya. Planet yang sudah terbuka bisa diulang kapan saja.">
        <span className="chip border-gold/40 bg-gold/10 text-gold"><Star size={14} className="fill-gold" /> {totalStars}/21 bintang</span>
      </PageHeader>

      <section className="panel-hud grid-hud mb-8 p-4 sm:p-8">
        <GalaxyMap states={states} stars={stars} />
      </section>

      <div className="mb-6 max-w-2xl">
        <BimoSays mood="happy" size={80}>Bintang diberikan dari nilai mini quiz: 1 bintang (lulus), 2 bintang (≥80), 3 bintang (100). Ulangi misi untuk menambah bintang!</BimoSays>
      </div>

      <ol className="grid gap-4 md:grid-cols-2">
        {MISSIONS.map((m) => {
          const s = states[m.id];
          const p = byId.get(m.id);
          const locked = s === "locked";
          return (
            <li key={m.id} className={`panel flex gap-4 p-5 ${locked ? "opacity-60" : ""}`}>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-hud font-black" style={{ background: locked ? "#1a2a4a" : `radial-gradient(circle at 30% 30%, #fff, ${m.colors[0]} 30%, ${m.colors[1]})` }}>
                {locked ? <Lock size={18} /> : String(m.id).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-hud text-[11px] font-bold text-ice">{m.code} — {m.planet.toUpperCase()}</p>
                <p className="font-bold">{m.title}</p>
                <p className="text-sm text-soft/65">{m.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {locked ? (
                    <span className="text-xs font-bold text-soft/50">Selesaikan Misi {m.id - 1} untuk membuka</span>
                  ) : (
                    <Link href={`/missions/${m.slug}`} className={s === "completed" ? "btn-ghost px-4 py-2 text-sm" : "btn-primary px-4 py-2 text-sm"}>
                      {s === "completed" ? "Ulangi materi" : s === "in_progress" ? "Lanjutkan" : "Mulai misi"}
                    </Link>
                  )}
                  {p && p.best_quiz_score > 0 && <span className="text-xs text-soft/60">Nilai terbaik {p.best_quiz_score}</span>}
                  {s === "completed" && (
                    <span className="flex gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <Star key={n} size={14} className={n <= (p?.stars ?? 0) ? "fill-gold text-gold" : "text-soft/25"} />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
