import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import { isSupabaseConfigured } from "@/lib/env";
import { DemoAuthPanel } from "@/components/demo/DemoAuthPanel";

export const metadata: Metadata = { title: "Buat Akun" };

export default function RegisterPage() {
  if (!isSupabaseConfigured()) return <DemoAuthPanel mode="register" />;
  return <RegisterForm />;
}
