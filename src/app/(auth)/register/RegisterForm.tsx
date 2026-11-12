"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { MailCheck, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { passwordStrength, validateRegister, validateUsername, type FieldErrors, type RegisterInput } from "@/lib/validation";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Spinner } from "@/components/ui/Spinner";
import { BimoSays } from "@/components/bimo/BimoSays";

const EMPTY: RegisterInput = { fullName: "", username: "", email: "", className: "", password: "", confirmPassword: "" };
const CLASSES = ["VIII A", "VIII B", "VIII C", "VIII D", "VIII E", "VIII F", "VIII G", "VIII H"];

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<RegisterInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (k: keyof RegisterInput) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = k === "username" ? e.target.value.toLowerCase().replace(/\s/g, "") : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const checkUsername = async (): Promise<boolean> => {
    if (validateUsername(form.username)) return false;
    setCheckingUser(true);
    try {
      const ok = await rpc.usernameAvailable(form.username.trim());
      if (!ok) setErrors((er) => ({ ...er, username: "Username sudah dipakai penjelajah lain. Coba yang lain, ya!" }));
      return ok;
    } catch {
      return true; // jika gagal dicek, server tetap menolak duplikat (unique index)
    } finally {
      setCheckingUser(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      if (!(await checkUsername())) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim(), username: form.username.trim(), class_name: form.className.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) throw error;
      // Supabase mengembalikan identities kosong bila email sudah terdaftar.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("User already registered");
      }
      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setSentTo(form.email.trim());
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="panel mx-auto max-w-md space-y-5 p-6 text-center sm:p-8">
        <MailCheck className="mx-auto text-ice" size={48} />
        <h1 className="font-hud text-2xl font-black">Akun berhasil dibuat!</h1>
        <p className="text-soft/80">Kami mengirim tautan verifikasi ke <b className="text-ice">{sentTo}</b>. Buka email itu dan klik tautannya untuk mengaktifkan akun.</p>
        <BimoSays mood="proud" size={64}>Hebat! Kartu identitas penjelajahmu hampir siap. Setelah verifikasi, langsung login, ya!</BimoSays>
        <Link href="/login" className="btn-primary w-full">Ke halaman login</Link>
      </div>
    );
  }

  const strength = passwordStrength(form.password);

  return (
    <div className="panel mx-auto max-w-xl p-6 sm:p-8">
      <h1 className="font-hud text-2xl font-black">Daftar Penjelajah Baru</h1>
      <p className="mb-6 text-sm text-soft/70">Isi kartu identitasmu untuk mulai menjelajah galaksi lingkaran.</p>
      <ConfigNotice />
      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field id="fullName" label="Nama lengkap" error={errors.fullName} className="sm:col-span-2">
          <input id="fullName" autoComplete="name" value={form.fullName} onChange={set("fullName")} className={`input ${errors.fullName ? "input-error" : ""}`} placeholder="contoh: Rani Putri" />
        </Field>
        <Field id="username" label="Username" error={errors.username} hint={checkingUser ? "Memeriksa ketersediaan..." : "huruf kecil, angka, _ (3–20 karakter)"}>
          <input id="username" autoComplete="username" value={form.username} onChange={set("username")} onBlur={() => form.username && checkUsername()} className={`input ${errors.username ? "input-error" : ""}`} placeholder="rani_08" />
        </Field>
        <Field id="className" label="Kelas" error={errors.className}>
          <input id="className" list="class-list" value={form.className} onChange={set("className")} className={`input ${errors.className ? "input-error" : ""}`} placeholder="VIII A" />
          <datalist id="class-list">{CLASSES.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field id="email" label="Email" error={errors.email} className="sm:col-span-2">
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className={`input ${errors.email ? "input-error" : ""}`} placeholder="nama@email.com" />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={set("password")} invalid={Boolean(errors.password)} placeholder="min. 8, huruf + angka" />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i < strength.score ? (strength.score >= 3 ? "bg-emerald-300" : "bg-gold") : "bg-white/10"}`} />
                ))}
              </div>
              <span className="text-xs text-soft/60">{strength.label}</span>
            </div>
          )}
        </Field>
        <Field id="confirmPassword" label="Konfirmasi password" error={errors.confirmPassword}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={set("confirmPassword")} invalid={Boolean(errors.confirmPassword)} placeholder="ulangi password" />
        </Field>
        {formError && <p className="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-200 sm:col-span-2" role="alert">{formError}</p>}
        <button type="submit" disabled={loading} className="btn-primary py-3 sm:col-span-2">
          {loading ? <Spinner /> : <UserPlus size={18} />} {loading ? "Mendaftarkan penjelajah..." : "Buat akun"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-soft/70">
        Sudah punya akun? <Link href="/login" className="font-bold text-ice hover:underline">Masuk di sini</Link>
      </p>
    </div>
  );
}

function Field({ id, label, error, hint, className = "", children }: { id: string; label: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="mt-1 text-xs text-soft/50">{hint}</p> : null}
    </div>
  );
}
