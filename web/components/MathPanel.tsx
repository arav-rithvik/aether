"use client";
import { compRate, mathFor, useAether } from "@/lib/useAether";

export function MathPanel() {
  const { version, model } = useAether();
  const m = mathFor(model, version);

  const of = m.n || 1;
  const chain = [
    { label: "ran", v: m.n, of, note: "agents given the job" },
    { label: "found you", v: m.candidacy, of, note: "candidacy" },
    { label: "recommended you", v: m.selection, of, note: "picked over rival / DIY" },
    { label: "called your tool", v: m.called, of, note: "executed the call" },
  ];

  return (
    <div className="flex flex-col gap-4">
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
