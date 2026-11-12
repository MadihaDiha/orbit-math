import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getHistoryData } from "@/lib/data";
import { HistoryView } from "@/components/views/HistoryView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Riwayat Belajar" };

export default async function HistoryPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="history" />;
  return <HistoryView rows={await getHistoryData()} />;
}
