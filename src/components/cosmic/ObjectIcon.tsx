/** Ikon objek sederhana (SVG) untuk permainan, aktivitas, dan contoh kehidupan nyata. */
export { CIRCLE_OBJECTS, NON_CIRCLE_OBJECTS, OBJECT_INFO } from "@/lib/objects";

const S = { stroke: "#07152F", strokeWidth: 2 } as const;

export function ObjectIcon({ name, size = 64 }: { name: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      {renderIcon(name)}
    </svg>
  );
}

function renderIcon(name: string) {
  switch (name) {
    case "coin":
      return (
        <>
          <circle cx="32" cy="32" r="24" fill="#FFD76A" {...S} />
          <circle cx="32" cy="32" r="17" fill="none" stroke="#C99B2E" strokeWidth="2" />
          <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="900" fill="#8A6514">500</text>
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="32" cy="32" r="25" fill="#F3F7FF" {...S} />
          <circle cx="32" cy="32" r="25" fill="none" stroke="#318BFF" strokeWidth="4" />
          <line x1="32" y1="32" x2="32" y2="15" stroke="#07152F" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="32" x2="44" y2="36" stroke="#07152F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2.5" fill="#FF5C7A" />
        </>
      );
    case "wheel":
      return (
        <>
          <circle cx="32" cy="32" r="25" fill="#1B2A44" {...S} />
          <circle cx="32" cy="32" r="18" fill="#C9D8F5" />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="14" y1="32" x2="50" y2="32" stroke="#6C7FA6" strokeWidth="2" transform={`rotate(${a} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="4" fill="#318BFF" />
        </>
      );
    case "plate":
      return (
        <>
          <circle cx="32" cy="32" r="26" fill="#F3F7FF" {...S} />
          <circle cx="32" cy="32" r="17" fill="#E3ECFF" stroke="#C9D8F5" strokeWidth="2" />
        </>
      );
    case "cd":
      return (
        <>
          <circle cx="32" cy="32" r="25" fill="#C9D8F5" {...S} />
          <path d="M32 7 A25 25 0 0 1 57 32 L32 32 Z" fill="#8D7CFF" opacity="0.6" />
          <path d="M32 57 A25 25 0 0 1 7 32 L32 32 Z" fill="#62E5F5" opacity="0.6" />
          <circle cx="32" cy="32" r="6" fill="#07152F" />
        </>
      );
    case "button":
      return (
        <>
          <circle cx="32" cy="32" r="22" fill="#FF8FC7" {...S} />
          {[[26, 26], [38, 26], [26, 38], [38, 38]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#07152F" />
          ))}
        </>
      );
    case "lid":
      return (
        <>
          <circle cx="32" cy="32" r="22" fill="#FF5C7A" {...S} />
          <circle cx="32" cy="32" r="15" fill="none" stroke="#FFC2CE" strokeWidth="2" strokeDasharray="3 3" />
        </>
      );
    case "donut":
      return (
        <>
          <circle cx="32" cy="32" r="24" fill="#E8A960" {...S} />
          <circle cx="32" cy="32" r="20" fill="#FF8FC7" />
          <circle cx="32" cy="32" r="8" fill="#07152F" />
        </>
      );
    case "book":
      return (
        <>
          <rect x="14" y="10" width="36" height="44" rx="3" fill="#318BFF" {...S} />
          <rect x="18" y="10" width="4" height="44" fill="#1D55A6" />
          <rect x="26" y="20" width="18" height="6" rx="2" fill="#F3F7FF" />
        </>
      );
    case "phone":
      return (
        <>
          <rect x="19" y="6" width="26" height="52" rx="6" fill="#1B2A44" {...S} />
          <rect x="22" y="12" width="20" height="38" rx="2" fill="#62E5F5" />
        </>
      );
    case "door":
      return (
        <>
          <rect x="16" y="6" width="32" height="54" rx="2" fill="#B9773E" {...S} />
          <rect x="21" y="12" width="22" height="18" fill="#9A5F2D" />
          <circle cx="42" cy="36" r="2.5" fill="#FFD76A" />
        </>
      );
    case "egg":
      return <ellipse cx="32" cy="34" rx="17" ry="24" fill="#FFF4DD" {...S} />;
    case "slice":
      return (
        <>
          <path d="M10 50 L54 50 L32 12 Z" fill="#FFE0A3" {...S} />
          <path d="M10 50 L54 50 L52 44 L12 44 Z" fill="#FF8FC7" />
        </>
      );
    case "dice":
      return (
        <>
          <rect x="12" y="12" width="40" height="40" rx="8" fill="#F3F7FF" {...S} />
          {[[22, 22], [42, 42], [32, 32]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="4" fill="#07152F" />
          ))}
        </>
      );
    case "kite":
      return (
        <>
          <path d="M32 4 L52 26 L32 58 L12 26 Z" fill="#5BE3A1" {...S} />
          <line x1="32" y1="4" x2="32" y2="58" stroke="#07152F" strokeWidth="1.5" />
          <line x1="12" y1="26" x2="52" y2="26" stroke="#07152F" strokeWidth="1.5" />
        </>
      );
    case "ruler":
      return (
        <>
          <rect x="6" y="24" width="52" height="16" rx="2" fill="#FFD76A" {...S} />
          {[12, 18, 24, 30, 36, 42, 48, 54].map((x) => (
            <line key={x} x1={x} y1="24" x2={x} y2={x % 12 === 0 ? 33 : 29} stroke="#07152F" strokeWidth="1.5" />
          ))}
        </>
      );
    case "tv":
      return (
        <>
          <rect x="6" y="12" width="52" height="34" rx="4" fill="#1B2A44" {...S} />
          <rect x="10" y="16" width="44" height="26" fill="#318BFF" />
          <rect x="24" y="48" width="16" height="4" fill="#1B2A44" />
        </>
      );
    case "football":
      return (
        <>
          <ellipse cx="32" cy="32" rx="26" ry="15" fill="#B9773E" {...S} transform="rotate(-25 32 32)" />
          <line x1="24" y1="36" x2="40" y2="28" stroke="#F3F7FF" strokeWidth="2" />
        </>
      );
    case "pizza":
      return (
        <>
          <path d="M32 32 L58 32 A26 26 0 0 0 45 9.5 Z" fill="#FFD76A" {...S} />
          <circle cx="46" cy="24" r="3" fill="#FF5C7A" />
          <circle cx="50" cy="29" r="2.5" fill="#FF5C7A" />
        </>
      );
    case "gear":
      return (
        <>
          {[0, 45, 90, 135].map((a) => (
            <rect key={a} x="28" y="6" width="8" height="52" rx="2" fill="#8D7CFF" transform={`rotate(${a} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="17" fill="#8D7CFF" {...S} />
          <circle cx="32" cy="32" r="6" fill="#07152F" />
        </>
      );
    case "planet":
      return (
        <>
          <circle cx="32" cy="32" r="16" fill="#318BFF" />
          <ellipse cx="32" cy="32" rx="28" ry="8" fill="none" stroke="#62E5F5" strokeWidth="3" transform="rotate(-20 32 32)" />
          <circle cx="27" cy="27" r="4" fill="#F3F7FF" opacity="0.5" />
        </>
      );
    case "jar":
      return (
        <>
          <rect x="16" y="16" width="32" height="40" rx="6" fill="#62E5F5" opacity="0.5" {...S} />
          <rect x="14" y="8" width="36" height="10" rx="3" fill="#FF5C7A" {...S} />
          <rect x="16" y="30" width="32" height="12" fill="#FFD76A" />
        </>
      );
    case "track":
      return (
        <>
          <circle cx="32" cy="32" r="25" fill="#E0664A" />
          <circle cx="32" cy="32" r="16" fill="#5BE3A1" />
          <circle cx="32" cy="32" r="20.5" fill="none" stroke="#F3F7FF" strokeWidth="1.5" strokeDasharray="3 3" />
        </>
      );
    case "ferris":
      return (
        <>
          <circle cx="32" cy="28" r="20" fill="none" stroke="#62E5F5" strokeWidth="3" />
          {[0, 60, 120].map((a) => (
            <line key={a} x1="12" y1="28" x2="52" y2="28" stroke="#62E5F5" strokeWidth="1.5" transform={`rotate(${a} 32 28)`} />
          ))}
          <path d="M32 28 L20 60 M32 28 L44 60" stroke="#C9D8F5" strokeWidth="3" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={32 + 20 * Math.cos((a * Math.PI) / 180)} cy={28 + 20 * Math.sin((a * Math.PI) / 180)} r="4" fill="#FFD76A" />
          ))}
        </>
      );
    case "garden":
      return (
        <>
          <circle cx="32" cy="32" r="24" fill="#5BE3A1" />
          <circle cx="32" cy="32" r="24" fill="none" stroke="#B9773E" strokeWidth="4" strokeDasharray="4 3" />
          <circle cx="26" cy="28" r="4" fill="#FF8FC7" />
          <circle cx="38" cy="36" r="4" fill="#FFD76A" />
        </>
      );
    case "table":
      return (
        <>
          <ellipse cx="32" cy="24" rx="26" ry="10" fill="#B9773E" {...S} />
          <rect x="29" y="30" width="6" height="22" fill="#9A5F2D" />
          <rect x="20" y="52" width="24" height="4" rx="2" fill="#9A5F2D" />
        </>
      );
    case "ribbon":
      return (
        <>
          <circle cx="32" cy="34" r="22" fill="#F3F7FF" {...S} />
          <circle cx="32" cy="34" r="22" fill="none" stroke="#FF5C7A" strokeWidth="5" />
          <path d="M32 12 l-10 -8 l0 14 z M32 12 l10 -8 l0 14 z" fill="#FF5C7A" />
        </>
      );
    default:
      return <circle cx="32" cy="32" r="24" fill="#318BFF" />;
  }
}
