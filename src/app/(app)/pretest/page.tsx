import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getJourneyData } from "@/lib/data";
import { PretestView } from "@/components/views/TestViews";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Pre-test" };

export default async function PretestPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="pretest" />;
  return <PretestView data={await getJourneyData()} />;
}
