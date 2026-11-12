"use client";

import { useMemo, useState } from "react";
import type { ActivityLog, ActivityType } from "@/lib/types";
import { ACTIVITY_LABELS, formatDateTime } from "@/lib/format";

const FILTERS: (ActivityType | "all")[] = ["all", "lesson", "training", "game", "exam", "daily", "achievement"];

export function HistoryTable({ rows }: { rows: ActivityLog[] }) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const shown = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.activity_type === filter)), [rows, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter jenis aktivitas">
        {FILTERS.map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${filter === f ? "bg-ice text-navy" : "border border-ice/25 text-soft/80 hover:border-ice/60"}`}>
            {f === "all" ? "Semua" : ACTIVITY_LABELS[f]}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="panel p-6 text-center text-soft/60">Belum ada aktivitas untuk kategori ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ice/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-royal/25 font-hud text-xs text-ice">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Materi / Permainan / Kegiatan</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 text-soft/70">{formatDateTime(r.created_at)}</td>
                  <td className="px-4 py-3"><span className="chip">{ACTIVITY_LABELS[r.activity_type]}</span></td>
                  <td className="px-4 py-3 font-semibold">{r.title}</td>
                  <td className="px-4 py-3 font-hud font-bold">{r.score ?? "-"}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3 text-right font-bold text-gold">{r.xp_earned > 0 ? `+${r.xp_earned}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
