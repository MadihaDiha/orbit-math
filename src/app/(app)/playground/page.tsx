import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getSession } from "@/lib/data";
import { GAMES } from "@/lib/games";
import { PageHeader } from "@/components/ui/PageHeader";
import { Bimo } from "@/components/bimo/Bimo";

export const metadata: Metadata = { title: "Cosmic Playground" };

export default async function PlaygroundPage() {
  const { supabase, user } = await getSession();
  const { data } = await supabase.from("game_attempts").select("score, cleared, games!inner(slug)").eq("user_id", user.id);
  const stats: Record<string, { best: number; plays: number; cleared: boolean }> = {};
  for (const r of (data ?? []) as unknown as { score: number; cleared: boolean; games: { slug: string } }[]) {
    const s = stats[r.games.slug] ?? { best: 0, plays: 0, cleared: false };
    stats[r.games.slug] = { best: Math.max(s.best, r.score), plays: s.plays + 1, cleared: s.cleared || r.cleared };
  }

  return (
    <div>
      <PageHeader eyebrow="Cosmic Playground" title="Taman Bermain Kosmik" description="Lima permainan dengan mekanisme berbeda. Selesaikan target skor untuk mendapat XP — dan bonus XP harian setiap kali bermain." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => {
          const s = stats[g.slug];
          return (
            <Link key={g.slug} href={`/playground/${g.slug}`} className={`panel group relative flex flex-col overflow-hidden p-6 transition hover:-translate-y-1 ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full opacity-30 blur-2xl transition group-hover:opacity-60" style={{ background: g.color }} />
              <span className="font-hud text-xs font-bold" style={{ color: g.color }}>GAME {String(i + 1).padStart(2, "0")} · {g.mechanic}</span>
              <h2 className="mt-2 font-hud text-2xl font-black">{g.title}</h2>
              <p className="mt-1 flex-1 text-sm text-soft/75">{g.tagline}</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-soft/60">{s ? `${s.plays}× dimainkan` : "Belum dimainkan"}</span>
                {s && <span className={`flex items-center gap-1 font-bold ${s.cleared ? "text-gold" : "text-soft/70"}`}><Trophy size={14} /> {s.best}/{g.maxScore}</span>}
              </div>
              <span className="btn-primary mt-4">Main</span>
            </Link>
          );
        })}
        <div className="panel-hud flex items-center gap-4 p-6">
          <Bimo mood="proud" size={90} />
          <p className="text-sm text-soft/80">Mainkan kelima game untuk membuka lencana <b className="text-gold">Playground Voyager</b>, dan tuntaskan Orbit Calculation untuk <b className="text-gold">Cosmic Calculator</b>!</p>
        </div>
      </div>
    </div>
  );
}
