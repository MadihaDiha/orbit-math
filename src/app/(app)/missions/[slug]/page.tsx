import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { getLessonProgress } from "@/lib/data";
import { MISSIONS, getMission } from "@/content/missions";
import { MissionView } from "@/components/views/MissionView";
import { DemoPage } from "@/components/demo/DemoPage";

export function generateStaticParams() {
  return MISSIONS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = getMission((await params).slug);
  return { title: m ? `Misi ${m.id}: ${m.title}` : "Misi" };
}

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mission = getMission(slug);
  if (!mission) notFound();
  if (!isSupabaseConfigured()) return <DemoPage view="mission" slug={slug} />;
  return <MissionView mission={mission} progress={await getLessonProgress()} />;
}
