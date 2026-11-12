export type CircleElement = "center" | "radius" | "diameter" | "chord" | "arc" | "sector" | "segment" | "circumference";

export const ELEMENT_INFO: Record<CircleElement, { name: string; color: string; description: string; example: string }> = {
  center: {
    name: "Titik Pusat",
    color: "#FFD76A",
    description: "Titik tepat di tengah lingkaran. Semua titik pada lingkaran berjarak sama ke titik ini.",
    example: "As (poros) roda sepeda adalah titik pusat roda.",
  },
  radius: {
    name: "Jari-jari (r)",
    color: "#62E5F5",
    description: "Garis lurus dari titik pusat ke satu titik pada lingkaran. Semua jari-jari sama panjang.",
    example: "Ruji sepeda menghubungkan as ke tepi roda.",
  },
  diameter: {
    name: "Diameter (d)",
    color: "#318BFF",
    description: "Garis lurus yang melalui titik pusat dan menghubungkan dua titik pada lingkaran. d = 2 × r.",
    example: "Lebar sebuah piring yang diukur lewat tengahnya.",
  },
  chord: {
    name: "Tali Busur",
    color: "#8D7CFF",
    description: "Garis lurus yang menghubungkan dua titik pada lingkaran. Diameter adalah tali busur terpanjang.",
    example: "Tali busur panah yang menghubungkan dua ujung busur.",
  },
  arc: {
    name: "Busur",
    color: "#FFD76A",
    description: "Garis lengkung yang merupakan bagian dari keliling lingkaran.",
    example: "Pinggiran lengkung sepotong pizza.",
  },
  sector: {
    name: "Juring",
    color: "#62E5F5",
    description: "Daerah yang dibatasi oleh dua jari-jari dan sebuah busur.",
    example: "Sepotong pizza atau kue tart.",
  },
  segment: {
    name: "Tembereng",
    color: "#8D7CFF",
    description: "Daerah yang dibatasi oleh sebuah tali busur dan busurnya.",
    example: "Potongan pinggir semangka yang dipotong lurus.",
  },
  circumference: {
    name: "Keliling",
    color: "#FFD76A",
    description: "Panjang seluruh garis lengkung yang mengelilingi lingkaran.",
    example: "Panjang pagar yang mengelilingi taman bundar.",
  },
};

export const ANATOMY_ELEMENTS: CircleElement[] = ["center", "radius", "diameter", "chord", "arc", "sector", "segment"];

const C = 120;
const R = 90;
const pt = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: +(C + R * Math.cos(a)).toFixed(1), y: +(C + R * Math.sin(a)).toFixed(1) };
};

// Geometri tetap (derajat layar, y ke bawah)
const RADIUS_END = pt(330);
const CHORD_A = pt(150);
const CHORD_B = pt(30);
const SECTOR_A = pt(200);
const SECTOR_B = pt(260);
const ARC_A = pt(275);
const ARC_B = pt(318);

interface CircleDiagramProps {
  highlight?: CircleElement | null;
  /** tampilkan semua unsur (redup) — untuk diagram anatomi */
  showAll?: boolean;
  label?: string;
  size?: number | string;
  onSelect?: (el: CircleElement) => void;
  className?: string;
}

