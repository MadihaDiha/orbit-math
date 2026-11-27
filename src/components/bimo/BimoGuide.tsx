"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MessageCircle, X } from "lucide-react";
import { BIMO_TIPS } from "@/lib/bimo-lines";
import { playSfx } from "@/lib/sound";
import { Bimo } from "./Bimo";
import { BimoChat } from "./BimoChat";
import { useDemoState } from "@/lib/demo/store";

/** BIMO pemandu melayang: menyapa di setiap halaman & memberi petunjuk bila diketuk.
 *  Dari balon petunjuk, siswa juga bisa membuka chat BIMO AI (DeepSeek). */
export function BimoGuide({ owner }: { owner?: string }) {
  const pathname = usePathname() || "/";
  const entry = useMemo(() => BIMO_TIPS.find((t) => pathname === t.prefix || pathname.startsWith(t.prefix + "/") || t.prefix === "/") ?? BIMO_TIPS[BIMO_TIPS.length - 1], [pathname]);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(-1); // -1 = sapaan
  const [hint, setHint] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const demo = useDemoState();
  const chatOwner = owner ?? demo?.profile?.username ?? "tamu";

  // Sapaan singkat saat berpindah halaman
  useEffect(() => {
    setTip(-1);
    setHint(true);
    const wide = window.matchMedia("(min-width: 768px)").matches;
    setOpen(wide); // di ponsel cukup titik petunjuk agar tidak menutupi konten
    const t = window.setTimeout(() => setOpen(false), 4500);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const text = tip < 0 ? entry.greet : entry.tips[tip % entry.tips.length];

  const toggle = () => {
    playSfx("click");
    setHint(false);
    if (chatOpen) {
      setChatOpen(false);
      return;
    }
    if (!open) {
      setTip(0);
      setOpen(true);
    } else setOpen(false);
  };

  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-40 flex items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div className="speech-in pointer-events-auto mb-10 max-w-[260px] rounded-3xl rounded-br-md border border-ice/40 bg-deep/95 p-4 text-sm font-semibold shadow-[0_0_40px_-10px_rgba(98,229,245,0.8)] backdrop-blur" role="status" key={`${pathname}-${tip}`}>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-hud text-[10px] tracking-[0.3em] text-ice">BIMO</span>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-soft/50 hover:bg-white/10" aria-label="Tutup petunjuk">
              <X size={14} />
            </button>
          </div>
          <p>{text}</p>
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setTip((t) => t + 1);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-gold hover:underline"
          >
            {tip < 0 ? "Minta petunjuk" : "Petunjuk lain"} <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              playSfx("click");
              setOpen(false);
              setChatOpen(true);
            }}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-neon to-nebula px-3 py-2 text-xs font-extrabold text-white shadow-[0_0_18px_-4px_#318BFF] hover:brightness-110"
          >
            <MessageCircle size={14} /> Tanya BIMO AI
          </button>
        </div>
      )}
      {chatOpen && <BimoChat owner={chatOwner} onClose={() => setChatOpen(false)} />}
      <button
        type="button"
        onClick={toggle}
        className="pointer-events-auto relative transition hover:scale-110 active:scale-95"
        aria-label={open ? "Sembunyikan BIMO" : "Minta petunjuk BIMO"}
        aria-expanded={open}
      >
        {hint && !open && <span className="absolute -top-1 right-1 h-3.5 w-3.5 animate-ping rounded-full bg-gold" />}
        <Bimo mood={open ? "happy" : "wave"} action={open ? "nod" : "idle"} talking={open} size={76} float />
      </button>
    </div>
  );
}
