import type { ReactNode } from "react";
import { getSession } from "@/lib/data";
import { AppNav } from "@/components/nav/AppNav";
import { RewardProvider } from "@/components/reward/RewardProvider";

// Halaman privat selalu dirender per permintaan berdasarkan sesi pengguna.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // getSession() mengarahkan ke /login bila belum login (lapisan kedua setelah middleware).
  const { profile, stats } = await getSession();
  return (
    <RewardProvider>
      <AppNav name={profile.full_name} username={profile.username} xp={stats.total_xp} avatar={profile.avatar_color} />
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:pb-16 sm:pt-8">{children}</div>
    </RewardProvider>
  );
}
