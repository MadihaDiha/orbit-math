import Link from "next/link";
import { Bimo } from "@/components/bimo/Bimo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <Bimo mood="oops" size={150} float />
      <p className="font-hud text-6xl font-black text-ice">404</p>
      <h1 className="font-hud text-2xl font-black">Wilayah tidak ditemukan</h1>
      <p className="text-soft/70">Sepertinya kamu tersesat di luar peta galaksi. Ayo kembali ke jalur orbit!</p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-primary">Ke dashboard</Link>
        <Link href="/" className="btn-ghost">Beranda</Link>
      </div>
    </div>
  );
}
