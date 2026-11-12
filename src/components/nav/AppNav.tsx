"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Target,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/cosmic/Logo";
import { Bimo } from "@/components/bimo/Bimo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { demoLogout } from "@/lib/demo/backend";
import { levelProgress } from "@/lib/levels";
import type { AvatarColor } from "@/lib/types";
import { Spinner } from "@/components/ui/Spinner";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Control Center", icon: LayoutDashboard },
  { href: "/galaxy", label: "Galaxy Map", icon: Map },
  { href: "/lab", label: "Circle Lab", icon: FlaskConical },
  { href: "/training", label: "Training Zone", icon: Target },
  { href: "/playground", label: "Playground", icon: Gamepad2 },
  { href: "/exam", label: "Final Exam", icon: GraduationCap },
  { href: "/achievements", label: "Pencapaian", icon: Award },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/profile", label: "Profil", icon: User },
];
const MOBILE = ["/dashboard", "/galaxy", "/lab", "/playground"];

interface AppNavProps {
  name: string;
  username: string;
  xp: number;
  avatar: AvatarColor;
}

export function LogoutButton({ className = "btn-danger", compact = false }: { className?: string; compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    try {
      if (isSupabaseConfigured()) await createClient().auth.signOut();
      else demoLogout(); // progres tetap tersimpan
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };
  return (
    <button type="button" onClick={logout} disabled={busy} className={className}>
      {busy ? <Spinner size={16} /> : <LogOut size={16} />} {!compact && "Keluar"}
    </button>
  );
}

export function AppNav({ name, username, xp, avatar }: AppNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const lp = levelProgress(xp);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ice/10 bg-navy/75 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-20">
          <Logo href="/dashboard" size={32} />
          <nav className="ml-4 hidden items-center gap-1 xl:flex" aria-label="Navigasi utama">
            {LINKS.slice(0, 6).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition ${active(l.href) ? "bg-neon/20 text-ice" : "text-soft/70 hover:bg-white/5 hover:text-soft"}`}
                aria-current={active(l.href) ? "page" : undefined}
              >
                <l.icon size={16} /> {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/profile" className="hidden items-center gap-3 rounded-full border border-ice/15 bg-deep/60 py-1 pl-1 pr-4 hover:border-ice/40 sm:flex">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-royal/40">
                <Bimo mood="happy" size={38} color={avatar} />
              </span>
              <span className="leading-tight">
                <span className="block max-w-[140px] truncate text-sm font-bold">{name}</span>
                <span className="flex items-center gap-2 text-[11px] text-soft/60">
                  Lv {lp.current.level} · {xp} XP
                  <span className="h-1 w-14 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-gold" style={{ width: `${lp.percent}%` }} /></span>
                </span>
              </span>
            </Link>
            <LogoutButton className="btn-danger hidden px-4 py-2 text-sm xl:inline-flex" />
            <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-ice/20 p-2.5 xl:hidden" aria-label="Buka menu" aria-expanded={open}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Laci menu (tablet & ponsel) */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-navy/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Tutup menu" />
          <div className="absolute right-0 top-0 flex h-full w-[300px] max-w-[85vw] animate-slide-up flex-col gap-2 border-l border-ice/15 bg-deep p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-hud text-sm font-bold text-ice">MENU</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10" aria-label="Tutup menu"><X size={20} /></button>
            </div>
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-navy/60 p-3">
              <Bimo mood="happy" size={44} color={avatar} />
              <div className="min-w-0">
                <p className="truncate font-bold">{name}</p>
                <p className="text-xs text-soft/60">@{username} · Lv {lp.current.level} {lp.current.title}</p>
              </div>
            </div>
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold ${active(l.href) ? "bg-neon/20 text-ice" : "hover:bg-white/5"}`}>
                <l.icon size={18} /> {l.label}
              </Link>
            ))}
            <LogoutButton className="btn-danger mt-auto w-full" />
          </div>
        </div>
      )}

      {/* Navigasi bawah (ponsel) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ice/10 bg-navy/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden" aria-label="Navigasi cepat">
        <div className="grid grid-cols-5">
          {LINKS.filter((l) => MOBILE.includes(l.href)).map((l) => (
            <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold ${active(l.href) ? "text-ice" : "text-soft/60"}`}>
              <l.icon size={20} /> {l.label.split(" ")[0]}
            </Link>
          ))}
          <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold text-soft/60">
            <Menu size={20} /> Menu
          </button>
        </div>
      </nav>
    </>
  );
}
