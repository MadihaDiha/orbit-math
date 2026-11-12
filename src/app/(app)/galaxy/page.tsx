import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getLessonProgress } from "@/lib/data";
import { GalaxyView } from "@/components/views/GalaxyView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Galaxy Map" };

export default async function GalaxyPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="galaxy" />;
  return <GalaxyView progress={await getLessonProgress()} />;
}
