import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getExamData } from "@/lib/data";
import { ExamView } from "@/components/views/ExamView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Final Examination" };

export default async function ExamPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="exam" />;
  return <ExamView data={await getExamData()} />;
}
