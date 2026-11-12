import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";
import { getDashboardData } from "@/lib/data";
import { DashboardView } from "@/components/views/DashboardView";
import { DemoPage } from "@/components/demo/DemoPage";

export const metadata: Metadata = { title: "Space Control Center" };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <DemoPage view="dashboard" />;
  return <DashboardView data={await getDashboardData()} />;
}
