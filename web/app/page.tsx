"use client";
import { AetherProvider } from "@/lib/AetherProvider";
import { StatusRail } from "@/components/StatusRail";
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

function AaoArc() {
  const steps = [
    { y: "SEO", t: "ranked", d: "a human searches → a click", on: false },
    { y: "GEO", t: "mentioned", d: "a human asks AI → a citation", on: false },
    { y: "AAO", t: "used", d: "an agent does a task → a tool call", on: true },
  ];
  return (
    <div className="flex flex-col gap-2">
      {steps.map((s) => (
        <div
          key={s.y}
          className="flex items-center gap-3 rounded-lg border px-3 py-2"
          style={{
            borderColor: s.on ? "var(--color-yc)" : "var(--color-line)",
            background: s.on ? "var(--color-yc-wash)" : "var(--color-panel-2)",
          }}
        >
          <span
            className="w-10 font-mono text-[13px] font-bold"
            style={{ color: s.on ? "var(--color-yc)" : "var(--color-ink-2)" }}
          >
            {s.y}
          </span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">get</span>
          <span
            className="font-mono text-[13px] font-semibold"
            style={{ color: s.on ? "var(--color-yc-deep)" : "var(--color-ink)" }}
          >
            {s.t}
          </span>
          <span className="hidden font-sans text-[12px] text-[var(--color-ink-2)] sm:inline">
            — {s.d}
          </span>
          {s.on && (
            <span className="ml-auto rounded-full bg-[var(--color-yc)] px-2 py-0.5 font-mono text-[9px] font-bold text-white">
              OURS
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <AetherProvider>
      <StatusRail />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 pb-16">
        {/* HERO */}
        <section className="relative mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div aria-hidden className="grid-floor pointer-events-none absolute inset-0" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col">
              <span className="eyebrow">OrangeSlice · your agent-facing footprint, live</span>
              <h1 className="mt-3 max-w-[580px] font-display text-[40px] font-semibold leading-[1.04] tracking-tight text-[var(--color-ink)]">
                When an agent does a job you sell,{" "}
                <span className="text-[var(--color-yc)]">we make the agent pick OrangeSlice.</span>
              </h1>
              <p className="mt-4 max-w-[520px] font-sans text-[15px] leading-relaxed text-[var(--color-ink-2)]">
                Agents are becoming your buyers. This is how often one discovers and{" "}
                <em>uses</em> OrangeSlice to do the job — and the engine that raises it.
              </p>
              <div className="mt-6">
                <AaoArc />
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 font-mono text-[11px] text-[var(--color-ink-2)]">
                <span className="rounded bg-[var(--color-panel-2)] px-2 py-1">you: OrangeSlice · YC&nbsp;S25</span>
                <span className="rounded bg-[var(--color-panel-2)] px-2 py-1">
                  job tracked: find high-intent buyers &amp; start outreach
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-line)] bg-white p-5">
              <UsageGauge />
            </div>
          </div>
        </section>

        {/* THE ALGORITHM */}
        <section className="mt-5">
          <Panel label="The algorithm" hint="the closed loop, end to end" live>
            <Pipeline />
          </Panel>
        </section>

        {/* THE RECOMMENDATION */}
        <section className="mt-5">
          <Panel label="The recommendation" hint="what the engine changes on your door">
            <ToolRecommendation />
          </Panel>
        </section>

        {/* MATH + ENGINE STATS */}
        <section className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          <Panel label="The math" hint="every % traced to raw counts">
            <MathPanel />
          </Panel>
          <Panel label="Wind engine" hint="how much real work ran" live>
            <EngineStats />
          </Panel>
        </section>

        {/* WHY REJECTED + CORPUS */}
        <section className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          <Panel label="Why agents reject you" hint="tagged from real reasoning" live>
            <DiagnosisPanel />
          </Panel>
          <Panel label="Your footprint" hint="the docs the agent actually sees">
            <Artifacts />
          </Panel>
        </section>

        {/* PROOF: CLIMB + FUNNEL */}
        <section className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          <Panel label="Proof" hint="usage over versions, two models">
            <ClimbChart />
          </Panel>
          <Panel label="Funnel" hint="candidacy → selection → execution">
            <Funnel />
          </Panel>
        </section>

        {/* HISTORY */}
        <section className="mt-5">
          <Panel label="Change-log" hint="every rewrite of your door, with the reason">
            <ChangeLog />
          </Panel>
        </section>

        {/* HONEST FOOTER */}
        <footer className="mt-8 rounded-xl border border-dashed border-[var(--color-line-2)] bg-[var(--color-panel)] px-5 py-4">
          <p className="font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">
            <span className="font-semibold text-[var(--color-ink)]">Calibrated honesty:</span>{" "}
            We control the retrieval surface so it&apos;s reproducible on camera. In production this
            is the live web and your own footprint, which you delegate to us. We show the mechanism —
            we never touch your live site, and every number here is computed from runs, never hand-set.
          </p>
          <p className="mt-2 font-mono text-[10.5px] text-[var(--color-ink-3)]">
            ◷ frontend running on a simulated wind tunnel · swaps to Arav&apos;s live Convex engine
            with no component changes (schema §8).
          </p>
        </footer>
      </main>
    </AetherProvider>
  );
}
