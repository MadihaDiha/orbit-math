import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getTrainingData } from "@/lib/data";
import { TRAINING_SLUGS, TrainingView } from "@/components/views/TrainingView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Training Zone" };

export default async function TrainingPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="training" />;
  return <TrainingView data={await getTrainingData(TRAINING_SLUGS)} />;
}
