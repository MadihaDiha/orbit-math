import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getPlaygroundData } from "@/lib/data";
import { PlaygroundView } from "@/components/views/PlaygroundView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Cosmic Playground" };

export default async function PlaygroundPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="playground" />;
  return <PlaygroundView data={await getPlaygroundData()} />;
}
