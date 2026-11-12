export const PRIVATE_PREFIXES = [
  "/dashboard",
  "/galaxy",
  "/missions",
  "/lab",
  "/training",
  "/playground",
  "/exam",
  "/profile",
  "/history",
  "/achievements",
];

/** Halaman yang hanya untuk tamu: jika sudah login diarahkan ke dashboard. */
export const AUTH_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Mencegah open redirect: hanya izinkan path internal. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
