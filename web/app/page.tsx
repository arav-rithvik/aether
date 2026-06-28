"use client";
import { ConvexClientProvider } from "@/lib/ConvexClientProvider";
import { AetherProvider } from "@/lib/AetherProvider";
import { StatusRail } from "@/components/StatusRail";
import { LandingHero } from "@/components/LandingHero";
import { DemoConsole } from "@/components/DemoConsole";
import { UsageGauge } from "@/components/UsageGauge";
import { Pipeline } from "@/components/Pipeline";
import { ToolRecommendation } from "@/components/ToolRecommendation";
import { MathPanel } from "@/components/MathPanel";
import { EngineStats } from "@/components/EngineStats";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { Artifacts } from "@/components/Artifacts";
import { ChangeLog } from "@/components/ChangeLog";
import { ClimbChart } from "@/components/ClimbChart";
import { Funnel } from "@/components/Funnel";
import { Panel } from "@/components/ui";

export default function Page() {
  return (
    <ConvexClientProvider>
    <AetherProvider>
      {/* announcement bar */}
      <div className="w-full border-b border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-2 px-6 py-1.5 text-center font-sans text-[12.5px] text-[var(--color-ink-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
          On the tracked job, agents now pick OrangeSlice{" "}
          <span className="font-semibold text-[var(--color-ink)]">71%</span> of the time, up from 8%
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
              job. It is measured on held-out phrasings, on two models, with a competitor held flat
              as a control. Hit <span className="font-medium text-[var(--color-ink)]">Run test</span>{" "}
              and watch it climb as the footprint is rewritten.
            </p>
          </div>
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

        {/* MATH + ENGINE STATS */}
        <section className="mt-10 flex flex-col gap-6">
          <Panel label="The math" hint="every % traced to raw counts">
            <MathPanel />
          </Panel>
          <Panel label="Wind engine" hint="how much real work ran" live>
            <EngineStats />
          </Panel>
        </section>

        {/* WHY REJECTED + CORPUS */}
        <section className="mt-10 flex flex-col gap-6">
          <Panel label="Why agents reject you" hint="tagged from real reasoning" live>
            <DiagnosisPanel />
          </Panel>
          <Panel label="Your footprint" hint="the docs the agent actually sees">
            <Artifacts />
          </Panel>
        </section>

        {/* PROOF: CLIMB + FUNNEL */}
        <section id="proof" className="mt-10 flex flex-col gap-6 scroll-mt-20">
          <Panel label="Proof" hint="usage over versions, two models">
            <ClimbChart />
          </Panel>
          <Panel label="Funnel" hint="candidacy → selection → execution">
            <Funnel />
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
