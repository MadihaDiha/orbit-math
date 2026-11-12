"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { validateLogin } from "@/lib/validation";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Spinner } from "@/components/ui/Spinner";
import { Bimo } from "@/components/bimo/Bimo";

export function LoginForm({ next, linkError }: { next: string; linkError: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(linkError ? "Tautan sudah kedaluwarsa atau tidak valid. Silakan coba lagi." : null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const v = validateLogin(email, password);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      router.replace(next);
      router.refresh();
    } catch (err) {
      setFormError(friendlyError(err));
      setLoading(false);
    }
  };

  return (
    <div className="panel mx-auto max-w-md p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Bimo mood="happy" size={64} />
        <div>
          <h1 className="font-hud text-2xl font-black">Welcome Back, Explorer!</h1>
          <p className="text-sm text-soft/70">Masuk untuk melanjutkan misimu.</p>
        </div>
      </div>
      <ConfigNotice />
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`input ${errors.email ? "input-error" : ""}`} placeholder="nama@email.com" aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link href="/forgot-password" className="mb-1.5 text-sm font-bold text-ice hover:underline">Lupa password?</Link>
          </div>
          <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={Boolean(errors.password)} placeholder="••••••••" />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        {formError && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-200" role="alert">{formError}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <Spinner /> : <LogIn size={18} />} {loading ? "Meluncur..." : "Masuk"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-soft/70">
        Belum punya akun? <Link href="/register" className="font-bold text-ice hover:underline">Daftar sebagai penjelajah</Link>
      </p>
      <p className="mt-2 text-center text-sm"><Link href="/" className="text-soft/50 hover:text-soft">← Kembali ke beranda</Link></p>
    </div>
  );
}