export function CircleDiagram({ highlight = null, showAll = false, label, size = "100%", onSelect, className = "" }: CircleDiagramProps) {
  const visible = (el: CircleElement) => showAll || highlight === el;
  const op = (el: CircleElement) => (highlight === el ? 1 : highlight ? 0.22 : 0.85);
  const interactive = Boolean(onSelect);
  const hit = (el: CircleElement) =>
    interactive
      ? {
          onClick: () => onSelect?.(el),
          style: { cursor: "pointer" },
          role: "button" as const,
          "aria-label": ELEMENT_INFO[el].name,
        }
      : {};

  const labelPos =
    highlight === "radius"
      ? { x: 168, y: 88 }
      : highlight === "diameter"
        ? { x: 120, y: 108 }
        : highlight === "chord"
          ? { x: 120, y: 182 }
          : highlight === "circumference"
            ? { x: 120, y: 24 }
            : { x: 120, y: 232 };

  return (
    <svg viewBox="0 0 240 240" width={size} className={`select-none ${className}`} role="img" aria-label={highlight ? ELEMENT_INFO[highlight].name : "Diagram lingkaran"}>
      {/* grid HUD */}
      <circle cx={C} cy={C} r={R + 18} fill="none" stroke="#62E5F5" strokeOpacity="0.12" strokeDasharray="2 6" />
      <circle cx={C} cy={C} r={R} fill="#102B59" fillOpacity="0.55" />

      {visible("segment") && (
        <path
          d={`M${CHORD_A.x} ${CHORD_A.y} A${R} ${R} 0 0 0 ${CHORD_B.x} ${CHORD_B.y} Z`}
          fill="#8D7CFF"
          fillOpacity={0.5 * op("segment")}
          {...hit("segment")}
        />
      )}
      {visible("sector") && (
        <path
          d={`M${C} ${C} L${SECTOR_A.x} ${SECTOR_A.y} A${R} ${R} 0 0 1 ${SECTOR_B.x} ${SECTOR_B.y} Z`}
          fill="#62E5F5"
          fillOpacity={0.45 * op("sector")}
          stroke="#62E5F5"
          strokeOpacity={op("sector")}
          strokeWidth="2"
          {...hit("sector")}
        />
      )}

      {/* keliling */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke={highlight === "circumference" ? "#FFD76A" : "#C9D8F5"}
        strokeWidth={highlight === "circumference" ? 6 : 3}
        strokeDasharray={highlight === "circumference" ? "10 6" : undefined}
        className={highlight === "circumference" ? "animate-spin-med origin-center" : undefined}
        style={highlight === "circumference" ? { transformOrigin: "120px 120px" } : undefined}
      />

      {visible("arc") && (
        <g {...hit("arc")}>
          <path d={`M${ARC_A.x} ${ARC_A.y} A${R} ${R} 0 0 1 ${ARC_B.x} ${ARC_B.y}`} fill="none" stroke="transparent" strokeWidth="22" />
          <path d={`M${ARC_A.x} ${ARC_A.y} A${R} ${R} 0 0 1 ${ARC_B.x} ${ARC_B.y}`} fill="none" stroke="#FFD76A" strokeOpacity={op("arc")} strokeWidth="7" strokeLinecap="round" />
        </g>
      )}
      {visible("chord") && (
        <g {...hit("chord")}>
          <line x1={CHORD_A.x} y1={CHORD_A.y} x2={CHORD_B.x} y2={CHORD_B.y} stroke="transparent" strokeWidth="20" />
          <line x1={CHORD_A.x} y1={CHORD_A.y} x2={CHORD_B.x} y2={CHORD_B.y} stroke="#8D7CFF" strokeOpacity={op("chord")} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {visible("diameter") && (
        <g {...hit("diameter")}>
          <line x1={C - R} y1={C} x2={C + R} y2={C} stroke="transparent" strokeWidth="20" />
          <line x1={C - R} y1={C} x2={C + R} y2={C} stroke="#318BFF" strokeOpacity={op("diameter")} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {visible("radius") && (
        <g {...hit("radius")}>
          <line x1={C} y1={C} x2={RADIUS_END.x} y2={RADIUS_END.y} stroke="transparent" strokeWidth="20" />
          <line x1={C} y1={C} x2={RADIUS_END.x} y2={RADIUS_END.y} stroke="#62E5F5" strokeOpacity={op("radius")} strokeWidth="5" strokeLinecap="round" />
          <circle cx={RADIUS_END.x} cy={RADIUS_END.y} r="4" fill="#62E5F5" fillOpacity={op("radius")} />
        </g>
      )}

      {/* titik pusat selalu tampil */}
      <g {...hit("center")}>
        <circle cx={C} cy={C} r="14" fill="transparent" />
        <circle
          cx={C}
          cy={C}
          r={highlight === "center" ? 7 : 4.5}
          fill="#FFD76A"
          fillOpacity={highlight && highlight !== "center" ? 0.6 : 1}
          className={highlight === "center" ? "animate-twinkle" : undefined}
        />
      </g>
      {(showAll || highlight === "center") && (
        <text x={C - 6} y={C + 20} fontSize="12" fontWeight="800" fill="#FFD76A">
          O
        </text>
      )}

      {label && (
        <g>
          <rect x={labelPos.x - 38} y={labelPos.y - 13} width="76" height="20" rx="10" fill="#07152F" fillOpacity="0.85" stroke="#62E5F5" strokeOpacity="0.6" />
          <text x={labelPos.x} y={labelPos.y + 1.5} textAnchor="middle" fontSize="12" fontWeight="800" fill="#F3F7FF">
            {label}
          </text>
        </g>
      )}
    </svg>
  );
}
