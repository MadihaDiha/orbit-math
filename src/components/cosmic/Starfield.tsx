/** Latar bintang dengan efek kedalaman (3 lapis). Deterministik agar aman untuk SSR. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STARS = Array.from({ length: 110 }, (_, i) => ({
  x: rand() * 100,
  y: rand() * 100,
  r: rand() < 0.85 ? 0.6 + rand() * 0.8 : 1.6 + rand(),
  delay: rand() * 4,
  layer: i % 3,
}));

export function Starfield() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.layer === 2 ? "#62E5F5" : s.layer === 1 ? "#F3F7FF" : "#8D7CFF"}
            opacity={s.layer === 0 ? 0.5 : 0.85}
            className="animate-twinkle"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}
      </svg>
      {/* Planet & orbit dekoratif yang bergerak lembut */}
      <div className="absolute -right-24 top-24 h-64 w-64 animate-spin-slow rounded-full border border-ice/10">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-gold shadow-[0_0_14px_#FFD76A]" />
      </div>
      <div className="absolute -left-40 bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-royal/30 to-nebula/10 blur-3xl" />
      <div className="absolute right-[8%] top-[60%] h-20 w-20 animate-float rounded-full bg-gradient-to-br from-nebula/50 to-royal/20 opacity-40 blur-[1px]" />
    </div>
  );
}
