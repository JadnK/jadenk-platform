import type { ReactNode } from "react";

interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-zinc-50">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        ) : null}
      </div>

      <div>{children}</div>
    </section>
  );
}