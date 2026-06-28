"use client";
import { useEffect, useState } from "react";
import { PROMPT_FEED } from "@/lib/mockData";

function TaskTyper() {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "deleting">("typing");

  const sp = PROMPT_FEED[i % PROMPT_FEED.length];
  const full = sp.task;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (txt.length < full.length) {
        t = setTimeout(() => setTxt(full.slice(0, txt.length + 1)), 42);
      } else {
        t = setTimeout(() => setPhase("hold"), 50);
      }
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("deleting"), 1700);
    } else {
      if (txt.length > 0) {
        t = setTimeout(() => setTxt(full.slice(0, txt.length - 1)), 22);
      } else {
        t = setTimeout(() => {
          setI((v) => v + 1);
          setPhase("typing");
        }, 180);
      }
    }
    return () => clearTimeout(t);
  }, [txt, phase, full]);

  const held = phase === "hold";

  return (
    <div className="w-full rounded-xl border border-[var(--color-line-2)] bg-white p-4 text-left">
      <div className="flex min-h-[24px] items-start gap-3">
        <span className="mt-0.5 text-[var(--color-yc)]">✦</span>
        <p className="flex-1 font-sans text-[15px] text-[var(--color-ink)]">
          {txt}
          <span className="ml-0.5 inline-block h-[15px] w-[2px] translate-y-[2px] animate-pulse bg-[var(--color-yc)]" />
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="truncate font-mono text-[11px] text-[var(--color-ink-3)]">
          {held ? (
            <>
              <span className="text-[var(--color-yc-deep)]">↳ routed to {sp.sponsor}</span>, 10x better
              than the agent doing it itself
            </>
          ) : (
            "the agent picks the tool. it never names a vendor"
          )}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-yc)] text-white">
          ↑
        </span>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="grid-floor pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-[900px] flex-col items-center px-6 pt-24 pb-10 text-center">
        {/* category */}
        <span className="font-display text-[18px] font-bold tracking-tight text-[var(--color-ink-2)] md:text-[20px]">
          GEO for agentic coding
        </span>

        {/* headline */}
        <h1 className="mt-5 max-w-[820px] font-display text-[64px] font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)] md:text-[76px]">
          Make AI agents <span className="text-[var(--color-yc)]">reach for you.</span>
        </h1>

        {/* subtitle */}
        <p className="mt-6 max-w-[580px] font-sans text-[18px] leading-relaxed text-[var(--color-ink-2)]">
          We run real coding agents in a sandbox, observe which tools they reach for to finish a job,
          and rewrite your agent-facing footprint until they reach for you.
        </p>

        {/* buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#algorithm"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line-2)] bg-white px-4 py-2.5 font-sans text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-2)]"
          >
            How it works
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-ink)] px-4 py-2.5 font-sans text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            See it run <span aria-hidden>→</span>
          </a>
        </div>

        {/* the ambient task, cycling per sponsor */}
        <div className="mt-12 w-full max-w-[680px]">
          <TaskTyper />
        </div>
      </div>
    </section>
  );
}
