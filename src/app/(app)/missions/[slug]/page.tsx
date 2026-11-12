import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, Lightbulb, ListChecks, Lock, Sparkles, Target } from "lucide-react";
import { MISSIONS, getMission } from "@/content/missions";
import { getLessonProgress, missionStates } from "@/lib/data";
import { Illustration } from "@/components/circle/Illustration";
import { ObjectIcon } from "@/components/cosmic/ObjectIcon";
import { BimoSays } from "@/components/bimo/BimoSays";
import { MissionActivity } from "@/components/missions/Activities";
import { MissionFinish, OpenLessonTracker } from "@/components/missions/MissionClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = getMission((await params).slug);
  return { title: m ? `Misi ${m.id}: ${m.title}` : "Misi" };
}

function SectionTitle({ icon: Icon, children }: { icon: typeof BookOpen; children: ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 font-hud text-xl font-black">
      <Icon className="text-ice" size={22} /> {children}
    </h2>
  );
}

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mission = getMission(slug);
  if (!mission) notFound();

  const progress = await getLessonProgress();
  const states = missionStates(progress);
  const state = states[mission.id];
  const p = progress.find((x) => x.lesson_id === mission.id);
  const next = MISSIONS[mission.id] ?? null;

  if (state === "locked") {
    return (
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <Lock className="mx-auto text-soft/50" size={40} />
        <h1 className="mt-3 font-hud text-2xl font-black">{mission.planet} masih terkunci</h1>
        <p className="mt-2 text-soft/70">Selesaikan Misi {mission.id - 1} ({MISSIONS[mission.id - 2].title}) terlebih dahulu untuk membuka wilayah ini.</p>
        <Link href={`/missions/${MISSIONS[mission.id - 2].slug}`} className="btn-primary mt-6">Ke Misi {mission.id - 1}</Link>
      </div>
    );
  }

  const [c1, c2] = mission.colors;

  return (
    <article className="space-y-10">
      <OpenLessonTracker slug={mission.slug} />

      {/* 1-3. Wilayah, nomor misi, judul */}
      <header className="panel relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-60 blur-2xl" style={{ background: `radial-gradient(circle, ${c1}, transparent 70%)` }} />
        <Link href="/galaxy" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-soft/60 hover:text-ice"><ArrowLeft size={16} /> Galaxy Map</Link>
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
          <span className="grid h-28 w-28 place-items-center rounded-full font-hud text-3xl font-black text-white" style={{ background: `radial-gradient(circle at 30% 28%, #fff 0%, ${c1} 25%, ${c2} 72%, #07152F 100%)`, boxShadow: `0 0 60px -10px ${c1}` }}>
            {String(mission.id).padStart(2, "0")}
          </span>
          <div>
            <p className="eyebrow" style={{ color: c1 }}>{mission.code} · {mission.planet}</p>
            <h1 className="mt-1 font-hud text-3xl font-black sm:text-4xl">{mission.title}</h1>
            <p className="mt-2 text-soft/75">{mission.tagline}</p>
            {state === "completed" && <span className="chip mt-3 border-gold/40 bg-gold/10 text-gold"><CheckCircle2 size={14} /> Misi selesai — kamu bisa mengulang kapan saja</span>}
          </div>
        </div>
        <div className="mt-6">
          <BimoSays mood="wave" size={84}>{mission.bimoIntro}</BimoSays>
        </div>
      </header>

      {/* 4. Tujuan pembelajaran */}
      <section>
        <SectionTitle icon={Target}>Tujuan Pembelajaran</SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2">
          {mission.objectives.map((o, i) => (
            <li key={o} className="flex gap-3 rounded-2xl border border-ice/10 bg-deep/40 p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ice/20 font-hud text-xs font-black text-ice">{i + 1}</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5-6. Penjelasan konsep + ilustrasi */}
      <section>
        <SectionTitle icon={BookOpen}>Penjelasan Konsep</SectionTitle>
        <div className="space-y-5">
          {mission.sections.map((s) => (
            <div key={s.title} className={`panel grid items-center gap-6 p-5 sm:p-7 ${s.illustration ? "md:grid-cols-[1fr_280px]" : ""}`}>
              <div>
                <h3 className="font-hud text-lg font-black text-ice">{s.title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {s.body.map((b) => (
                    <li key={b} className="flex gap-2.5 leading-relaxed text-soft/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ice" />
                      {b}
                    </li>
                  ))}
                </ul>
                {s.formula && (
                  <p className="mt-4 inline-block rounded-2xl border border-gold/40 bg-gold/10 px-5 py-3 font-hud text-xl font-black text-gold glow-text">{s.formula}</p>
                )}
              </div>
              {s.illustration && (
                <div className="panel-hud grid-hud p-3">
                  <Illustration name={s.illustration} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Aktivitas interaktif */}
      <section className="panel p-5 sm:p-7">
        <SectionTitle icon={Sparkles}>{mission.activityTitle}</SectionTitle>
        <p className="-mt-2 mb-5 text-soft/70">{mission.activityIntro}</p>
        <MissionActivity kind={mission.activity} />
      </section>

      {/* 7. Istilah penting */}
      <section>
        <SectionTitle icon={ListChecks}>Istilah Penting</SectionTitle>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mission.terms.map((t) => (
            <div key={t.term} className="rounded-2xl border-l-4 border-ice bg-deep/50 p-4">
              <dt className="font-hud font-bold text-ice">{t.term}</dt>
              <dd className="mt-1 text-sm text-soft/85">{t.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 8. Kehidupan sehari-hari */}
      <section>
        <SectionTitle icon={Sparkles}>Dalam Kehidupan Sehari-hari</SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mission.realLife.map((r) => (
            <li key={r.title} className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">
              <ObjectIcon name={r.icon} size={52} />
              <span>
                <span className="block font-bold">{r.title}</span>
                <span className="text-sm text-soft/70">{r.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 9-10. Contoh soal + penyelesaian bertahap */}
      <section>
        <SectionTitle icon={BookOpen}>Contoh Soal & Penyelesaian</SectionTitle>
        <div className="grid gap-5 lg:grid-cols-2">
          {mission.examples.map((ex, i) => (
            <details key={ex.question} className="panel group p-5 open:ring-1 open:ring-ice/30" open={i === 0}>
              <summary className="cursor-pointer list-none">
                <p className="eyebrow">Contoh {i + 1}</p>
                <p className="mt-1 font-bold">{ex.question}</p>
                <p className="mt-2 text-sm font-bold text-ice group-open:hidden">Ketuk untuk melihat penyelesaian →</p>
              </summary>
              <div className="mt-4 space-y-3 text-sm">
                {ex.illustration && <div className="max-w-[200px]"><Illustration name={ex.illustration} /></div>}
                <p><span className="font-bold text-ice">Diketahui: </span>{ex.known.join("; ")}</p>
                <p><span className="font-bold text-ice">Ditanya: </span>{ex.asked}</p>
                <ol className="space-y-2">
                  {ex.steps.map((s, j) => (
                    <li key={s} className="flex gap-3 rounded-xl bg-white/5 px-3 py-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neon text-xs font-black">{j + 1}</span>
                      <span className="font-hud">{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="rounded-xl bg-gold/10 px-3 py-2 font-bold text-gold">Jawaban: {ex.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 11. Fakta menarik */}
      <section className="panel-hud flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <Lightbulb className="shrink-0 text-gold" size={36} />
        <div>
          <p className="eyebrow text-gold">Fakta menarik dari BIMO</p>
          <p className="mt-1 text-soft/90">{mission.funFact}</p>
        </div>
      </section>

      {/* 13. Rangkuman */}
      <section className="panel p-6">
        <SectionTitle icon={ListChecks}>Rangkuman</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {mission.summary.map((s) => (
            <li key={s} className="flex gap-2"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> {s}</li>
          ))}
        </ul>
      </section>

      {/* 12, 14, 15. Mini quiz + selesaikan misi + misi berikutnya */}
      <section>
        <SectionTitle icon={Target}>Mini Quiz</SectionTitle>
        <MissionFinish
          slug={mission.slug}
          lessonId={mission.id}
          quizSlug={`lesson-${mission.id}`}
          bestScore={p?.best_quiz_score ?? 0}
          completed={state === "completed"}
          stars={p?.stars ?? 0}
          nextSlug={next?.slug ?? null}
          nextTitle={next?.title ?? null}
        />
      </section>
    </article>
  );
}
