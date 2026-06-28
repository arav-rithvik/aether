"use client";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="grid-floor pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-[900px] flex-col items-center px-6 pt-20 pb-10 text-center">
        {/* category badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-2)] bg-white px-3.5 py-1.5 font-sans text-[13px] text-[var(--color-ink-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
          Agent Awareness Optimization — the layer after SEO &amp; GEO
        </span>

        {/* headline */}
        <h1 className="mt-7 max-w-[820px] font-display text-[64px] font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--color-ink)] md:text-[76px]">
          Make AI agents{" "}
          <span className="text-[var(--color-yc)]">pick you.</span>
        </h1>

        {/* subtitle */}
        <p className="mt-6 max-w-[560px] font-sans text-[18px] leading-relaxed text-[var(--color-ink-2)]">
          Aether measures how often AI agents discover and <em>use</em> your product to finish a job —
          then rewrites your agent-facing footprint until they choose you over the alternatives.
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

        {/* the ambient task — the command box (illustrative) */}
        <div className="mt-12 w-full max-w-[680px] rounded-xl border border-[var(--color-line-2)] bg-white p-4 text-left shadow-[0_1px_0_rgba(20,17,13,0.02)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--color-yc)]">✦</span>
            <p className="flex-1 font-sans text-[15px] text-[var(--color-ink)]">
              find me 20 high-intent buyers and start outreach
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
              ↵ the agent picks the tool — it never names a vendor
            </span>
            <a
              href="#demo"
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-yc)] text-white transition-opacity hover:opacity-90"
            >
              ↑
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
