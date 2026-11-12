"use client";

import { Bimo } from "@/components/bimo/Bimo";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="panel mx-auto max-w-lg p-8 text-center">
      <Bimo mood="oops" size={120} className="mx-auto block" />
      <h1 className="mt-3 font-hud text-xl font-black">Ups, ada gangguan sinyal!</h1>
      <p className="mt-2 text-sm text-soft/70">Data tidak bisa dimuat. Pastikan database Supabase sudah disiapkan (migrasi & seed), lalu coba lagi.</p>
      {error.digest && <p className="mt-2 text-xs text-soft/40">Kode: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn-primary mt-5">Coba lagi</button>
    </div>
  );
}
