import Link from "next/link";
import { Lock } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { ExamData } from "@/lib/view-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExamRunner } from "@/components/quiz/ExamRunner";

export function ExamView({ data }: { data: ExamData }) {
  const { unlocked, attempts } = data;

  return (
    <div>
      <PageHeader eyebrow="Mission 07 · Final Cosmic Mission" title="Final Examination" description="Evaluasi akhir mencakup seluruh materi keliling lingkaran." />
      {!unlocked ? (
        <div className="panel mx-auto max-w-xl p-8 text-center">
          <Lock className="mx-auto text-soft/50" size={40} />
          <h2 className="mt-3 font-hud text-xl font-black">Gerbang evaluasi masih terkunci</h2>
          <p className="mt-2 text-soft/70">Selesaikan Misi 1 sampai 6 untuk membuka Final Examination.</p>
          <Link href="/galaxy" className="btn-primary mt-6">Ke Galaxy Map</Link>
        </div>
      ) : (
        <div className="space-y-10">
          <ExamRunner />
          <section>
            <h2 className="mb-3 font-hud text-lg font-black">Riwayat evaluasi</h2>
            {attempts.length === 0 ? (
              <p className="text-sm text-soft/60">Belum ada hasil evaluasi.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-ice/10">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="bg-royal/25 font-hud text-xs text-ice">
                    <tr><th className="px-4 py-2">Tanggal</th><th className="px-4 py-2">Nilai</th><th className="px-4 py-2">Benar</th><th className="px-4 py-2">Durasi</th><th className="px-4 py-2">Status</th></tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a.id} className="border-t border-white/5">
                        <td className="px-4 py-2">{formatDateTime(a.created_at)}</td>
                        <td className="px-4 py-2 font-hud font-black">{a.score}</td>
                        <td className="px-4 py-2">{a.correct_count}/{a.total}</td>
                        <td className="px-4 py-2">{a.duration_seconds ? `${Math.floor(a.duration_seconds / 60)}m ${a.duration_seconds % 60}d` : "-"}</td>
                        <td className={`px-4 py-2 font-bold ${a.passed ? "text-emerald-300" : "text-rose-300"}`}>{a.passed ? "Lulus" : "Belum lulus"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
