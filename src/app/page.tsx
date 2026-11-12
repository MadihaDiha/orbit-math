import Link from "next/link";
import { Calculator, FlaskConical, Gamepad2, LogIn, Rocket, Sparkles, Target, Trophy, UserPlus } from "lucide-react";
import { Logo } from "@/components/cosmic/Logo";
import { Bimo } from "@/components/bimo/Bimo";
import { BimoSays } from "@/components/bimo/BimoSays";
import { CircleDiagram } from "@/components/circle/CircleDiagram";
import { isSupabaseConfigured } from "@/lib/env";

const TOPICS = [
  { n: "01", t: "Mengenal lingkaran", c: "#62E5F5" },
  { n: "02", t: "Unsur-unsur lingkaran", c: "#318BFF" },
  { n: "03", t: "Memahami nilai π", c: "#8D7CFF" },
  { n: "04", t: "Konsep keliling", c: "#62E5F5" },
  { n: "05", t: "Rumus keliling", c: "#FFD76A" },
  { n: "06", t: "Penerapan sehari-hari", c: "#5BE3A1" },
];

const FEATURES = [
  { icon: Rocket, t: "Materi interaktif", d: "7 misi bertahap dengan diagram, contoh, dan mini quiz." },
  { icon: Calculator, t: "Simulasi matematika", d: "Geser jari-jari dan lihat keliling berubah seketika." },
  { icon: FlaskConical, t: "Circle Laboratory", d: "Anatomi lingkaran, roda berputar, dan kalkulator langkah demi langkah." },
  { icon: Gamepad2, t: "Permainan edukatif", d: "5 game dengan mekanisme berbeda di Cosmic Playground." },
  { icon: Target, t: "Tantangan matematika", d: "Training Zone 3 level, tantangan harian, dan evaluasi akhir." },
  { icon: Trophy, t: "Pencapaian siswa", d: "Kumpulkan XP, naik level, dan buka lencana galaksi." },
];

const STEPS = ["Buat akun", "Login ke aplikasi", "Jelajahi materi", "Selesaikan misi", "Kumpulkan XP & lencana", "Ikuti evaluasi akhir"];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost px-4 py-2 text-sm">Masuk</Link>
          <Link href="/register" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">Daftar</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-12">
        <div className="animate-page-in">
          <span className="chip"><Sparkles size={14} /> Explore the Galaxy, Master Mathematics!</span>
          <h1 className="mt-5 font-hud text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Jelajahi Rahasia <span className="text-gradient">Keliling Lingkaran!</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-soft/80">
            ORBIT MATH adalah observatorium matematika untuk siswa SMP kelas VIII. Bersama BIMO, kamu akan menjelajahi galaksi lingkaran lewat simulasi,
            laboratorium, permainan, dan misi seru.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-base"><LogIn size={18} /> MASUK KE ORBIT MATH</Link>
            <Link href="/register" className="btn-ghost px-6 py-3 text-base"><UserPlus size={18} /> BUAT AKUN</Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[460px]">
          <div className="absolute inset-[6%] animate-spin-slow rounded-full border border-dashed border-ice/25" />
          <div className="absolute inset-[18%] rounded-full border border-neon/20" />
          <div className="absolute inset-[24%] rounded-full bg-gradient-to-br from-royal via-neon/70 to-nebula/60 shadow-[0_0_80px_-10px_#318BFF]">
            <div className="absolute inset-[8%] opacity-80">
              <CircleDiagram highlight="diameter" label="K = π × d" />
            </div>
          </div>
          <div className="absolute inset-[6%] animate-spin-med">
            <span className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-gold shadow-[0_0_16px_#FFD76A]" />
          </div>
          <div className="absolute -bottom-4 -left-2 sm:left-0">
            <Bimo mood="wave" size={170} float />
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">Tentang ORBIT MATH</p>
            <h2 className="mt-2 font-hud text-3xl font-black">Bukan website belajar biasa.</h2>
          </div>
          <div className="space-y-3 text-soft/85">
            <p>ORBIT MATH adalah media pembelajaran interaktif untuk memahami <b className="text-ice">keliling lingkaran</b> secara bertahap — dari mengenal bentuk lingkaran sampai menyelesaikan soal cerita.</p>
            <p>Setiap wilayah galaksi berisi satu materi. Selesaikan misinya untuk membuka wilayah berikutnya, kumpulkan XP, dan raih gelar Cosmic Legend!</p>
          </div>
        </div>
      </section>

      {/* MATERI */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="eyebrow text-center">Apa yang akan dipelajari?</p>
        <h2 className="mt-2 text-center font-hud text-3xl font-black">Enam wilayah, satu tujuan</h2>
        <div className="relative mt-10">
          <div className="absolute left-[8%] right-[8%] top-10 hidden h-px bg-gradient-to-r from-ice/0 via-ice/40 to-ice/0 lg:block" />
          <ol className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {TOPICS.map((t, i) => (
              <li key={t.n} className="flex flex-col items-center text-center" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="relative grid h-20 w-20 place-items-center rounded-full font-hud text-xl font-black text-navy" style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${t.c} 45%, #102B59 100%)`, boxShadow: `0 0 30px -6px ${t.c}` }}>
                  {t.n}
                </span>
                <span className="mt-3 text-sm font-bold">{t.t}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FITUR */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Fitur unggulan</p>
            <h2 className="mt-2 font-hud text-3xl font-black">Perlengkapan penjelajah</h2>
            <div className="mt-6 hidden lg:block">
              <BimoSays mood="happy" size={90}>Semua alat ini siap kamu pakai setelah login. Aku sudah tidak sabar!</BimoSays>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-4 rounded-3xl border border-ice/10 bg-deep/40 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-neon/20 text-ice"><Icon size={24} /></span>
                <span>
                  <span className="block font-bold">{t}</span>
                  <span className="text-sm text-soft/70">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CARA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel-hud p-6 sm:p-10">
          <p className="eyebrow">Cara menggunakan</p>
          <h2 className="mt-2 font-hud text-3xl font-black">Rute peluncuran</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ice font-hud text-lg font-black text-ice">{i + 1}</span>
                <span className="font-bold">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/register" className="btn-gold"><Rocket size={18} /> Mulai petualangan</Link>
            <Link href="/login" className="btn-ghost">Saya sudah punya akun</Link>
          </div>
        </div>
      </section>

      {!isSupabaseConfigured() && (
        <section id="mode-demo" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-6">
          <div className="flex gap-4 rounded-3xl border border-gold/30 bg-gold/10 p-5 text-sm text-gold">
            <FlaskConical className="shrink-0" size={22} />
            <div>
              <p className="font-bold">Situs ini berjalan dalam Mode Demo</p>
              <p className="mt-1 text-gold/85">
                Server akun (Supabase) belum dihubungkan, jadi kamu bisa langsung mencoba semua fitur tanpa email & password. Akun, XP, lencana, dan progres disimpan di
                browser perangkat ini (bukan di server) dan tetap ada setelah keluar. Setelah Supabase dihubungkan, aplikasi otomatis memakai login asli dan database.
              </p>
            </div>
          </div>
        </section>
      )}

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-soft/50">
        ORBIT MATH · Media pembelajaran Keliling Lingkaran SMP Kelas VIII
      </footer>
    </div>
  );
}
