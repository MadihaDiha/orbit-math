"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import type { EarnedAchievement } from "@/lib/types";
import { AchievementIcon } from "./AchievementIcon";
import { Bimo } from "@/components/bimo/Bimo";

interface Toast {
  id: number;
  text: string;
  tone: "xp" | "info" | "error";
}

interface RewardContextValue {
  /** Tampilkan XP & lencana baru, lalu segarkan data server (XP di header). */
  celebrate: (opts: { xp?: number; achievements?: EarnedAchievement[]; message?: string }) => void;
  notify: (text: string, tone?: Toast["tone"]) => void;
}

const RewardContext = createContext<RewardContextValue | null>(null);

export function useReward(): RewardContextValue {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error("useReward harus dipakai di dalam RewardProvider");
  return ctx;
}

let toastId = 0;

export function RewardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [badges, setBadges] = useState<EarnedAchievement[]>([]);

  const notify = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const celebrate = useCallback<RewardContextValue["celebrate"]>(
    ({ xp, achievements, message }) => {
      if (message) notify(message, "info");
      if (xp && xp > 0) notify(`+${xp} XP energi galaksi!`, "xp");
      if (achievements && achievements.length > 0) setBadges((b) => [...b, ...achievements]);
      router.refresh();
    },
    [notify, router],
  );

  const current = badges[0];

  return (
    <RewardContext.Provider value={{ celebrate, notify }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex animate-slide-up items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold shadow-xl backdrop-blur ${
              t.tone === "xp"
                ? "border-gold/60 bg-gold/20 text-gold"
                : t.tone === "error"
                  ? "border-rose-300/50 bg-rose-500/20 text-rose-100"
                  : "border-ice/40 bg-deep/90 text-soft"
            }`}
          >
            {t.tone === "xp" && <Sparkles size={16} />}
            {t.text}
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-navy/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="badge-title">
          <div className="panel relative w-full max-w-sm animate-pop-in overflow-hidden p-6 text-center">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(255,215,106,0.35),transparent_60%)]" />
            <button type="button" onClick={() => setBadges((b) => b.slice(1))} className="absolute right-3 top-3 rounded-full p-2 text-soft/60 hover:bg-white/10" aria-label="Tutup">
              <X size={18} />
            </button>
            <p className="eyebrow text-gold">Lencana baru terbuka!</p>
            <div className="my-5 flex items-center justify-center gap-4">
              <Bimo mood="proud" size={84} />
              <div className="animate-[spin-slow_6s_linear_infinite]">
                <AchievementIcon icon={current.icon} size={34} />
              </div>
            </div>
            <h3 id="badge-title" className="font-hud text-2xl font-black text-gold glow-text">{current.title}</h3>
            <p className="mt-2 text-soft/85">{current.description}</p>
            {current.xp > 0 && <p className="mt-3 chip mx-auto border-gold/50 bg-gold/15 text-gold">+{current.xp} XP</p>}
            <p className="mt-4 text-sm font-semibold text-ice">&ldquo;LUAR BIASA! Koleksi lencanamu bertambah!&rdquo; — BIMO</p>
            <button type="button" onClick={() => setBadges((b) => b.slice(1))} className="btn-gold mt-5 w-full">
              Keren, lanjut!
            </button>
          </div>
        </div>
      )}
    </RewardContext.Provider>
  );
}
