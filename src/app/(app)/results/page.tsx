import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getResultsData } from "@/lib/data";
import { ResultsView } from "@/components/views/ResultsView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Hasil Akhir" };

export default async function ResultsPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="results" />;
  return <ResultsView data={await getResultsData()} />;
}
