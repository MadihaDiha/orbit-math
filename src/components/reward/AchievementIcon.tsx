import { Award, Calculator, Gamepad2, Orbit, Rocket, Ruler, Search, Sigma, Star, Trophy, Zap, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  ruler: Ruler,
  search: Search,
  orbit: Orbit,
  sigma: Sigma,
  calculator: Calculator,
  zap: Zap,
  gamepad: Gamepad2,
  trophy: Trophy,
  star: Star,
};

export function AchievementIcon({ icon, size = 28, earned = true }: { icon: string; size?: number; earned?: boolean }) {
  const Icon = ICONS[icon] ?? Award;
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full ${earned ? "bg-gradient-to-br from-gold to-[#ffb84d] text-navy shadow-[0_0_24px_-4px_#FFD76A]" : "border border-dashed border-soft/25 bg-white/5 text-soft/30"}`}
      style={{ width: size * 2, height: size * 2 }}
    >
      <Icon size={size} strokeWidth={2.4} />
    </span>
  );
}
