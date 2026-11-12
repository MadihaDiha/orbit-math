import type { ReactNode } from "react";
import { Bimo, type BimoMood } from "./Bimo";
import type { AvatarColor } from "@/lib/types";

interface BimoSaysProps {
  mood?: BimoMood;
  children: ReactNode;
  size?: number;
  color?: AvatarColor;
  align?: "left" | "right";
  className?: string;
  float?: boolean;
}

/** BIMO dengan balon percakapan. Dipakai untuk sapaan, petunjuk, dan umpan balik. */
export function BimoSays({ mood = "happy", children, size = 96, color, align = "left", className = "", float = true }: BimoSaysProps) {
  return (
    <div className={`flex items-end gap-3 ${align === "right" ? "flex-row-reverse" : ""} ${className}`}>
      <div className="shrink-0">
        <Bimo mood={mood} size={size} color={color} float={float} />
      </div>
      <div
        className={`relative mb-6 max-w-xl rounded-3xl border border-ice/30 bg-gradient-to-br from-royal/50 to-deep/80 px-4 py-3 text-sm font-semibold leading-relaxed text-soft shadow-[0_0_30px_-10px_rgba(98,229,245,0.6)] sm:text-base ${
          align === "right" ? "rounded-br-md" : "rounded-bl-md"
        }`}
      >
        <span className="mb-1 block font-hud text-[10px] font-bold uppercase tracking-[0.3em] text-ice">BIMO</span>
        {children}
      </div>
    </div>
  );
}
