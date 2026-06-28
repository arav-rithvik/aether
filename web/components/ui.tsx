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
    <section className={`relative flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 ${className}`}>
      {(label || hint) && (
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
              {label}
            </h2>
            {hint && (
              <p className="mt-0.5 font-sans text-[12.5px] text-[var(--color-ink-3)]">{hint}</p>
            )}
          </div>
          {live && (
            <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-3)]">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
              live
            </span>
          )}
        </header>
      )}
      <div className="flex-1">{children}</div>
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
