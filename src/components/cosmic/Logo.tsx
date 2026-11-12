import Link from "next/link";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <circle cx="24" cy="24" r="10" fill="#318BFF" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="#62E5F5" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="21" ry="8" fill="none" stroke="#62E5F5" strokeWidth="2.2" transform="rotate(-25 24 24)" />
      <circle cx="42" cy="15" r="3.2" fill="#FFD76A" />
      <circle cx="20" cy="20" r="3" fill="#F3F7FF" opacity="0.7" />
    </svg>
  );
}

export function Logo({ href = "/", size = 36, showTagline = false }: { href?: string; size?: number; showTagline?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="ORBIT MATH — beranda">
      <span className="transition group-hover:rotate-12">
        <LogoMark size={size} />
      </span>
      <span className="leading-none">
        <span className="font-hud block text-lg font-black tracking-[0.12em] text-soft sm:text-xl">
          ORBIT <span className="text-ice">MATH</span>
        </span>
        {showTagline && <span className="mt-1 block text-[11px] font-semibold text-soft/60">Explore the Galaxy, Master Mathematics!</span>}
      </span>
    </Link>
  );
}
