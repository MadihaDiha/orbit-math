import type { Metadata } from "next";
import { getSession } from "@/lib/data";
import type { ActivityLog } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { HistoryTable } from "@/components/history/HistoryTable";

export const metadata: Metadata = { title: "Riwayat Belajar" };

export default async function HistoryPage() {
  const { supabase, user } = await getSession();
  const { data } = await supabase
    .from("activity_logs")
    .select("id, activity_type, title, status, score, xp_earned, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div>
      <PageHeader eyebrow="Log Penerbangan" title="Riwayat Belajar" description="Catatan semua aktivitasmu: materi, latihan, permainan, evaluasi, dan lencana. Hanya kamu yang bisa melihatnya." />
      <HistoryTable rows={(data ?? []) as ActivityLog[]} />
    </div>
  );
}
