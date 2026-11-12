import Link from "next/link";
import { Award, Flame, FlaskConical, Map, Play, Rocket, Star, Target } from "lucide-react";
import { missionStates } from "@/lib/progress";
import { MISSIONS } from "@/content/missions";
import { levelProgress } from "@/lib/levels";
import { ACTIVITY_LABELS, formatDateTime, greeting } from "@/lib/format";
import type { DashboardData } from "@/lib/view-types";
import { Bimo } from "@/components/bimo/Bimo";
import { GalaxyMap } from "@/components/cosmic/GalaxyMap";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressBar";
import { AchievementIcon } from "@/components/reward/AchievementIcon";
import { DailyChallenge } from "@/components/dashboard/DailyChallenge";

export function DashboardView({ data }: { data: DashboardData }) {
  const { profile, stats, progress, activities, badges, gamesPlayed } = data;
  const states = missionStates(progress);
  const completed = progress.filter((p) => p.status === "completed").length;
  const unlocked = Object.values(states).filter((s) => s !== "locked").length;
  const percent = Math.round((completed / MISSIONS.length) * 100);
  const lp = levelProgress(stats.total_xp);
  const starsMap = Object.fromEntries(progress.map((p) => [p.lesson_id, p.stars]));
  const nextMission = MISSIONS.find((m) => states[m.id] === "in_progress" || states[m.id] === "available");
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
              {completed === 0
                ? "Halo, penjelajah! BIMO siap menemanimu menjelajahi dunia lingkaran hari ini!"
                : completed === 7
                  ? "Semua wilayah sudah kamu jelajahi! Ayo raih nilai sempurna di Final Exam atau tantang dirimu di Playground."
                  : `Kamu sudah menaklukkan ${completed} wilayah. Wilayah berikutnya menunggu!`}
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
          { label: "Progres belajar", value: `${percent}%`, icon: Target, color: "text-ice" },
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

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {/* Peta galaksi */}
          <section className="panel p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-hud text-lg font-black">Perjalanan Galaksimu</h2>
                <ProgressBar value={completed} max={7} className="mt-2 w-48" label="Progres misi" />
              </div>
              <Link href="/galaxy" className="btn-ghost px-4 py-2 text-sm"><Map size={16} /> Jelajahi Galaksi</Link>
            </div>
            <GalaxyMap states={states} stars={starsMap} compact />
          </section>

          {/* Tombol aksi */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nextMission ? (
              <Link href={`/missions/${nextMission.slug}`} className="btn-primary py-3.5"><Play size={18} /> Lanjutkan Belajar</Link>
            ) : (
              <Link href="/exam" className="btn-primary py-3.5"><Play size={18} /> Final Exam</Link>
            )}
            <Link href="/lab" className="btn-ghost py-3.5"><FlaskConical size={18} /> Buka Circle Laboratory</Link>
            <Link href="/training" className="btn-ghost py-3.5"><Target size={18} /> Mulai Tantangan</Link>
            <Link href="/achievements" className="btn-ghost py-3.5"><Award size={18} /> Lihat Pencapaian</Link>
          </section>

          {/* Rekomendasi */}
          {nextMission && (
            <section className="panel-hud flex flex-wrap items-center gap-5 p-5">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-hud text-xl font-black" style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${nextMission.colors[0]} 30%, ${nextMission.colors[1]})` }}>
                {String(nextMission.id).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Rekomendasi misi berikutnya</p>
                <p className="font-hud text-lg font-black">{nextMission.planet}: {nextMission.title}</p>
                <p className="text-sm text-soft/70">{nextMission.tagline}</p>
              </div>
              <Link href={`/missions/${nextMission.slug}`} className="btn-cyan">Mulai misi</Link>
            </section>
          )}
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
