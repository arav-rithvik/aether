"use client";
import { ConvexClientProvider } from "@/lib/ConvexClientProvider";
import { AetherProvider } from "@/lib/AetherProvider";
import { StatusRail } from "@/components/StatusRail";
import { LandingHero } from "@/components/LandingHero";
import { DemoConsole } from "@/components/DemoConsole";
import { Observability } from "@/components/Observability";
import { AgentsPanel } from "@/components/AgentsPanel";
import { UsageGauge } from "@/components/UsageGauge";
import { Pipeline } from "@/components/Pipeline";
import { ToolRecommendation } from "@/components/ToolRecommendation";
import { MathPanel } from "@/components/MathPanel";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { ChangeLog } from "@/components/ChangeLog";
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

        {/* THE RESULT — gauge */}
        <section className="mt-10 grid items-center gap-6 rounded-2xl border border-[var(--color-line)] bg-white p-8 lg:grid-cols-[360px_1fr]">
          <UsageGauge />
          <div>
            <h2 className="font-display text-[26px] font-semibold tracking-tight text-[var(--color-ink)]">
              One number that moves real agent behavior.
            </h2>
            <p className="mt-3 max-w-[520px] font-sans text-[15px] leading-relaxed text-[var(--color-ink-2)]">
              Usage rate is the share of agent runs that pick <em>and</em> call OrangeSlice for the
              job. It is measured on held-out phrasings with OpenAI agents, a competitor held flat as
              a control. Hit <span className="font-medium text-[var(--color-ink)]">Run test</span>{" "}
              and watch it climb as the footprint is rewritten.
            </p>
          </div>
        </section>

        {/* OBSERVABILITY */}
        <section id="observability" className="mt-10 scroll-mt-20">
          <Panel label="Observability" hint="what AI agents reach for, measured" live>
            <Observability />
          </Panel>
        </section>

        {/* AGENTS — connect your keys */}
        <section id="agents" className="mt-10 scroll-mt-20">
          <Panel label="Agents" hint="connect a model to run the wind tunnel with your own key">
            <AgentsPanel />
          </Panel>
        </section>

        {/* THE ALGORITHM */}
        <section id="algorithm" className="mt-10 scroll-mt-20">
          <Panel label="The algorithm" hint="the closed loop, end to end" live>
            <Pipeline />
          </Panel>
        </section>

        {/* THE RECOMMENDATION */}
        <section id="recommendation" className="mt-10 scroll-mt-20">
          <Panel label="The recommendation" hint="what the engine changes on your door">
            <ToolRecommendation />
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

        {/* HISTORY */}
        <section className="mt-10">
          <Panel label="Change-log" hint="every rewrite of your door, with the reason">
            <ChangeLog />
          </Panel>
        </section>

        {/* HONEST FOOTER */}
        <footer className="mt-8 rounded-xl border border-dashed border-[var(--color-line-2)] bg-[var(--color-panel)] px-6 py-4">
          <p className="font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">
            <span className="font-semibold text-[var(--color-ink)]">Calibrated honesty:</span>{" "}
            We control the retrieval surface so it&apos;s reproducible on camera. In production this
            is the live web and your own footprint, which you delegate to us. We show the mechanism.
            We never touch your live site, and every number here is computed from runs, never hand-set.
          </p>
          <p className="mt-2 font-mono text-[10.5px] text-[var(--color-ink-3)]">
            ◷ frontend running on a simulated wind tunnel · swaps to live Convex with no component
            changes (schema §8).
          </p>
        </footer>
      </main>
    </AetherProvider>
    </ConvexClientProvider>
  );
}
