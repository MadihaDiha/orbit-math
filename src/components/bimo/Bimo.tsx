import type { AvatarColor } from "@/lib/types";

export type BimoMood = "happy" | "wow" | "thinking" | "oops" | "proud" | "wave";

export const AVATAR_COLORS: Record<AvatarColor, { accent: string; label: string }> = {
  blue: { accent: "#318BFF", label: "Neon Blue" },
  cyan: { accent: "#62E5F5", label: "Ice Cyan" },
  violet: { accent: "#8D7CFF", label: "Violet Nebula" },
  gold: { accent: "#FFD76A", label: "Star Gold" },
  pink: { accent: "#FF8FC7", label: "Cosmic Pink" },
  green: { accent: "#5BE3A1", label: "Aurora Green" },
};

interface BimoProps {
  mood?: BimoMood;
  size?: number;
  color?: AvatarColor;
  float?: boolean;
  className?: string;
  title?: string;
}

/**
 * BIMO — astronaut kecil maskot ORBIT MATH.
 * Ciri khas tetap: helm bulat putih, visor navy bergaris cyan, antena bercahaya,
 * telinga helm berwarna aksen, lambang orbit di dada.
 */
export function Bimo({ mood = "happy", size = 160, color = "blue", float = false, className = "", title = "BIMO" }: BimoProps) {
  const accent = AVATAR_COLORS[color]?.accent ?? AVATAR_COLORS.blue.accent;
  const suit = "#F3F7FF";
  const suitShade = "#C9D8F5";
  const visor = "#0B1E44";
  const ice = "#62E5F5";

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      role="img"
      aria-label={title}
      className={`${float ? "animate-float" : ""} drop-shadow-[0_0_24px_rgba(98,229,245,0.35)] ${className}`}
    >
      <title>{title}</title>
      {/* Antena */}
      <line x1="100" y1="26" x2="100" y2="10" stroke={suitShade} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="9" r="7" fill={ice} className="animate-twinkle" />
      <circle cx="100" cy="9" r="3" fill="#ffffff" />

      {/* Ransel */}
      <rect x="54" y="122" width="92" height="58" rx="22" fill={suitShade} />

      {/* Lengan kiri */}
      <rect x="40" y="136" width="26" height="40" rx="13" fill={suit} stroke={suitShade} strokeWidth="2" />
      <circle cx="53" cy="178" r="9" fill={accent} />

      {/* Lengan kanan (melambai atau normal) */}
      {mood === "wave" || mood === "proud" ? (
        <g transform="rotate(-140 147 142)">
          <rect x="134" y="136" width="26" height="40" rx="13" fill={suit} stroke={suitShade} strokeWidth="2" />
          <circle cx="147" cy="178" r="9" fill={accent} />
        </g>
      ) : (
        <>
          <rect x="134" y="136" width="26" height="40" rx="13" fill={suit} stroke={suitShade} strokeWidth="2" />
          <circle cx="147" cy="178" r="9" fill={accent} />
        </>
      )}

      {/* Kaki */}
      <rect x="72" y="178" width="24" height="30" rx="10" fill={suit} stroke={suitShade} strokeWidth="2" />
      <rect x="104" y="178" width="24" height="30" rx="10" fill={suit} stroke={suitShade} strokeWidth="2" />
      <rect x="70" y="198" width="28" height="14" rx="7" fill={accent} />
      <rect x="102" y="198" width="28" height="14" rx="7" fill={accent} />

      {/* Badan */}
      <rect x="62" y="126" width="76" height="64" rx="28" fill={suit} stroke={suitShade} strokeWidth="2" />
      <path d="M66 168 Q100 180 134 168" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="80" y="140" width="40" height="26" rx="10" fill="#102B59" stroke={ice} strokeWidth="2" />
      {/* Lambang orbit */}
      <circle cx="100" cy="153" r="5" fill={ice} />
      <ellipse cx="100" cy="153" rx="14" ry="6" fill="none" stroke={ice} strokeWidth="1.8" transform="rotate(-20 100 153)" />
      <circle cx="112" cy="148" r="2" fill="#FFD76A" />

      {/* Helm */}
      <circle cx="44" cy="80" r="13" fill={accent} />
      <circle cx="156" cy="80" r="13" fill={accent} />
      <circle cx="100" cy="78" r="56" fill={suit} stroke={suitShade} strokeWidth="3" />
      <ellipse cx="100" cy="82" rx="43" ry="35" fill={visor} stroke={ice} strokeWidth="3.5" />
      <path d="M70 66 Q80 54 96 52" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />

      <BimoFace mood={mood} />

      {mood === "oops" && <path d="M146 44 q6 10 0 14 q-6 -4 0 -14z" fill={ice} opacity="0.9" />}
      {mood === "proud" && (
        <>
          <Star x={30} y={30} />
          <Star x={170} y={36} />
        </>
      )}
      {mood === "thinking" && (
        <text x="160" y="32" fontSize="26" fontWeight="900" fill="#FFD76A" fontFamily="sans-serif">
          ?
        </text>
      )}
    </svg>
  );
}

