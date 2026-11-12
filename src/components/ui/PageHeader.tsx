import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1 font-hud text-3xl font-black sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-soft/75">{description}</p>}
      </div>
      {children}
    </div>
  );
}
