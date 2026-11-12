import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getLessonProgress, getSession, missionStates } from "@/lib/data";
import { LEVELS, levelProgress } from "@/lib/levels";
import { MISSIONS } from "@/content/missions";
import { formatDate } from "@/lib/format";
import type { AchievementRow } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { AchievementIcon } from "@/components/reward/AchievementIcon";

export const metadata: Metadata = { title: "Pencapaian" };

export default async function AchievementsPage() {
  const { supabase, user, stats } = await getSession();
  const progress = await getLessonProgress();
  const [{ data: all }, { data: mine }] = await Promise.all([
    supabase.from("achievements").select("slug, title, description, icon, xp_reward, sort_order").order("sort_order"),
    supabase.from("user_achievements").select("achievement_id, earned_at").eq("user_id", user.id),
  ]);
  const earnedAt = new Map(((mine ?? []) as { achievement_id: string; earned_at: string }[]).map((m) => [m.achievement_id, m.earned_at]));
  const lp = levelProgress(stats.total_xp);
  const states = missionStates(progress);
  const starsById = new Map(progress.map((p) => [p.lesson_id, p.stars]));

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Hall of Fame" title="Pencapaian Penjelajah" description="Lencana, level astronaut, bintang, dan koleksi wilayah galaksimu.">
        <span className="chip border-gold/40 bg-gold/10 text-gold">{earnedAt.size}/{(all ?? []).length} lencana</span>
      </PageHeader>

      <section>
        <h2 className="mb-4 font-hud text-xl font-black">Lencana</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {((all ?? []) as AchievementRow[]).map((a) => {
            const at = earnedAt.get(a.slug);
            return (
              <li key={a.slug} className={`panel flex items-center gap-4 p-5 ${at ? "" : "opacity-70"}`}>
                <AchievementIcon icon={a.icon} size={24} earned={Boolean(at)} />
                <div className="min-w-0">
                  <p className={`font-hud font-black ${at ? "text-gold" : "text-soft/70"}`}>{a.title}</p>
                  <p className="text-sm text-soft/70">{a.description}</p>
                  <p className="mt-1 text-xs text-soft/50">{at ? `Diperoleh ${formatDate(at)}` : `Terkunci · +${a.xp_reward} XP`}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-hud text-xl font-black">Tangga Level Astronaut</h2>
        <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LEVELS.map((l) => {
            const reached = stats.total_xp >= l.minXp;
            const current = lp.current.level === l.level;
            return (
              <li key={l.level} className={`rounded-3xl border p-4 text-center ${current ? "border-gold bg-gold/10" : reached ? "border-ice/30 bg-deep/50" : "border-white/5 bg-white/[0.02] opacity-60"}`}>
                <p className="font-hud text-3xl font-black">{l.level}</p>
                <p className={`text-sm font-bold ${current ? "text-gold" : ""}`}>{l.title}</p>
                <p className="text-xs text-soft/55">{l.minXp} XP</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-4 font-hud text-xl font-black">Koleksi Wilayah Galaksi</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {MISSIONS.map((m) => {
            const s = states[m.id];
            const got = s === "completed";
            return (
              <li key={m.id} className="flex flex-col items-center gap-2 rounded-3xl bg-white/5 p-4 text-center">
                <span className="h-14 w-14 rounded-full" style={{ background: got ? `radial-gradient(circle at 30% 30%, #fff, ${m.colors[0]} 30%, ${m.colors[1]})` : "#1a2a4a", boxShadow: got ? `0 0 24px -4px ${m.colors[0]}` : "none" }} />
                <span className={`text-xs font-bold ${got ? "" : "text-soft/40"}`}>{m.planet}</span>
                <span className="flex gap-0.5">
                  {[1, 2, 3].map((n) => <Star key={n} size={12} className={n <= (starsById.get(m.id) ?? 0) ? "fill-gold text-gold" : "text-soft/20"} />)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
