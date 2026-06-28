"use client";
import { StatusRail } from "@/components/StatusRail";
import { AgentsPanel } from "@/components/AgentsPanel";
import { Panel } from "@/components/ui";

export default function AgentsPage() {
  return (
    <>
      <StatusRail />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-6 pb-24">
        <section className="mx-auto max-w-[820px] pt-16 pb-8 text-center">
          <span className="font-display text-[18px] font-bold tracking-tight text-[var(--color-ink-2)]">
            Agents
          </span>
          <h1 className="mt-3 font-display text-[44px] font-semibold leading-[1.03] tracking-[-0.02em] text-[var(--color-ink)]">
            Connect a model, run the <span className="text-[var(--color-yc)]">wind tunnel.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] font-sans text-[16px] leading-relaxed text-[var(--color-ink-2)]">
            Aether runs real agents with your own keys. Connect a model to test how its agents behave
            on your footprint. GPT-4o and GPT-4o-mini are both live on the same engine.
          </p>
        </section>

        <section>
          <Panel label="Connected models" hint="your keys run your agents, nothing transmitted to us">
            <AgentsPanel />
          </Panel>
        </section>
      </main>
    </>
  );
}
