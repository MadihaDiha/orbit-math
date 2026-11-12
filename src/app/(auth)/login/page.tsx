import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { safeNext } from "@/lib/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { DemoAuthPanel } from "@/components/demo/DemoAuthPanel";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  if (!isSupabaseConfigured()) return <DemoAuthPanel mode="login" next={safeNext(sp.next)} />;
  return <LoginForm next={safeNext(sp.next)} linkError={sp.error === "link"} />;
}
