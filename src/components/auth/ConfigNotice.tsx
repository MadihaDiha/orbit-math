import { FlaskConical } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";

/** Pemberitahuan jujur bila Supabase belum dihubungkan (aplikasi berjalan dalam Mode Demo). */
export function ConfigNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="mb-5 flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold" role="alert">
      <FlaskConical className="shrink-0" size={20} />
      <p>
        <b>Mode Demo aktif.</b> Fitur email & password memerlukan Supabase yang belum dihubungkan. Masuk lewat halaman <b>Masuk</b> tanpa password — progres disimpan di browser ini.
      </p>
    </div>
  );
}