function Star({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y - 9} L${x + 2.6} ${y - 2.6} L${x + 9} ${y} L${x + 2.6} ${y + 2.6} L${x} ${y + 9} L${x - 2.6} ${y + 2.6} L${x - 9} ${y} L${x - 2.6} ${y - 2.6} Z`}
      fill="#FFD76A"
      className="animate-twinkle"
    />
  );
}

function BimoFace({ mood }: { mood: BimoMood }) {
  const eye = "#F3F7FF";
  const pupil = "#07152F";
  const cheek = "#FF8FC7";

  if (mood === "proud") {
    return (
      <g>
        <path d="M74 80 q8 -10 16 0" stroke={eye} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M110 80 q8 -10 16 0" stroke={eye} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M84 94 q16 18 32 0 z" fill={eye} />
        <circle cx="72" cy="96" r="5" fill={cheek} opacity="0.7" />
        <circle cx="128" cy="96" r="5" fill={cheek} opacity="0.7" />
      </g>
    );
  }

  const pupilOffset = mood === "thinking" ? { x: 3, y: -4 } : { x: 0, y: 1 };
  const eyeRy = mood === "wow" ? 12 : 10;

  return (
    <g>
      {mood === "oops" && (
        <>
          <path d="M72 64 L88 69" stroke={eye} strokeWidth="3" strokeLinecap="round" />
          <path d="M128 64 L112 69" stroke={eye} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="82" cy="80" rx="8.5" ry={eyeRy} fill={eye} />
      <ellipse cx="118" cy="80" rx="8.5" ry={eyeRy} fill={eye} />
      <circle cx={82 + pupilOffset.x} cy={81 + pupilOffset.y} r="4.6" fill={pupil} />
      <circle cx={118 + pupilOffset.x} cy={81 + pupilOffset.y} r="4.6" fill={pupil} />
      <circle cx={84 + pupilOffset.x} cy={78 + pupilOffset.y} r="1.6" fill="#ffffff" />
      <circle cx={120 + pupilOffset.x} cy={78 + pupilOffset.y} r="1.6" fill="#ffffff" />

      {mood === "happy" || mood === "wave" ? <path d="M88 97 q12 11 24 0" stroke={eye} strokeWidth="4" fill="none" strokeLinecap="round" /> : null}
      {mood === "wow" ? <ellipse cx="100" cy="101" rx="7" ry="8" fill={eye} /> : null}
      {mood === "thinking" ? <path d="M92 101 h14" stroke={eye} strokeWidth="4" strokeLinecap="round" /> : null}
      {mood === "oops" ? <path d="M86 102 q5 -5 10 0 q5 5 10 0 q4 -4 8 0" stroke={eye} strokeWidth="3.5" fill="none" strokeLinecap="round" /> : null}

      <circle cx="70" cy="95" r="5" fill={cheek} opacity="0.6" />
      <circle cx="130" cy="95" r="5" fill={cheek} opacity="0.6" />
    </g>
  );
}
