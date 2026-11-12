"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { friendlyError } from "@/lib/errors";
import { validatePassword } from "@/lib/validation";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Spinner } from "@/components/ui/Spinner";
import { BimoSays } from "@/components/bimo/BimoSays";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setHasSession(false);
      return;
    }
    createClient()
      .auth.getUser()
      .then(({ data }) => setHasSession(Boolean(data.user)));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validatePassword(password) ?? (password !== confirm ? "Konfirmasi password tidak sama." : undefined);
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await createClient().auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel mx-auto max-w-md p-6 sm:p-8">
      <h1 className="mb-1 font-hud text-2xl font-black">Buat password baru</h1>
      <p className="mb-6 text-sm text-soft/70">Gunakan minimal 8 karakter berisi huruf dan angka.</p>
      <ConfigNotice />
      {hasSession === null ? (
        <div className="flex justify-center py-6 text-ice"><Spinner size={28} /></div>
      ) : done ? (
        <div className="space-y-4">
          <BimoSays mood="proud" size={64}>Password berhasil diperbarui! Kunci kapsulmu sudah diganti.</BimoSays>
          <button type="button" onClick={() => { router.replace("/dashboard"); router.refresh(); }} className="btn-primary w-full">Lanjut ke dashboard</button>
        </div>
      ) : !hasSession ? (
        <div className="space-y-4">
          <BimoSays mood="oops" size={64}>Tautan pemulihan tidak ditemukan atau sudah kedaluwarsa. Minta tautan baru, ya.</BimoSays>
          <Link href="/forgot-password" className="btn-primary w-full">Kirim ulang tautan</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="new-password" className="label">Password baru</label>
            <PasswordInput id="new-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={Boolean(error)} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Konfirmasi password baru</label>
            <PasswordInput id="confirm-password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} invalid={Boolean(error)} />
          </div>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Spinner /> : <KeyRound size={18} />} Simpan password
          </button>
        </form>
      )}
    </div>
  );
}
