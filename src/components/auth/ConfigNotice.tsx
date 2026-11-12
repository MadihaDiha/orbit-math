import { TriangleAlert } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";

/** Peringatan jujur bila kredensial Supabase belum diisi (tidak ada login palsu). */
export function ConfigNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="mb-5 flex gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold" role="alert">
      <TriangleAlert className="shrink-0" size={20} />
      <p>
        <b>Supabase belum dikonfigurasi.</b> Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi URL & anon key proyek Supabase, lalu jalankan ulang <code>npm run dev</code>. Lihat README bagian &ldquo;Konfigurasi Supabase&rdquo;.
      </p>
    </div>
  );
}
