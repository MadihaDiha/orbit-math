"use client";

import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/routes";
import { DemoAuthPanel } from "@/components/demo/DemoAuthPanel";
import { LoginForm } from "./LoginForm";

/** Membaca ?next= & ?error= di browser agar halaman login juga bisa diekspor statis. */
export function LoginGate() {
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  if (!isSupabaseConfigured()) return <DemoAuthPanel mode="login" next={next} />;
  return <LoginForm next={next} linkError={sp.get("error") === "link"} />;
}
