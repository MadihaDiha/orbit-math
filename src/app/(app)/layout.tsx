import type { ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSession } from "@/lib/data";
import { AppNav } from "@/components/nav/AppNav";
import { RewardProvider } from "@/components/reward/RewardProvider";
import { DemoShell } from "@/components/demo/DemoShell";

// Halaman privat selalu dirender per permintaan berdasarkan sesi pengguna.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <RewardProvider>
        <DemoShell>{children}</DemoShell>
      </RewardProvider>
    );
  }
  // getSession() mengarahkan ke /login bila belum login (lapisan kedua setelah middleware).
  const { profile, stats } = await getSession();
  return (
    <RewardProvider>
      <AppNav name={profile.full_name} username={profile.username} xp={stats.total_xp} avatar={profile.avatar_color} />
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:pb-16 sm:pt-8">{children}</div>
    </RewardProvider>
  );
}
