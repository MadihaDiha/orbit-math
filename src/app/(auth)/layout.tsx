import type { ReactNode } from "react";
import { Logo } from "@/components/cosmic/Logo";
import { Bimo } from "@/components/bimo/Bimo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1fr_1.05fr]">
      <aside className="hidden flex-col items-center gap-6 text-center lg:flex">
        <Logo size={44} showTagline />
        <div className="relative grid h-[380px] w-[380px] place-items-center">
          <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-ice/25" />
          <div className="absolute inset-12 rounded-full bg-gradient-to-br from-royal/60 to-nebula/30 blur-[2px]" />
          <div className="absolute inset-0 animate-spin-med">
            <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_16px_#FFD76A]" />
          </div>
          <Bimo mood="wave" size={210} float className="relative" />
        </div>
        <p className="max-w-sm text-soft/70">Gerbang peluncuran ORBIT MATH. Setiap penjelajah wajib memiliki kartu identitas sebelum terbang.</p>
      </aside>
      <main className="w-full animate-page-in">
        <div className="mb-6 flex justify-center lg:hidden">
          <Logo />
        </div>
        {children}
      </main>
    </div>
  );
}
