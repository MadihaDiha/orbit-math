import Link from "next/link";
import { CheckCircle2, Lock, Map as MapIcon, Rocket, Trophy } from "lucide-react";
import type { JourneyData } from "@/lib/view-types";
import { missionStates } from "@/lib/progress";
import { formatDateTime } from "@/lib/format";
import { PLANETS } from "@/content/planets";
import { PrePostTest, PretestGate } from "@/components/quiz/PrePostTest";
import { BimoSays } from "@/components/bimo/BimoSays";
import { LaunchPadArt, PortalArt } from "@/components/cosmic/PlanetDialog";
import { PlanetArt, type PlanetVariant } from "@/components/cosmic/PlanetArt";

export function PretestView({ data }: { data: JourneyData }) {
  const pre = data.journey.pretest;
  const doneView = pre ? (
    <div className="panel mx-auto max-w-2xl p-6 text-center sm:p-10">
      <div className="mx-auto w-36">
        <LaunchPadArt size="100%" />
      </div>
      <p className="eyebrow mt-2">Pre-test</p>
      <h1 className="font-hud text-3xl font-black">Pre-test sudah selesai</h1>
      <p className="mt-2 text-soft/75">
        Nilai awalmu: <b className="font-hud text-2xl text-gold">{pre.score}</b> ({pre.correct_count}/{pre.total} benar) · {formatDateTime(pre.created_at)}
      </p>
      <p className="mt-2 text-sm text-soft/60">Pre-test hanya dikerjakan sekali agar bisa dibandingkan dengan post-test di akhir petualangan.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/galaxy" className="btn-gold btn-glow px-6 py-3"><MapIcon size={18} /> Buka Peta Galaksi</Link>
        <Link href="/dashboard" className="btn-ghost px-6 py-3">Control Center</Link>
      </div>
    </div>
  ) : null;
  return (
    <div>
      {!pre && (
        <>
          <p className="eyebrow mb-1">Misi pertama</p>
          <h1 className="mb-6 font-hud text-3xl font-black sm:text-4xl">Pre-test · Cek Pengetahuan Awal</h1>
        </>
      )}
      <PretestGate alreadyDone={Boolean(pre)} doneView={doneView} />
    </div>
  );
}

export function PosttestView({ data }: { data: JourneyData }) {
  const states = missionStates(data.progress, data.journey);
  const unlocked = states[7] === "completed";
  if (!unlocked) {
    const done = Object.values(states).filter((s) => s === "completed").length;
    return (
      <div className="panel mx-auto max-w-2xl p-6 text-center sm:p-10">
        <div className="mx-auto w-36">
          <PortalArt size="100%" dim />
        </div>
        <h1 className="mt-2 font-hud text-2xl font-black"><Lock className="mr-1 inline" size={22} /> Portal Pulang masih terkunci</h1>
        <p className="mt-2 text-soft/75">Selesaikan keenam planet dan Stasiun Final terlebih dahulu. Progres: <b className="text-ice">{done}/7</b> wilayah.</p>
        <Link href="/galaxy" className="btn-primary mt-6"><MapIcon size={18} /> Lanjutkan perjalanan</Link>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-1">Misi terakhir</p>
      <h1 className="mb-2 font-hud text-3xl font-black sm:text-4xl">Post-test · Misi Pulang ke Bumi</h1>
      {data.journey.posttest && (
        <p className="mb-6 text-sm text-soft/70">
          Post-test terakhir: nilai <b className="text-gold">{data.journey.posttest.score}</b>. Kamu boleh mengulang untuk memperbaiki nilai.{" "}
          <Link href="/results" className="font-bold text-ice underline">Lihat hasil akhir</Link>
        </p>
      )}
      <PrePostTest kind="posttest" pretest={data.journey.pretest} />
    </div>
  );
}

export function PlanetsConquered({ progress }: { progress: JourneyData["progress"] }) {
  const done = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lesson_id));
  const stars = new Map(progress.map((p) => [p.lesson_id, p.stars]));
  return (
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-7">
      {PLANETS.map((p) => (
        <li key={p.id} className="flex flex-col items-center text-center">
          <PlanetBadge variant={p.variant} done={done.has(p.id)} />
          <span className={`mt-1 text-[11px] font-bold leading-tight ${done.has(p.id) ? "" : "text-soft/40"}`}>{p.name.replace("Planet ", "")}</span>
          <span className="text-[11px] text-gold">{"★".repeat(stars.get(p.id) ?? 0)}<span className="text-soft/25">{"★".repeat(3 - (stars.get(p.id) ?? 0))}</span></span>
        </li>
      ))}
    </ul>
  );
}


function PlanetBadge({ variant, done }: { variant: PlanetVariant; done: boolean }) {
  return (
    <span className="relative block w-16 sm:w-20">
      <PlanetArt variant={variant} size="100%" dim={!done} />
      {done && <CheckCircle2 className="absolute -right-1 -top-1 rounded-full bg-navy text-gold" size={20} />}
    </span>
  );
}

export function NotFinishedNotice() {
  return (
    <div className="mb-6">
      <BimoSays mood="thinking" size={80}>
        Petualanganmu belum selesai, tapi ini rangkuman sementaranya. Selesaikan semua planet lalu kerjakan Post-test untuk melihat perkembanganmu!
      </BimoSays>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/galaxy" className="btn-primary"><Rocket size={18} /> Lanjutkan perjalanan</Link>
        <Link href="/posttest" className="btn-ghost"><Trophy size={18} /> Post-test</Link>
      </div>
    </div>
  );
}
