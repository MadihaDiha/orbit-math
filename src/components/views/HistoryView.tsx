import type { ActivityLog } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { HistoryTable } from "@/components/history/HistoryTable";

export function HistoryView({ rows }: { rows: ActivityLog[] }) {
  return (
    <div>
      <PageHeader eyebrow="Log Penerbangan" title="Riwayat Belajar" description="Catatan semua aktivitasmu: materi, latihan, permainan, evaluasi, dan lencana. Hanya kamu yang bisa melihatnya." />
      <HistoryTable rows={rows} />
    </div>
  );
}
