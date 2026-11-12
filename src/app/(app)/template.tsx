import type { ReactNode } from "react";

/** Efek transisi setiap berpindah halaman. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
