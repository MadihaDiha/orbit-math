"use client";

import { useEffect } from "react";
import { Music, Music2, Volume2, VolumeX } from "lucide-react";
import { resumeMusicIfEnabled, setMusic, setSfx, useSoundSettings } from "@/lib/sound";

/** Tombol musik latar & efek suara. Juga melanjutkan musik setelah klik pertama. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const s = useSoundSettings();

  useEffect(() => {
    const onFirst = () => {
      resumeMusicIfEnabled();
      window.removeEventListener("pointerdown", onFirst);
    };
    window.addEventListener("pointerdown", onFirst);
    return () => window.removeEventListener("pointerdown", onFirst);
  }, []);

  const base = "grid h-10 w-10 place-items-center rounded-full border transition hover:scale-105";
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setMusic(!s.music)}
        className={`${base} ${s.music ? "border-nebula/60 bg-nebula/25 text-nebula" : "border-ice/20 text-soft/50"}`}
        aria-pressed={s.music}
        aria-label={s.music ? "Matikan musik latar" : "Nyalakan musik latar"}
        title={s.music ? "Musik: nyala" : "Musik: mati"}
      >
        {s.music ? <Music size={17} /> : <Music2 size={17} className="opacity-60" />}
      </button>
      <button
        type="button"
        onClick={() => setSfx(!s.sfx)}
        className={`${base} ${s.sfx ? "border-ice/50 bg-ice/15 text-ice" : "border-ice/20 text-soft/50"}`}
        aria-pressed={s.sfx}
        aria-label={s.sfx ? "Matikan efek suara" : "Nyalakan efek suara"}
        title={s.sfx ? "Efek suara: nyala" : "Efek suara: mati"}
      >
        {s.sfx ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>
    </div>
  );
}
