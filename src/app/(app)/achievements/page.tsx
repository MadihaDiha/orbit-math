import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getAchievementsData } from "@/lib/data";
import { AchievementsView } from "@/components/views/AchievementsView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Pencapaian" };

export default async function AchievementsPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="achievements" />;
  return <AchievementsView data={await getAchievementsData()} />;
}
