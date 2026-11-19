"use client";

import { useEffect } from "react";
import { useReward } from "@/components/reward/RewardProvider";

/** Ledakan bintang sekali saat halaman Hasil Akhir dibuka. */
export function ResultsCelebration() {
  const { burst } = useReward();
  useEffect(() => {
    const t = window.setTimeout(burst, 600);
    return () => window.clearTimeout(t);
  }, [burst]);
  return null;
}
