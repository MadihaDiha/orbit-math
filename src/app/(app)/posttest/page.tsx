import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getJourneyData } from "@/lib/data";
import { PosttestView } from "@/components/views/TestViews";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Post-test" };

export default async function PosttestPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="posttest" />;
  return <PosttestView data={await getJourneyData()} />;
}
