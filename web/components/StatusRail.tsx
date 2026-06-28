"use client";
import { OrangeSliceMark } from "./OrangeSliceMark";

const LINKS = [
  { label: "Observability", href: "/#observability" },
  { label: "Agents", href: "/agents" },
  { label: "How it works", href: "/#algorithm" },
  { label: "Proof", href: "/#proof" },
];

export function StatusRail() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(255,255,255,0.85)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center gap-6 px-6 py-3.5">
        {/* wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-md" style={{ background: "var(--color-yc)" }} />
            <span className="relative font-display text-[13px] font-bold text-white">Æ</span>
          </span>
          <span className="font-display text-[18px] font-semibold tracking-tight text-[var(--color-ink)]">
            Aether
          </span>
        </div>

        {/* nav links */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-[14px] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* the demo is shown inside OrangeSlice's account */}
          <span className="hidden items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 sm:flex">
            <OrangeSliceMark size={20} />
            <span className="font-sans text-[13px] font-medium text-[var(--color-ink)]">OrangeSlice</span>
            <span className="text-[var(--color-ink-3)]">▾</span>
          </span>
          <a
            href="/#demo"
            className="rounded-lg bg-[var(--color-ink)] px-4 py-2 font-sans text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            See it run
          </a>
        </div>
      </div>
    </header>
  );
}
