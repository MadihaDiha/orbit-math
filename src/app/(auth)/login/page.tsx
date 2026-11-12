import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginGate } from "./LoginGate";
import { LoadingPanel } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPanel text="Membuka gerbang..." />}>
      <LoginGate />
    </Suspense>
  );
}
