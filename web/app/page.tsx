"use client";
import { AetherProvider } from "@/lib/AetherProvider";
import { StatusRail } from "@/components/StatusRail";
import { UsageGauge } from "@/components/UsageGauge";
import { WindTunnel } from "@/components/WindTunnel";
import { ChangeLog } from "@/components/ChangeLog";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { ClimbChart } from "@/components/ClimbChart";
import { Funnel } from "@/components/Funnel";
import { TwoTerminals } from "@/components/TwoTerminals";
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
        <section className="grid-floor relative mt-6 grid gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col">
            <span className="eyebrow">The wind tunnel for the agent economy</span>
            <h1 className="mt-3 max-w-[560px] font-display text-[40px] font-semibold leading-[1.04] tracking-tight text-[var(--color-ink)]">
              When an agent does a job our customer sells,{" "}
              <span className="text-[var(--color-yc)]">we make the agent pick our customer.</span>
            </h1>
            <p className="mt-4 max-w-[520px] font-sans text-[15px] leading-relaxed text-[var(--color-ink-2)]">
              Agents are becoming the buyers. We measure the rate at which an AI agent
              discovers and <em>uses</em> a product to complete a task — then we raise it.
            </p>
            <div className="mt-6">
              <AaoArc />
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 font-mono text-[11px] text-[var(--color-ink-3)]">
              <span className="rounded bg-[var(--color-panel-2)] px-2 py-1">
                customer: OrangeSlice
              </span>
              <span className="rounded bg-[var(--color-panel-2)] px-2 py-1">
                job: find high-intent buyers &amp; start outreach
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-line)] bg-white p-5">
            <UsageGauge />
          </div>
        </section>

        {/* WIND TUNNEL — the signature */}
        <section className="mt-5">
          <Panel label="The wind tunnel" hint="100 agents · captured = used OrangeSlice" live className="overflow-hidden">
            <div className="h-[180px]">
              <WindTunnel />
            </div>
          </Panel>
        </section>

        {/* ENGINE GRID */}
        <section className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          <Panel label="Change-log" hint="OrangeSlice's footprint, versioned">
            <ChangeLog />
          </Panel>
          <Panel label="Diagnosis" hint="why the agent skipped OrangeSlice" live>
            <DiagnosisPanel />
          </Panel>
          <Panel label="Proof" hint="usage rate over versions, two models">
            <ClimbChart />
          </Panel>
          <Panel label="Funnel" hint="candidacy → selection → execution">
            <Funnel />
          </Panel>
        </section>

        {/* TWO TERMINALS */}
        <section className="mt-5">
          <Panel label="The two terminals" hint="same agent · same task · only the footprint changed">
            <TwoTerminals />
          </Panel>
        </section>

        {/* HONEST FOOTER */}
        <footer className="mt-8 rounded-xl border border-dashed border-[var(--color-line-2)] bg-[var(--color-panel)] px-5 py-4">
          <p className="font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">
            <span className="font-semibold text-[var(--color-ink)]">Calibrated honesty:</span>{" "}
            We control the retrieval surface so it&apos;s reproducible on camera. In
            production this is the live web and the customer&apos;s own footprint, which they
            delegate to us. We show the mechanism — we never edit OrangeSlice&apos;s live site,
            and every number here is computed from runs, never hand-set.
          </p>
          <p className="mt-2 font-mono text-[10.5px] text-[var(--color-ink-3)]">
            ◷ frontend running on a simulated wind tunnel · swaps to Arav&apos;s live Convex
            engine with no component changes (schema §8).
          </p>
        </footer>
      </main>
    </AetherProvider>
  );
}
