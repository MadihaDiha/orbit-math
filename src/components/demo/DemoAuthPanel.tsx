"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FlaskConical, LogIn, Rocket } from "lucide-react";
import { useDemoState } from "@/lib/demo/store";
import { demoLogin, demoRegister } from "@/lib/demo/backend";
import { validateClassName, validateFullName, validateUsername } from "@/lib/validation";
import { Bimo } from "@/components/bimo/Bimo";
import { Spinner } from "@/components/ui/Spinner";

/** Masuk/daftar Mode Demo — aktif hanya bila Supabase belum dikonfigurasi. */
export function DemoAuthPanel({ mode, next = "/dashboard" }: { mode: "login" | "register"; next?: string }) {
  const s = useDemoState();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [className, setClassName] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  // Sudah masuk → langsung ke dashboard (sama seperti versi Supabase).
  useEffect(() => {
    if (s?.loggedIn && s.profile) router.replace(next);
  }, [s, next, router]);

  const enter = () => {
    setBusy(true);
    demoLogin();
    router.replace(next);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = { fullName: validateFullName(fullName), username: validateUsername(username), className: validateClassName(className) };
    setErrors(v);
    if (v.fullName || v.username || v.className) return;
    setBusy(true);
    demoRegister({ fullName, username, className });
    router.replace(next);
  };

  const existing = s?.profile && !s.loggedIn ? s.profile : null;

  return (
    <div className="panel mx-auto max-w-md p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-4">
        <Bimo mood={mode === "login" ? "happy" : "wave"} size={64} />
        <div>
          <h1 className="font-hud text-2xl font-black">{mode === "login" ? "Welcome Back, Explorer!" : "Daftar Penjelajah Baru"}</h1>
          <p className="text-sm text-soft/70">ORBIT MATH · Mode Demo</p>
        </div>
      </div>

      <div className="mb-5 flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
        <FlaskConical className="shrink-0" size={20} />
        <p>
          <b>Mode Demo aktif.</b> Server akun (Supabase) belum dihubungkan, jadi akun & progres disimpan <b>di browser ini</b> saja — tanpa email dan password.
        </p>
      </div>

      {existing && (
        <button type="button" onClick={enter} disabled={busy} className="btn-primary mb-5 w-full py-3">
          {busy ? <Spinner /> : <LogIn size={18} />} Lanjutkan sebagai {existing.full_name}
        </button>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {existing && <p className="text-center text-xs text-soft/50">— atau buat penjelajah baru (progres lama di browser ini akan diganti) —</p>}
        <div>
          <label htmlFor="d-name" className="label">Nama lengkap</label>
          <input id="d-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`input ${errors.fullName ? "input-error" : ""}`} placeholder="contoh: Rani Putri" />
          {errors.fullName && <p className="field-error">{errors.fullName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="d-user" className="label">Username</label>
            <input id="d-user" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} className={`input ${errors.username ? "input-error" : ""}`} placeholder="rani_08" />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="d-class" className="label">Kelas</label>
            <input id="d-class" value={className} onChange={(e) => setClassName(e.target.value)} className={`input ${errors.className ? "input-error" : ""}`} placeholder="VIII A" />
            {errors.className && <p className="field-error">{errors.className}</p>}
          </div>
        </div>
        <button type="submit" disabled={busy} className={existing ? "btn-ghost w-full py-3" : "btn-primary w-full py-3"}>
          {busy ? <Spinner /> : <Rocket size={18} />} {mode === "login" && !existing ? "Masuk sebagai penjelajah" : "Mulai menjelajah"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-soft/50 hover:text-soft">← Kembali ke beranda</Link>
      </p>
    </div>
  );
}
