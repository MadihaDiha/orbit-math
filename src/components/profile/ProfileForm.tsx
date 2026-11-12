"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { demoUpdateProfile } from "@/lib/demo/backend";
import { rpc } from "@/lib/rpc";
import { friendlyError } from "@/lib/errors";
import { validateClassName, validateFullName, validateUsername } from "@/lib/validation";
import type { AvatarColor, Profile } from "@/lib/types";
import { AVATAR_COLORS, Bimo } from "@/components/bimo/Bimo";
import { Spinner } from "@/components/ui/Spinner";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(profile.username);
  const [className, setClassName] = useState(profile.class_name);
  const [avatar, setAvatar] = useState<AvatarColor>(profile.avatar_color);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const v = { fullName: validateFullName(fullName), username: validateUsername(username), className: validateClassName(className) };
    setErrors(v);
    if (v.fullName || v.username || v.className) return;
    setBusy(true);
    try {
      const u = username.trim();
      if (u !== profile.username && !(await rpc.usernameAvailable(u))) {
        setErrors({ username: "Username sudah dipakai penjelajah lain." });
        return;
      }
      if (isSupabaseConfigured()) {
        const { error } = await createClient()
          .from("profiles")
          .update({ full_name: fullName.trim(), username: u, class_name: className.trim(), avatar_color: avatar, updated_at: new Date().toISOString() })
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        demoUpdateProfile({ full_name: fullName.trim(), username: u, class_name: className.trim(), avatar_color: avatar });
      }
      setMsg({ ok: true, text: "Profil berhasil disimpan!" });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="panel space-y-5 p-6">
      <h2 className="font-hud text-lg font-black">Ubah profil</h2>
      <fieldset>
        <legend className="label">Warna kostum BIMO (avatar)</legend>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(AVATAR_COLORS) as AvatarColor[]).map((c) => (
            <button key={c} type="button" onClick={() => setAvatar(c)} aria-pressed={avatar === c} title={AVATAR_COLORS[c].label} className={`rounded-2xl border p-1 transition ${avatar === c ? "border-ice ring-2 ring-ice/50" : "border-white/10 hover:border-ice/40"}`}>
              <Bimo mood="happy" size={44} color={c} title={AVATAR_COLORS[c].label} />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="pf-name" className="label">Nama lengkap</label>
          <input id="pf-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`input ${errors.fullName ? "input-error" : ""}`} />
          {errors.fullName && <p className="field-error">{errors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="pf-username" className="label">Username</label>
          <input id="pf-username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} className={`input ${errors.username ? "input-error" : ""}`} />
          {errors.username && <p className="field-error">{errors.username}</p>}
        </div>
        <div>
          <label htmlFor="pf-class" className="label">Kelas</label>
          <input id="pf-class" value={className} onChange={(e) => setClassName(e.target.value)} className={`input ${errors.className ? "input-error" : ""}`} />
          {errors.className && <p className="field-error">{errors.className}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="pf-email" className="label">Email (tidak dapat diubah di sini)</label>
          <input id="pf-email" value={profile.email} disabled className="input opacity-60" />
        </div>
      </div>
      {msg && <p className={`rounded-2xl px-4 py-2.5 text-sm font-bold ${msg.ok ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-500/15 text-rose-200"}`} role="status">{msg.text}</p>}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? <Spinner /> : <Save size={16} />} Simpan perubahan</button>
    </form>
  );
}
