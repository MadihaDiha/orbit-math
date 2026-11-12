import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TrainingRunner } from "@/components/quiz/TrainingRunner";

const NAMES: Record<string, string> = { "1": "Beginner Explorer", "2": "Space Navigator", "3": "Galaxy Expert" };

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  return { title: `Training Level ${level}` };
}

export default async function TrainingLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  if (!NAMES[level]) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/training" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-soft/60 hover:text-ice"><ArrowLeft size={16} /> Training Zone</Link>
      <p className="eyebrow">Level {level}</p>
      <h1 className="mb-6 font-hud text-3xl font-black">{NAMES[level]}</h1>
      <TrainingRunner slug={`training-${level}`} />
    </div>
  );
}
