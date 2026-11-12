import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { safeNext } from "@/lib/routes";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reset?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={safeNext(sp.next)} linkError={sp.error === "link"} />;
}
