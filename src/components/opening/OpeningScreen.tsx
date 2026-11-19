"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info, LogIn, Rocket } from "lucide-react";
import { SolarSystem } from "@/components/cosmic/SolarSystem";
import { LogoMark } from "@/components/cosmic/Logo";
import { Bimo } from "@/components/bimo/Bimo";
import { SoundToggle } from "@/components/sound/SoundToggle";
import { playSfx } from "@/lib/sound";

/** Halaman pembuka: tata surya, logo bercahaya, BIMO menyambut, tombol MULAI PETUALANGAN. */
export function OpeningScreen() {
  const router = useRouter();
  const [warping, setWarping] = useState(false);

  const start = () => {
    if (warping) return;
    setWarping(true);
    playSfx("whoosh");
    window.setTimeout(() => router.push("/kenalan-bimo"), 850);
  };

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-3">
        <SoundToggle />
      </div>

      {/* Tata surya di tengah (efek kamera memasuki galaksi) */}
      <div className={`pointer-events-none absolute inset-0 grid place-items-center ${warping ? "warp-out" : ""}`}>
        <div className="camera-enter w-[min(118vw,96vh,900px)] opacity-90">
          <SolarSystem />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,21,47,0.75)_80%)]" />

      <div className={`relative z-10 flex flex-1 flex-col items-center justify-between px-4 py-8 text-center transition-opacity duration-700 ${warping ? "opacity-0" : ""}`}>
        {/* Logo bercahaya */}
        <div className="mt-12 animate-slide-up sm:mt-0" style={{ animationDelay: "0.9s" }}>
          <div className="mx-auto flex items-center justify-center gap-3">
            <LogoMark size={54} />
            <h1 className="font-hud text-4xl font-black tracking-[0.14em] logo-glow sm:text-6xl">
              ORBIT <span className="text-ice">MATH</span>
            </h1>
          </div>
          <p className="mt-2 font-hud text-xs tracking-[0.35em] text-ice/80 sm:text-sm">GALAXY ADVENTURE · MISSION TO THE CIRCLE GALAXY</p>
        </div>

        <div className="flex-1" />

        {/* BIMO menyambut */}
        <div className="w-full max-w-2xl animate-slide-up" style={{ animationDelay: "1.6s" }}>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-center sm:gap-5">
            <Bimo mood="wave" size={132} float talking />
            <div className="speech-in relative rounded-3xl border border-ice/40 bg-deep/80 px-5 py-4 text-left shadow-[0_0_40px_-10px_rgba(98,229,245,0.7)] backdrop-blur" style={{ animationDelay: "2s" }}>
              <p className="font-hud text-xl font-black text-gold sm:text-2xl">SELAMAT DATANG DI ORBIT MATH!</p>
              <p className="mt-1 text-base font-semibold text-soft/90 sm:text-lg">Siap menjelajahi galaksi matematika bersama Bimo?</p>
            </div>
          </div>

          <button type="button" onClick={start} className="btn-gold btn-glow btn-press mt-7 px-10 py-4 text-lg sm:text-xl animate-pulse-glow">
            <Rocket size={24} /> MULAI PETUALANGAN
          </button>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-ice hover:underline">
              <LogIn size={16} /> Sudah punya akun? Masuk
            </Link>
            <Link href="/tentang" className="inline-flex items-center gap-1.5 font-bold text-soft/60 hover:text-soft">
              <Info size={16} /> Tentang ORBIT MATH
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
