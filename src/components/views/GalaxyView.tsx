import Link from "next/link";
import { Star, Trophy } from "lucide-react";
import { journeyPercent, missionStates } from "@/lib/progress";
import type { JourneyData } from "@/lib/view-types";
import { JourneyMap } from "@/components/cosmic/JourneyMap";
import { PlanetSystem } from "@/components/cosmic/PlanetSystem";
import { PlanetArt } from "@/components/cosmic/PlanetArt";
import { PortalArt } from "@/components/cosmic/PlanetDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BimoSays } from "@/components/bimo/BimoSays";

export function GalaxyView({ data }: { data: JourneyData }) {
  const { progress, journey } = data;
  const states = missionStates(progress, journey);
  const totalStars = progress.reduce((s, p) => s + p.stars, 0);
  const percent = journeyPercent(progress, journey);

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Galaxy Journey" title="Peta Perjalanan Galaksi" description="Dari landasan peluncuran, lewati enam planet dan Stasiun Final, lalu pulang lewat Portal Post-test. Ketuk planet untuk melihat misinya.">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip border-gold/40 bg-gold/10 text-gold"><Star size={14} className="fill-gold" /> {totalStars}/21 bintang</span>
          <span className="chip">{percent}% perjalanan</span>
        </div>
      </PageHeader>

      <section className="panel-hud relative overflow-hidden p-4 sm:p-8">
        <ProgressBar value={percent} color="from-nebula via-neon to-gold" className="mb-6" label="Progres perjalanan galaksi" />
        <JourneyMap progress={progress} journey={journey} />
      </section>

      {!journey.pretest && (
        <div className="max-w-2xl">
          <BimoSays mood="wave" size={84}>
            Sebelum kita berangkat, yuk uji pengetahuanmu dulu! Ketuk <b className="text-gold">Landasan Peluncuran</b> untuk mengerjakan Pre-test.
          </BimoSays>
        </div>
      )}

      <section>
        <p className="eyebrow">Enam wilayah galaksi</p>
        <h2 className="mb-6 font-hud text-2xl font-black sm:text-3xl">Tata Surya Lingkaran</h2>
        <PlanetSystem progress={progress} journey={journey} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/missions/final-cosmic-mission" className={`panel card-float flex items-center gap-4 p-5 ${states[7] === "locked" ? "pointer-events-none opacity-60" : ""}`}>
          <span className="w-24 shrink-0"><PlanetArt variant="station" size="100%" dim={states[7] === "locked"} /></span>
          <span>
            <span className="eyebrow">Mission 07</span>
            <span className="block font-hud text-lg font-black">Stasiun Final</span>
            <span className="text-sm text-soft/70">{states[7] === "completed" ? "Selesai ✓ — pengulangan materi" : states[7] === "locked" ? "Terbuka setelah 6 planet ditaklukkan" : "Ulangi semua materi sebelum Post-test"}</span>
          </span>
        </Link>
        <Link href={journey.posttest ? "/results" : "/posttest"} className={`panel card-float flex items-center gap-4 p-5 ${states[7] !== "completed" ? "pointer-events-none opacity-60" : ""}`}>
          <span className="w-24 shrink-0"><PortalArt size="100%" dim={states[7] !== "completed"} /></span>
          <span>
            <span className="eyebrow">Post-test</span>
            <span className="block font-hud text-lg font-black">Portal Pulang</span>
            <span className="text-sm text-soft/70">
              {journey.posttest ? <><Trophy className="mr-1 inline" size={14} />Nilai {journey.posttest.score} — lihat hasil akhir</> : states[7] === "completed" ? "Siap! Kerjakan Post-test" : "Terbuka setelah Stasiun Final"}
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
