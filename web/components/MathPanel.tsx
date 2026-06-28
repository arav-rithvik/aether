"use client";
import { compRate, mathFor, useAether } from "@/lib/useAether";
import { MODELS } from "@/lib/schema";

export function MathPanel() {
  const { version, model } = useAether();
  const m = mathFor(model, version);
  const modelLabel = MODELS.find((x) => x.id === model)?.label;

  const chain = [
    { label: "ran", v: m.n, of: m.n, note: "agents given the job" },
    { label: "found you", v: m.candidacy, of: m.n, note: "candidacy" },
    { label: "chose you", v: m.selection, of: m.n, note: "selection" },
    { label: "got leads", v: m.execution, of: m.n, note: "execution" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* the headline formula, with real counts */}
      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3.5">
        <div className="eyebrow">How the rate is computed</div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px]">
          <span className="text-[var(--color-ink-2)]">usage rate</span>
          <span className="text-[var(--color-ink-3)]">=</span>
          <span className="text-[var(--color-ink)]">used runs ÷ total runs</span>
          <span className="text-[var(--color-ink-3)]">=</span>
          <span className="tnum font-semibold text-[var(--color-ink)]">
            {m.used} ÷ {m.n}
          </span>
          <span className="text-[var(--color-ink-3)]">=</span>
          <span className="tnum text-[18px] font-bold text-[var(--color-yc)]">
            {(m.rate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-1 font-mono text-[10px] text-[var(--color-ink-3)]">
          {modelLabel} · v{version} · counted live from runs, not hand-set
        </div>
      </div>

      {/* funnel as a number chain */}
      <div>
        <div className="eyebrow mb-2">Where the runs go</div>
        <div className="flex items-stretch gap-1">
          {chain.map((c, i) => {
            const pct = Math.round((c.v / c.of) * 100);
            return (
              <div key={c.label} className="flex flex-1 items-stretch">
                <div className="flex flex-1 flex-col rounded-lg border border-[var(--color-line)] bg-white p-2 text-center">
                  <span className="tnum font-mono text-[18px] font-bold text-[var(--color-ink)]">{c.v}</span>
                  <span className="font-sans text-[11px] font-medium text-[var(--color-ink-2)]">{c.label}</span>
                  <span className="font-mono text-[9px] text-[var(--color-ink-3)]">{c.note} · {pct}%</span>
                </div>
                {i < chain.length - 1 && (
                  <span className="flex items-center px-0.5 font-mono text-[var(--color-line-2)]">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* control */}
      <div className="flex items-center justify-between rounded-lg border border-dashed border-[var(--color-line-2)] px-3 py-2">
        <span className="font-mono text-[11px] text-[var(--color-ink-2)]">
          competitor (control) ={" "}
          <span className="font-semibold text-[var(--color-ink)]">
            {Math.round(compRate(model, version) * 100)}%
          </span>
        </span>
        <span className="font-mono text-[10px] text-[var(--color-ink-3)]">held flat → the lift is real, not drift</span>
      </div>
    </div>
  );
}
