"use client";
import { motion } from "framer-motion";
import { funnelFor, useAether } from "@/lib/useAether";

const STAGES = [
  { key: "candidacy", label: "Candidacy", sub: "agent found OrangeSlice" },
  { key: "selection", label: "Selection", sub: "picked it over rival / DIY" },
  { key: "execution", label: "Execution", sub: "call ran, returned leads" },
] as const;

export function Funnel() {
  const { model, version } = useAether();
  const f = funnelFor(model, version);
  const vals: Record<string, number> = {
    candidacy: f.candidacy,
    selection: f.selection,
    execution: f.execution,
  };

  return (
    <div className="flex h-full flex-col gap-2.5">
      {STAGES.map((s, i) => {
        const v = vals[s.key];
        const isLast = i === STAGES.length - 1;
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className="w-[88px] shrink-0">
              <div className="font-mono text-[11px] font-semibold text-[var(--color-ink)]">{s.label}</div>
              <div className="text-[10px] leading-tight text-[var(--color-ink-3)]">{s.sub}</div>
            </div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-[var(--color-panel-2)]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-md"
                style={{
                  background: isLast ? "var(--color-yc)" : "var(--color-yc-soft)",
                }}
                animate={{ width: `${v * 100}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              <span
                className="tnum absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[12px] font-semibold"
                style={{ color: isLast ? "var(--color-yc-deep)" : "var(--color-ink-2)" }}
              >
                {Math.round(v * 100)}%
              </span>
            </div>
          </div>
        );
      })}
      <p className="mt-auto pt-1 font-mono text-[10px] text-[var(--color-ink-3)]">
        n = {f.n} runs · {model === "gpt" ? "GPT-5" : "Claude"} · v{version}
      </p>
    </div>
  );
}
