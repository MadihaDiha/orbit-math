"use client";

import { useState } from "react";
import { ANATOMY_ELEMENTS, CircleDiagram, ELEMENT_INFO, type CircleElement } from "./CircleDiagram";
import { BimoSays } from "@/components/bimo/BimoSays";

/** Diagram anatomi lingkaran interaktif: ketuk nama atau bagian diagram. */
export function CircleAnatomy({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<CircleElement | null>("radius");
  const [seen, setSeen] = useState<Set<CircleElement>>(new Set(["radius"]));

  const select = (el: CircleElement) => {
    setSelected(el);
    setSeen((prev) => new Set(prev).add(el));
  };

  const info = selected ? ELEMENT_INFO[selected] : null;

  return (
    <div className={`grid gap-6 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"} items-start`}>
      <div className="panel-hud grid-hud p-4">
        <CircleDiagram showAll highlight={selected} onSelect={select} className="mx-auto max-w-[340px]" />
        <p className="mt-2 text-center text-xs text-soft/60">Ketuk bagian diagram atau tombol di bawah.</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Unsur lingkaran">
          {ANATOMY_ELEMENTS.map((el) => (
            <button
              key={el}
              type="button"
              role="tab"
              aria-selected={selected === el}
              onClick={() => select(el)}
              className={`rounded-full border px-3.5 py-2 text-sm font-bold transition ${
                selected === el ? "border-transparent text-navy" : "border-ice/25 bg-white/5 text-soft hover:border-ice/60"
              }`}
              style={selected === el ? { background: ELEMENT_INFO[el].color } : undefined}
            >
              {seen.has(el) && selected !== el ? "✓ " : ""}
              {ELEMENT_INFO[el].name}
            </button>
          ))}
        </div>

        {info && (
          <div key={selected} className="panel animate-pop-in p-5">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full" style={{ background: info.color, boxShadow: `0 0 14px ${info.color}` }} />
              <h4 className="font-hud text-lg font-black">{info.name}</h4>
            </div>
            <p className="mt-3 leading-relaxed text-soft/90">{info.description}</p>
            <p className="mt-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-soft/80">
              <span className="font-bold text-ice">Contoh: </span>
              {info.example}
            </p>
          </div>
        )}

        <BimoSays mood={seen.size === ANATOMY_ELEMENTS.length ? "proud" : "happy"} size={72}>
          {seen.size === ANATOMY_ELEMENTS.length
            ? "Keren! Kamu sudah memeriksa ketujuh unsur lingkaran!"
            : `Kamu sudah memeriksa ${seen.size} dari ${ANATOMY_ELEMENTS.length} unsur. Ayo cek semuanya!`}
        </BimoSays>
      </div>
    </div>
  );
}
