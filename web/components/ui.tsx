"use client";
import { ReactNode } from "react";

export function Panel({
  children,
  className = "",
  label,
  hint,
  live,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  hint?: string;
  live?: boolean;
}) {
  return (
    <section className={`panel relative flex flex-col ${className}`}>
      {(label || hint) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            {live && <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />}
            <span className="eyebrow">{label}</span>
          </div>
          {hint && <span className="eyebrow !tracking-normal !lowercase text-[var(--color-ink-3)]">{hint}</span>}
        </header>
      )}
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}

export function Stat({
  value,
  label,
  accent,
}: {
  value: ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="tnum font-mono text-2xl font-semibold leading-none"
        style={{ color: accent ? "var(--color-yc)" : "var(--color-ink)" }}
      >
        {value}
      </span>
      <span className="eyebrow mt-1.5">{label}</span>
    </div>
  );
}
