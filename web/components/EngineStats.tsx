"use client";
import { engineStats, useAether } from "@/lib/useAether";

export function EngineStats() {
  const s = engineStats();
  const { version } = useAether();

  const stats = [
    { v: s.iterations, label: "iterations", sub: "footprint versions" },
    { v: s.totalRuns, label: "agent runs", sub: `${s.perCell}× per cell` },
    { v: s.agentCalls, label: "LLM calls", sub: "runs + tagger + rewrite" },
    { v: s.phrasings, label: "phrasings", sub: `${s.trainN} train · ${s.testN} held-out` },
    { v: "2", label: "live models", sub: "GPT-4o · GPT-4o-mini" },
    { v: 3, label: "tools on table", sub: "you · rival · DIY" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {stats.map((st) => (
        <div key={st.label} className="rounded-lg border border-[var(--color-line)] bg-white p-3">
          <div className="tnum font-mono text-[22px] font-bold leading-none text-[var(--color-ink)]">
            {st.v}
          </div>
          <div className="mt-1.5 font-sans text-[12px] font-medium text-[var(--color-ink-2)]">
            {st.label}
          </div>
          <div className="font-mono text-[10px] text-[var(--color-ink-3)]">{st.sub}</div>
        </div>
      ))}
      <div className="col-span-2 flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-line-2)] px-3 py-2 sm:col-span-3">
        <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
        <span className="font-mono text-[11px] text-[var(--color-ink-2)]">
          currently showing iteration {version}, measured on held-out phrasings the optimizer never saw.
        </span>
      </div>
    </div>
  );
}
