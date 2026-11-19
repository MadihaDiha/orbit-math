import type { ReactNode } from "react";
import Link from "next/link";
import { Award, Map, Rocket, Sparkles, Star, TrendingUp } from "lucide-react";
import type { ResultsData } from "@/lib/view-types";
import { levelProgress } from "@/lib/levels";
import { journeyPercent } from "@/lib/progress";
import { Bimo } from "@/components/bimo/Bimo";
import { AchievementIcon } from "@/components/reward/AchievementIcon";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { NotFinishedNotice, PlanetsConquered } from "./TestViews";
import { ResultsCelebration } from "./ResultsCelebration";

/** Halaman akhir: "SELAMAT, ASTRONOT MUDA!" — perbandingan pre-test & post-test, bintang, XP, planet, lencana. */
export function ResultsView({ data }: { data: ResultsData }) {
  const { journey, stats, progress, badges, profile } = data;
  const pre = journey.pretest;
  const post = journey.posttestBest ?? journey.posttest;
  const finished = Boolean(journey.posttest);
  const diff = pre && post ? post.score - pre.score : null;
  const completed = progress.filter((p) => p.status === "completed").length;
  const lp = levelProgress(stats.total_xp);

  return (
    <div className="space-y-8">
      {finished && <ResultsCelebration />}
      <section className="panel relative overflow-hidden p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,106,0.25),transparent_60%)]" />
        <Bimo mood={finished ? "proud" : "happy"} action={finished ? "cheer" : "wave"} talking size={170} float className="mx-auto block" color={profile.avatar_color} />
        <h1 className="mt-3 font-hud text-3xl font-black text-gold logo-glow sm:text-5xl">{finished ? "SELAMAT, ASTRONOT MUDA!" : "LAPORAN PERJALANAN"}</h1>
        <p className="mt-1 text-soft/70">{profile.full_name} · Kelas {profile.class_name}</p>
        {finished && (
          <div className="mx-auto mt-5 max-w-2xl space-y-3">
            <p className="speech-in rounded-3xl border border-ice/35 bg-deep/80 px-5 py-3 text-lg font-bold">Kamu berhasil menyelesaikan petualangan di Galaksi Lingkaran!</p>
            <p className="speech-in rounded-3xl border border-ice/35 bg-deep/80 px-5 py-3 text-lg font-bold" style={{ animationDelay: "0.6s" }}>
              Terima kasih sudah belajar bersama Bimo. Sampai bertemu di petualangan berikutnya!
            </p>
          </div>
        )}
      </section>

      {!finished && <NotFinishedNotice />}

      {/* Perbandingan pre-test vs post-test */}
      <section className="panel p-6 sm:p-8">
        <h2 className="mb-5 flex items-center gap-2 font-hud text-xl font-black"><TrendingUp className="text-ice" /> Perkembangan Belajar</h2>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <Bar label="Pre-test (sebelum materi)" score={pre?.score ?? null} color="from-nebula to-royal" />
            <Bar label="Post-test (setelah petualangan)" score={post?.score ?? null} color="from-ice to-gold" />
          </div>
          <div className="text-center">
            {diff !== null ? (
              <>
                <p className={`font-hud text-5xl font-black ${diff > 0 ? "text-emerald-300" : diff === 0 ? "text-ice" : "text-gold"}`}>{diff > 0 ? `+${diff}` : diff}</p>
                <p className="text-sm text-soft/70">{diff > 0 ? "poin peningkatan" : diff === 0 ? "nilai tetap" : "poin — ayo ulangi!"}</p>
              </>
            ) : (
              <p className="max-w-[12rem] text-sm text-soft/60">Perbandingan muncul setelah pre-test & post-test selesai.</p>
            )}
          </div>
        </div>
      </section>

      {/* Bintang, XP, perjalanan */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Star className="fill-gold text-gold" />} label="Bintang terkumpul" value={`${stats.stars} / 21`} />
        <Stat icon={<Sparkles className="text-ice" />} label={`XP · Lv ${lp.current.level} ${lp.current.title}`} value={`${stats.total_xp} XP`} />
        <div className="panel flex items-center gap-4 p-5">
          <ProgressRing value={journeyPercent(progress, journey)} size={84} stroke={8} color="#FFD76A">
            <span className="font-hud text-lg font-black">{journeyPercent(progress, journey)}%</span>
          </ProgressRing>
          <div>
            <p className="font-bold">Perjalanan galaksi</p>
            <p className="text-sm text-soft/60">{completed}/7 wilayah ditaklukkan</p>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="mb-5 font-hud text-xl font-black">Planet yang Ditaklukkan</h2>
        <PlanetsConquered progress={progress} />
      </section>

      <section className="panel p-6">
        <h2 className="mb-4 flex items-center gap-2 font-hud text-xl font-black"><Award className="text-gold" /> Lencana ({badges.length})</h2>
        {badges.length === 0 ? (
          <p className="text-sm text-soft/60">Belum ada lencana.</p>
        ) : (
          <ul className="flex flex-wrap gap-4">
            {badges.map((b) => (
              <li key={b.slug} className="flex w-24 flex-col items-center gap-1 text-center" title={b.description}>
                <AchievementIcon icon={b.icon} size={22} />
                <span className="text-[11px] font-bold leading-tight">{b.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/galaxy" className="btn-primary"><Map size={18} /> Peta Galaksi</Link>
        <Link href="/playground" className="btn-ghost"><Rocket size={18} /> Main game lagi</Link>
        <Link href="/achievements" className="btn-ghost"><Award size={18} /> Semua lencana</Link>
      </div>
    </div>
  );
}

function Bar({ label, score, color }: { label: string; score: number | null; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="font-hud text-lg">{score ?? "—"}</span>
      </div>
      <ProgressBar value={score ?? 0} color={color} label={label} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5">{icon}</span>
      <div>
        <p className="font-hud text-2xl font-black">{value}</p>
        <p className="text-sm text-soft/60">{label}</p>
      </div>
    </div>
  );
}
