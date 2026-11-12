"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MailCheck, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { validateEmail } from "@/lib/validation";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Spinner } from "@/components/ui/Spinner";
import { Bimo } from "@/components/bimo/Bimo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateEmail(email);
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel mx-auto max-w-md p-6 sm:p-8">
      {sent ? (
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto text-ice" size={48} />
          <h1 className="font-hud text-2xl font-black">Cek emailmu!</h1>
          <p className="text-soft/80">
            Permintaan pemulihan berhasil dikirim. Jika <b className="text-ice">{email.trim()}</b> terdaftar, instruksi untuk membuat password baru sudah dikirim ke email tersebut.
          </p>
          <Link href="/login" className="btn-primary w-full">Kembali ke login</Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-4">
            <Bimo mood="thinking" size={64} />
            <div>
              <h1 className="font-hud text-2xl font-black">Lupa password?</h1>
              <p className="text-sm text-soft/70">Tenang, BIMO bantu kirim tautan pemulihan.</p>
            </div>
          </div>
          <ConfigNotice />
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email akun</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`input ${error ? "input-error" : ""}`} placeholder="nama@email.com" />
              {error && <p className="field-error" role="alert">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner /> : <Send size={18} />} Kirim tautan pemulihan
            </button>
          </form>
          <p className="mt-6 text-center text-sm"><Link href="/login" className="font-bold text-ice hover:underline">← Kembali ke login</Link></p>
        </>
      )}
    </div>
  );
}
