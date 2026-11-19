import Link from "next/link";
import { Award, Flame, FlaskConical, Map, Play, Rocket, Star, Target } from "lucide-react";
import { journeyPercent, missionStates, nextStep } from "@/lib/progress";
import { MISSIONS } from "@/content/missions";
import { levelProgress } from "@/lib/levels";
import { ACTIVITY_LABELS, formatDateTime, greeting } from "@/lib/format";
import type { DashboardData } from "@/lib/view-types";
import { Bimo } from "@/components/bimo/Bimo";
import { JourneyMap } from "@/components/cosmic/JourneyMap";
import { PlanetArt } from "@/components/cosmic/PlanetArt";
import { LaunchPadArt, PortalArt } from "@/components/cosmic/PlanetDialog";
import { PLANETS } from "@/content/planets";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { AchievementIcon } from "@/components/reward/AchievementIcon";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";

export function DashboardView({ data }: { data: DashboardData }) {
  const { profile, stats, progress, activities, badges, gamesPlayed, journey } = data;
  const states = missionStates(progress, journey);
  const completed = progress.filter((p) => p.status === "completed").length;
  const unlocked = Object.values(states).filter((s) => s !== "locked").length;
  const percent = journeyPercent(progress, journey);
  const lp = levelProgress(stats.total_xp);
  const step = nextStep(progress, journey);
  const nextMission = step.missionId ? MISSIONS[step.missionId - 1] : undefined;
  const next = {
    pretest: { href: "/pretest", eyebrow: "Langkah berikutnya", title: "Landasan Peluncuran: Pre-test", text: "Sebelum kita berangkat, yuk uji pengetahuanmu dulu! Planet pertama terbuka setelah pre-test.", cta: "Mulai Pre-test" },
    mission: nextMission
      ? { href: `/missions/${nextMission.slug}`, eyebrow: "Misi berikutnya", title: PLANETS[nextMission.id - 1].name, text: `${nextMission.title} — ${nextMission.tagline}`, cta: states[nextMission.id] === "in_progress" ? "Lanjutkan misi" : "Masuki planet" }
      : null,
    posttest: { href: "/posttest", eyebrow: "Misi terakhir", title: "Portal Pulang: Post-test", text: "Semua planet sudah ditaklukkan! Kerjakan post-test dan lihat perkembanganmu.", cta: "Mulai Post-test" },
    results: { href: "/results", eyebrow: "Petualangan selesai", title: "Hasil Akhir Astronot Muda", text: "Lihat perbandingan pre-test dan post-test, bintang, dan lencanamu.", cta: "Lihat Hasil Akhir" },
  }[step.step];
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Sapaan + level */}
      <section className="panel relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <Bimo mood={completed === 7 ? "proud" : "wave"} size={120} color={profile.avatar_color} float />
          <div>
            <p className="eyebrow">Space Control Center</p>
            <h1 className="mt-1 font-hud text-2xl font-black sm:text-3xl">{greeting()}, {firstName}!</h1>
            <p className="mt-1 text-soft/70">@{profile.username} · Kelas {profile.class_name}</p>
            <p className="mt-3 max-w-xl rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-semibold">
              <span className="text-ice">BIMO: </span>
              {step.step === "pretest"
                ? "Halo, Astronot Muda! Sebelum berangkat, kerjakan Pre-test dulu, ya!"
                : step.step === "results"
                  ? "Petualanganmu selesai! Lihat hasil akhirmu atau tantang dirimu di Playground."
                  : step.step === "posttest"
                    ? "Semua planet sudah kamu taklukkan! Tinggal satu misi lagi: Post-test."
                    : completed === 0
                      ? "Pre-test beres! Yuk berangkat ke Planet Pengenalan Lingkaran!"
                      : `Yeay! ${completed} wilayah sudah kamu taklukkan. Planet berikutnya menunggu!`}
            </p>
          </div>
          <div className="flex items-center gap-4 md:flex-col">
            <ProgressRing value={lp.percent} size={120} color="#FFD76A">
              <span>
                <span className="block text-[10px] font-bold text-soft/60">LEVEL</span>
                <span className="block font-hud text-3xl font-black">{lp.current.level}</span>
              </span>
            </ProgressRing>
            <div className="text-center">
              <p className="font-hud text-sm font-bold text-gold">{lp.current.title}</p>
              <p className="text-xs text-soft/60">{lp.next ? `${lp.xpNeeded} XP lagi ke Lv ${lp.next.level}` : "Level maksimal!"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Statistik">
        {[
          { label: "Total XP", value: stats.total_xp, icon: Rocket, color: "text-gold" },
          { label: "Perjalanan galaksi", value: `${percent}%`, icon: Target, color: "text-ice" },
          { label: "Misi selesai", value: `${completed}/7`, icon: Award, color: "text-neon" },
          { label: "Planet terbuka", value: `${unlocked}/7`, icon: Map, color: "text-nebula" },
          { label: "Streak harian", value: `${stats.streak_days} hari`, icon: Flame, color: "text-rose-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-ice/10 bg-deep/45 p-4">
            <s.icon className={s.color} size={20} />
            <p className="mt-2 font-hud text-2xl font-black">{s.value}</p>
            <p className="text-xs text-soft/60">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Galaxy Journey */}
      <section className="panel-hud p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-hud text-lg font-black">Galaxy Journey</h2>
            <ProgressBar value={percent} color="from-nebula via-neon to-gold" className="mt-2 w-56" label="Progres perjalanan galaksi" />
          </div>
          <Link href="/galaxy" className="btn-ghost px-4 py-2 text-sm"><Map size={16} /> Peta lengkap</Link>
        </div>
        <JourneyMap progress={progress} journey={journey} compact />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Langkah berikutnya */}
          {next && (
            <section className="panel card-float relative flex flex-wrap items-center gap-5 overflow-hidden p-5 sm:p-6">
              <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
              <span className="w-24 shrink-0">
                {step.step === "pretest" ? (
                  <LaunchPadArt size="100%" />
                ) : step.step === "mission" && nextMission ? (
                  <PlanetArt variant={PLANETS[nextMission.id - 1].variant} size="100%" />
                ) : (
                  <PortalArt size="100%" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">{next.eyebrow}</p>
                <p className="font-hud text-xl font-black">{next.title}</p>
                <p className="text-sm text-soft/70">{next.text}</p>
              </div>
              <Link href={next.href} className="btn-gold btn-glow btn-press px-6 py-3"><Play size={18} /> {next.cta}</Link>
            </section>
          )}

          {/* Tombol aksi */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/galaxy" className="btn-primary py-3.5"><Map size={18} /> Jelajahi Galaksi</Link>
            <Link href="/lab" className="btn-ghost py-3.5"><FlaskConical size={18} /> Circle Laboratory</Link>
            <Link href="/training" className="btn-ghost py-3.5"><Target size={18} /> Mulai Tantangan</Link>
            <Link href="/achievements" className="btn-ghost py-3.5"><Award size={18} /> Lihat Pencapaian</Link>
          </section>
        </div>

        <div className="space-y-6">
          <DailyChallenge />

          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-hud text-lg font-black">Lencana</h2>
              <span className="text-sm text-soft/60">{badges.length} diperoleh</span>
            </div>
            {badges.length === 0 ? (
              <p className="text-sm text-soft/65">Belum ada lencana. Selesaikan Misi 1 untuk membuka <b className="text-gold">First Discovery</b>!</p>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {badges.slice(0, 8).map((b) => (
                  <li key={b.slug} title={`${b.title} — ${b.description}`} className="flex flex-col items-center gap-1">
                    <AchievementIcon icon={b.icon} size={20} />
                    <span className="max-w-[72px] truncate text-[10px] font-bold">{b.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-hud text-lg font-black">Aktivitas terakhir</h2>
              <Link href="/history" className="text-sm font-bold text-ice hover:underline">Semua</Link>
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-soft/65">Belum ada aktivitas.</p>
            ) : (
              <ul className="space-y-2">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 rounded-2xl bg-white/5 px-3 py-2.5 text-sm">
                    <Star size={14} className="mt-1 shrink-0 text-ice" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{a.title}</p>
                      <p className="text-xs text-soft/55">{ACTIVITY_LABELS[a.activity_type]} · {a.status}{a.score !== null ? ` · nilai ${a.score}` : ""} · {formatDateTime(a.created_at)}</p>
                    </div>
                    {a.xp_earned > 0 && <span className="shrink-0 text-xs font-bold text-gold">+{a.xp_earned}</span>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-soft/50">{gamesPlayed} permainan dimainkan</p>
          </section>
        </div>
      </div>
    </div>
  );
}
