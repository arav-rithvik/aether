"use client";
import { ConvexClientProvider } from "@/lib/ConvexClientProvider";
import { AetherProvider } from "@/lib/AetherProvider";
import { StatusRail } from "@/components/StatusRail";
import { LandingHero } from "@/components/LandingHero";
import { DemoConsole } from "@/components/DemoConsole";
import { Observability } from "@/components/Observability";
import { Pipeline } from "@/components/Pipeline";
import { AAOSummary } from "@/components/AAOSummary";
import { MathPanel } from "@/components/MathPanel";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { ClimbChart } from "@/components/ClimbChart";
import { Panel } from "@/components/ui";

export default function Page() {
  return (
    <ConvexClientProvider>
    <AetherProvider>
      {/* announcement bar */}
      <div className="w-full border-b border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-2 px-6 py-1.5 text-center font-sans text-[12.5px] text-[var(--color-ink-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
          <span className="font-semibold text-[var(--color-ink)]">GEO for agentic coding</span>
          <span className="text-[var(--color-ink-3)]">·</span>
          see what AI agents reach for, then make them reach for you
          <span className="text-[var(--color-yc-deep)]">→</span>
        </div>
      </div>

      <StatusRail />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-6 pb-24">
        <LandingHero />

        {/* THE DEMO — command + table */}
        <section id="demo" className="scroll-mt-20">
          <DemoConsole />
        </section>

        {/* OBSERVABILITY (gauge lives inside) */}
        <section id="observability" className="mt-10 scroll-mt-20">
          <Panel label="Observability" hint="what AI agents reach for, measured" live>
            <Observability />
          </Panel>
        </section>

        {/* THE ALGORITHM */}
        <section id="algorithm" className="mt-10 scroll-mt-20">
          <Panel label="The algorithm" hint="the closed loop, end to end" live>
            <Pipeline />
          </Panel>
        </section>

        {/* THE MATH */}
        <section className="mt-10">
          <Panel label="The math" hint="every % traced to raw counts">
            <MathPanel />
          </Panel>
        </section>

        {/* WHY REJECTED */}
        <section className="mt-10">
          <Panel label="Why agents reject you" hint="tagged from real reasoning, click to dig in" live>
            <DiagnosisPanel />
          </Panel>
        </section>

        {/* PROOF: CLIMB */}
        <section id="proof" className="mt-10 scroll-mt-20">
          <Panel label="Proof" hint="usage over versions as the footprint is rewritten">
            <ClimbChart />
          </Panel>
        </section>

        {/* 2AO SUMMARY — the big autonomous recap, at the very bottom */}
        <section id="summary" className="mt-12 scroll-mt-20">
          <AAOSummary />
        </section>
      </main>
    </AetherProvider>
    </ConvexClientProvider>
  );
}
