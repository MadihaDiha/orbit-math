"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Rocket } from "lucide-react";
import { Bimo, type BimoAction, type BimoMood } from "@/components/bimo/Bimo";
import { SoundToggle } from "@/components/sound/SoundToggle";
import { PlanetArt } from "@/components/cosmic/PlanetArt";
import { BIMO_INTRO } from "@/lib/bimo-lines";
import { playSfx } from "@/lib/sound";

const POSES: { mood: BimoMood; action: BimoAction }[] = [
  { mood: "wave", action: "wave" },
  { mood: "happy", action: "nod" },
  { mood: "proud", action: "cheer" },
  { mood: "happy", action: "nod" },
];

/** Perkenalan BIMO: dialog bertahap dengan efek mengetik, BIMO berbicara & bergerak. */
export function BimoIntro() {
  const router = useRouter();
  const [line, setLine] = useState(0);
  const [shown, setShown] = useState(0);
  const text = BIMO_INTRO[line];
  const typing = shown < text.length;
  const last = line === BIMO_INTRO.length - 1;

  useEffect(() => {
    if (!typing) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), 28);
    return () => window.clearTimeout(t);
  }, [shown, typing]);

  const next = () => {
    playSfx("click");
    if (typing) {
      setShown(text.length);
      return;
    }
    if (!last) {
      setLine(line + 1);
      setShown(0);
    }
  };

  const go = () => {
    playSfx("whoosh");
    router.push("/login?next=/pretest");
  };

  const pose = POSES[line];

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="absolute right-4 top-4">
        <SoundToggle />
      </div>
      <div className="pointer-events-none absolute left-[4%] top-[12%] hidden opacity-80 md:block">
        <PlanetArt variant="ringed" size={110} />
      </div>
      <div className="pointer-events-none absolute bottom-[10%] right-[6%] hidden opacity-80 md:block">
        <PlanetArt variant="aqua" size={90} />
      </div>

      <p className="eyebrow animate-slide-up">Perkenalan Pemandu</p>

      <div className="grid w-full items-center gap-6 md:grid-cols-[auto_1fr]">
        <div className="relative mx-auto">
          <div className="absolute inset-x-6 bottom-2 h-6 rounded-full bg-ice/30 blur-xl" />
          <Bimo mood={pose.mood} action={pose.action} talking={typing} size={250} float />
        </div>

        <div>
          <div
            key={line}
            className="speech-in relative min-h-[150px] rounded-[2rem] border-2 border-ice/50 bg-gradient-to-br from-royal/60 to-deep/90 p-6 text-xl font-bold leading-relaxed shadow-[0_0_50px_-12px_rgba(98,229,245,0.8)] sm:text-2xl"
            aria-live="polite"
          >
            <span className="absolute -left-3 top-12 hidden h-6 w-6 rotate-45 border-b-2 border-l-2 border-ice/50 bg-royal/60 md:block" />
            <span className="mb-2 block font-hud text-xs tracking-[0.3em] text-ice">BIMO</span>
            {text.slice(0, shown)}
            {typing && <span className="ml-0.5 inline-block h-6 w-0.5 animate-pulse bg-ice align-middle" />}
          </div>

          <div className="mt-4 flex items-center gap-2" aria-label={`Dialog ${line + 1} dari ${BIMO_INTRO.length}`}>
            {BIMO_INTRO.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === line ? "w-8 bg-ice" : i < line ? "w-2 bg-ice/60" : "w-2 bg-white/20"}`} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!last || typing ? (
              <button type="button" onClick={next} className="btn-primary btn-press px-6 py-3 text-base">
                {typing ? "Tampilkan semua" : "Lanjut"} <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" onClick={go} className="btn-gold btn-glow btn-press animate-pop-in px-8 py-4 text-lg">
                <Rocket size={22} /> AYO, BIMO! KITA MULAI!
              </button>
            )}
            {!last && (
              <button type="button" onClick={go} className="btn-ghost px-5 py-3 text-sm">
                Lewati perkenalan
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
