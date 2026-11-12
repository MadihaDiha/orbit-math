"use client";

import { useDemoState } from "@/lib/demo/store";
import { demoAchievements, demoDashboard, demoExam, demoPlayground, demoProfile, demoProgress, demoTraining } from "@/lib/demo/queries";
import { getMission } from "@/content/missions";
import { LoadingPanel } from "@/components/ui/Spinner";
import { DashboardView } from "@/components/views/DashboardView";
import { GalaxyView } from "@/components/views/GalaxyView";
import { MissionView } from "@/components/views/MissionView";
import { TRAINING_SLUGS, TrainingView } from "@/components/views/TrainingView";
import { PlaygroundView } from "@/components/views/PlaygroundView";
import { ExamView } from "@/components/views/ExamView";
import { ProfileView } from "@/components/views/ProfileView";
import { HistoryView } from "@/components/views/HistoryView";
import { AchievementsView } from "@/components/views/AchievementsView";

export type DemoViewName = "dashboard" | "galaxy" | "mission" | "training" | "playground" | "exam" | "profile" | "history" | "achievements";

/** Merender halaman privat dengan data Mode Demo (localStorage). */
export function DemoPage({ view, slug }: { view: DemoViewName; slug?: string }) {
  const s = useDemoState();
  if (!s || !s.loggedIn || !s.profile) return <LoadingPanel text="Menyiapkan kabin penjelajah..." />;

  switch (view) {
    case "dashboard":
      return <DashboardView data={demoDashboard(s)} />;
    case "galaxy":
      return <GalaxyView progress={demoProgress(s)} />;
    case "mission": {
      const mission = slug ? getMission(slug) : undefined;
      return mission ? <MissionView key={slug} mission={mission} progress={demoProgress(s)} /> : null;
    }
    case "training":
      return <TrainingView data={demoTraining(s, TRAINING_SLUGS)} />;
    case "playground":
      return <PlaygroundView data={demoPlayground(s)} />;
    case "exam":
      return <ExamView data={demoExam(s)} />;
    case "profile":
      return <ProfileView data={demoProfile(s)} />;
    case "history":
      return <HistoryView rows={s.logs} />;
    case "achievements":
      return <AchievementsView data={demoAchievements(s)} />;
  }
}
