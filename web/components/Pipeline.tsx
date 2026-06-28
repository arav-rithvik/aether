"use client";
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
  const converged = version >= TOTAL_VERSIONS;
  const nextV = Math.min(version + 1, TOTAL_VERSIONS);
  const lift = Math.round((scoreOf(model, version).usageRate - scoreOf(model, 1).usageRate) * 100);

  const steps = [
    { phase: "Measure", title: "Ingest the job", desc: "Capture the job and ICP the customer wants agents to use them for.", metric: "1 job" },
    { phase: "Measure", title: "Generate phrasings", desc: "Derive the many ways an agent might be asked — split train vs held-out.", metric: `${s.phrasings} phrasings` },
    { phase: "Measure", title: "Assemble the toolset", desc: "Put your API, a real rival, and do-it-yourself on the table.", metric: "3 tools" },
    { phase: "Measure", title: "Build the corpus", desc: "The controlled search surface the agent retrieves from.", metric: version === 1 ? "weak" : "optimized" },
    { phase: "Measure", title: "Run the wind tunnel", desc: "Execute a real agent on every phrasing × model × repeat.", metric: `${m.n} runs` },
    { phase: "Measure", title: "Capture the funnel", desc: "Record candidacy → selection → execution for each run.", metric: `${m.candidacy}/${m.n} found` },
    { phase: "Diagnose", title: "Tag the rejections", desc: "A labeler reads each run's reasoning and tags why you lost.", metric: `${FAILURE_LABEL[topTag]} ·${bd[topTag]}` },
    { phase: "Optimize", title: "Rewrite the footprint", desc: "Propose one truthful change to your tool description for the top reason.", metric: converged ? "converged" : `v${version}→v${nextV}` },
    { phase: "Optimize", title: "Guardrail check", desc: "Auto-check the rewrite: truthful, schema-valid, no tool-poisoning.", metric: "3/3 pass" },
    { phase: "Prove", title: "Re-prove on held-out", desc: "Re-run phrasings the optimizer never saw; confirm the control stays flat.", metric: lift > 0 ? `${Math.round(m.rate * 100)}% ·+${lift}` : `${Math.round(m.rate * 100)}%` },
  ];

  const phaseColor: Record<string, string> = {
    Measure: "var(--color-steel)",
    Diagnose: "var(--color-bad)",
    Optimize: "var(--color-yc)",
    Prove: "var(--color-good)",
  };

  return (
    <div>
      <p className="mb-6 max-w-[640px] font-sans text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        A closed loop, per customer, per job. It measures real agent behavior, finds why you lose,
        rewrites your footprint, and proves the lift — then repeats as models drift.
      </p>

      <ol className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
        {steps.map((st, i) => (
          <li
            key={st.title}
            className="flex items-baseline gap-4 border-t border-[var(--color-line)] py-3.5 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
          >
            <span className="tnum w-6 shrink-0 font-mono text-[12px] text-[var(--color-ink-3)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: phaseColor[st.phase] }}
                />
                <span className="font-display text-[15px] font-semibold text-[var(--color-ink)]">
                  {st.title}
                </span>
              </div>
              <p className="mt-0.5 font-sans text-[12.5px] leading-snug text-[var(--color-ink-3)]">
                {st.desc}
              </p>
            </div>
            <span className="tnum shrink-0 whitespace-nowrap font-mono text-[12px] font-semibold text-[var(--color-ink-2)]">
              {st.metric}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-line)] pt-4">
        <span className="flex items-center gap-2 font-sans text-[12px] text-[var(--color-ink-3)]">
          <span className="text-[var(--color-yc)]">↺</span>
          loops back to step 05 each iteration — until no rejection reason is worth fixing.
        </span>
        <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
          iteration {version} / {TOTAL_VERSIONS}
        </span>
      </div>
    </div>
  );
}
