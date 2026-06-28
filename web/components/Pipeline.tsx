"use client";
import { motion } from "framer-motion";
import {
  engineStats,
  failureBreakdown,
  mathFor,
  scoreOf,
  useAether,
  TOTAL_VERSIONS,
} from "@/lib/useAether";
import { FAILURE_LABEL, FailureTag } from "@/lib/schema";

export function Pipeline() {
  const { version, model } = useAether();
  const s = engineStats();
  const m = mathFor(model, version);
  const bd = failureBreakdown(model, version);
  const topTag = (Object.keys(bd) as FailureTag[]).sort((a, b) => bd[b] - bd[a])[0];
  const nextV = Math.min(version + 1, TOTAL_VERSIONS);
  const converged = version >= TOTAL_VERSIONS;
  const lift = Math.round((scoreOf(model, version).usageRate - scoreOf(model, 1).usageRate) * 100);

  const stages = [
    {
      n: "01",
      key: "phrasings",
      title: "Phrasings",
      does: "One job, many ways to ask it. Train set the optimizer sees; held-out set it never does.",
      metric: `${s.phrasings} phrasings`,
      sub: `${s.trainN} train · ${s.testN} held-out`,
    },
    {
      n: "02",
      key: "tunnel",
      title: "Wind tunnel",
      does: "Run a real agent on each phrasing with your API, a rival, and do-it-yourself on the table.",
      metric: `${m.n} runs`,
      sub: `${s.perCell}× per phrasing · ${s.models} models`,
    },
    {
      n: "03",
      key: "diagnose",
      title: "Diagnose",
      does: "A labeler reads each run's reasoning and tags why the agent didn't pick you.",
      metric: FAILURE_LABEL[topTag],
      sub: `top reason · ${bd[topTag]} runs`,
    },
    {
      n: "04",
      key: "optimize",
      title: "Optimize",
      does: "Rewrite your tool description to kill the top reason. Truthful claims only.",
      metric: converged ? "converged" : `v${version} → v${nextV}`,
      sub: converged ? "no reason left to fix" : "1 change, annotated",
    },
    {
      n: "05",
      key: "prove",
      title: "Re-prove",
      does: "Re-run on held-out phrasings. If usage climbs and the control stays flat, it was real.",
      metric: `${Math.round(m.rate * 100)}% used`,
      sub: lift > 0 ? `+${lift} pts vs v1` : "baseline",
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="max-w-[680px] font-sans text-[13px] text-[var(--color-ink-2)]">
          A closed loop, per customer, per job. It measures real agent behavior, finds why you lose,
          rewrites your footprint, and proves the lift — then repeats as models drift.
        </p>
        <span className="eyebrow">iteration {version} / {TOTAL_VERSIONS}</span>
      </div>

      <div className="grid gap-2.5 md:grid-cols-5">
        {stages.map((st, i) => {
          return (
            <motion.div
              key={st.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="relative flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-[var(--color-yc)]">{st.n}</span>
                {i < stages.length - 1 && (
                  <span className="hidden text-[var(--color-line-2)] md:inline">→</span>
                )}
              </div>
              <div className="mt-1 font-display text-[15px] font-semibold text-[var(--color-ink)]">
                {st.title}
              </div>
              <p className="mt-1 flex-1 font-sans text-[11.5px] leading-snug text-[var(--color-ink-3)]">
                {st.does}
              </p>
              <div className="mt-2.5 border-t border-[var(--color-line)] pt-2">
                <div className="tnum font-mono text-[15px] font-bold text-[var(--color-ink)]">
                  {st.metric}
                </div>
                <div className="font-mono text-[10px] text-[var(--color-ink-3)]">{st.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center gap-2 font-mono text-[10.5px] text-[var(--color-ink-3)]">
        <span className="text-[var(--color-yc)]">↺</span>
        loop closes here — re-feeds stage 02 each iteration until no rejection reason is worth fixing.
      </div>
    </div>
  );
}
