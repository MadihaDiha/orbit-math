import type { Metadata } from "next";
import { getLessonProgress, getSession } from "@/lib/data";
import { levelProgress } from "@/lib/levels";
import { formatDate } from "@/lib/format";
import type { AchievementRow } from "@/lib/types";
import { Bimo } from "@/components/bimo/Bimo";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AchievementIcon } from "@/components/reward/AchievementIcon";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { LogoutButton } from "@/components/nav/AppNav";

export const metadata: Metadata = { title: "Profil" };

const CATEGORY_LABEL: Record<string, string> = { lesson: "Materi", training: "Latihan", game: "Permainan", exam: "Evaluasi", daily: "Harian", achievement: "Lencana", other: "Lainnya" };

export default async function ProfilePage() {
  const { supabase, user, profile, stats } = await getSession();
  const progress = await getLessonProgress();
  const [{ count: games }, { data: examRows }, { data: earned }, { data: xpRows }] = await Promise.all([
    supabase.from("game_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("quiz_attempts").select("id, quizzes!inner(kind)").eq("user_id", user.id).eq("quizzes.kind", "exam"),
    supabase.from("user_achievements").select("achievements(slug, title, description, icon, xp_reward, sort_order)").eq("user_id", user.id),
    supabase.from("xp_events").select("amount, category").eq("user_id", user.id),
  ]);

  const lp = levelProgress(stats.total_xp);
  const completed = progress.filter((p) => p.status === "completed").length;
  const badges = (earned ?? []).map((e) => (e as unknown as { achievements: AchievementRow | null }).achievements).filter((a): a is AchievementRow => Boolean(a));
  const byCat: Record<string, number> = {};
  for (const r of (xpRows ?? []) as { amount: number; category: string }[]) byCat[r.category] = (byCat[r.category] ?? 0) + r.amount;
  const maxCat = Math.max(1, ...Object.values(byCat));

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <section className="panel p-6 text-center">
          <Bimo mood="proud" size={130} color={profile.avatar_color} float className="mx-auto block" />
          <h1 className="mt-2 font-hud text-2xl font-black">{profile.full_name}</h1>
          <p className="text-soft/70">@{profile.username} · Kelas {profile.class_name}</p>
          <p className="text-sm text-soft/50">{profile.email}</p>
          <p className="mt-1 text-xs text-soft/50">Bergabung {formatDate(profile.created_at)}</p>
          <div className="mt-5 rounded-2xl bg-white/5 p-4 text-left">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gold">Lv {lp.current.level} · {lp.current.title}</span>
              <span>{stats.total_xp} XP</span>
            </div>
            <ProgressBar value={lp.percent} color="from-gold to-[#ffb84d]" className="mt-2" label="Progres level" />
            <p className="mt-1 text-xs text-soft/55">{lp.next ? `${lp.xpNeeded} XP lagi menuju ${lp.next.title}` : "Level tertinggi tercapai!"}</p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-left">
            {[
              ["Misi selesai", `${completed}/7`],
              ["Permainan", String(games ?? 0)],
              ["Evaluasi", String((examRows ?? []).length)],
              ["Lencana", String(badges.length)],
              ["Bintang", `${stats.stars}/21`],
              ["Streak", `${stats.streak_days} hari`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-navy/50 p-3">
                <dt className="text-xs text-soft/55">{k}</dt>
                <dd className="font-hud text-xl font-black">{v}</dd>
              </div>
            ))}
          </dl>
          <LogoutButton className="btn-danger mt-5 w-full" />
        </section>
      </aside>

      <div className="space-y-6">
        <ProfileForm profile={profile} />

        <section className="panel p-6">
          <h2 className="mb-4 font-hud text-lg font-black">Sumber XP</h2>
          {Object.keys(byCat).length === 0 ? (
            <p className="text-sm text-soft/60">Belum ada XP. Mulai dari Misi 1!</p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <li key={cat} className="grid grid-cols-[90px_1fr_60px] items-center gap-3 text-sm">
                  <span className="font-bold">{CATEGORY_LABEL[cat] ?? cat}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-navy/80"><span className="block h-full rounded-full bg-gradient-to-r from-ice to-neon" style={{ width: `${(amt / maxCat) * 100}%` }} /></span>
                  <span className="text-right font-hud font-bold text-gold">{amt}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel p-6">
          <h2 className="mb-4 font-hud text-lg font-black">Lencana diperoleh</h2>
          {badges.length === 0 ? (
            <p className="text-sm text-soft/60">Belum ada lencana.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {badges.sort((a, b) => a.sort_order - b.sort_order).map((b) => (
                <li key={b.slug} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                  <AchievementIcon icon={b.icon} size={20} />
                  <span><span className="block font-bold">{b.title}</span><span className="text-xs text-soft/65">{b.description}</span></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
