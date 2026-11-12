"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { useDemoState } from "@/lib/demo/store";
import { AppNav } from "@/components/nav/AppNav";
import { LoadingPanel } from "@/components/ui/Spinner";

/** Pelindung halaman privat di Mode Demo: belum masuk → diarahkan ke /login. */
export function DemoShell({ children }: { children: ReactNode }) {
  const s = useDemoState();
  const router = useRouter();
  const pathname = usePathname();
  const ready = s !== null;
  const loggedIn = Boolean(s?.loggedIn && s.profile);

  useEffect(() => {
    if (ready && !loggedIn) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, loggedIn, pathname, router]);

  if (!s || !loggedIn || !s.profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-24">
        <LoadingPanel text="Memeriksa kartu identitas penjelajah..." />
      </div>
    );
  }

  return (
    <>
      <AppNav name={s.profile.full_name} username={s.profile.username} xp={s.stats.total_xp} avatar={s.profile.avatar_color} />
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:pb-16 sm:pt-8">
        <DemoBanner />
        {children}
      </div>
    </>
  );
}

export function DemoBanner() {
  return (
    <p className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold">
      <FlaskConical size={14} /> Mode Demo — progres tersimpan di browser ini saja.
      <Link href="/#mode-demo" className="underline">Apa artinya?</Link>
    </p>
  );
}
