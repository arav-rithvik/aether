"use client";
import {
  DESCRIPTIONS,
  failureBreakdown,
  mathFor,
  scoreOf,
  useAether,
  TOTAL_VERSIONS,
} from "@/lib/useAether";
import { FAILURE_LABEL, FailureTag } from "@/lib/schema";

export function AAOSummary() {
  const { model } = useAether();

  const baseline = Math.round(scoreOf(model, 1).usageRate * 100);
  const final = Math.round(scoreOf(model, TOTAL_VERSIONS).usageRate * 100);

  const changes = [];
  for (let v = 1; v < TOTAL_VERSIONS; v++) {
    const before = Math.round(scoreOf(model, v).usageRate * 100);
    const after = Math.round(scoreOf(model, v + 1).usageRate * 100);
    const desc = DESCRIPTIONS.find((d) => d.version === v + 1)!;
    changes.push({ v: v + 1, before, after, delta: after - before, desc });
  }

  // recaps
  const mF = mathFor(model, TOTAL_VERSIONS);
  const youPct = Math.round((mF.selection / (mF.n || 1)) * 100);
  const compPct = Math.round((mF.competitor / (mF.n || 1)) * 100);
  const diyPct = Math.round((mF.diy / (mF.n || 1)) * 100);
  const bd1 = failureBreakdown(model, 1);
  const topTag1 = (Object.keys(bd1) as FailureTag[]).filter((t) => bd1[t] > 0).sort((a, b) => bd1[b] - bd1[a])[0];

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
      <span className="font-display text-[15px] font-bold tracking-tight text-[var(--color-ink-2)]">
        Your 2AO summary
      </span>
      <h2 className="mt-2 max-w-[760px] font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)]">
        Aether ran on its own and took you from{" "}
        <span className="text-[var(--color-ink-3)]">{baseline}%</span> to{" "}
        <span className="text-[var(--color-yc)]">{final}%</span> agent usage.
      </h2>
      <p className="mt-3 max-w-[640px] font-sans text-[15px] leading-relaxed text-[var(--color-ink-2)]">
        No human approved these. The engine measured real agent behavior, found why you lost, and
        rewrote your agent-facing footprint, one truthful change at a time. Here is everything it did.
      </p>

      {/* what we did */}
      <div className="mt-6 flex flex-col gap-2.5">
        {changes.map((c) => (
          <div key={c.v} className="flex items-start gap-4 rounded-xl border border-[var(--color-line)] bg-white p-4">
            <span className="mt-0.5 flex h-7 shrink-0 items-center rounded-md bg-[var(--color-ink)] px-2 font-mono text-[11px] font-bold text-white">
              v{c.v}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[14px] font-semibold text-[var(--color-ink)]">
                We rewrote your footprint: {c.desc.name}
              </div>
              <p className="mt-1 font-sans text-[12.5px] leading-snug text-[var(--color-ink-2)]">{c.desc.changeReason}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono text-[13px] font-bold text-[var(--color-yc-deep)]">+{c.delta} pts</div>
              <div className="font-mono text-[10px] text-[var(--color-ink-3)]">{c.before}% → {c.after}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* quick recaps of everything */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Recap title="Why agents rejected you">
          They mostly defaulted to their own tools. The top reason was{" "}
          <span className="font-semibold text-[var(--color-ink)]">{topTag1 ? FAILURE_LABEL[topTag1] : "—"}</span>, which the rewrites targeted directly.
        </Recap>
        <Recap title="The math">
          Usage = agents that called you ÷ total runs ={" "}
          <span className="font-semibold text-[var(--color-ink)]">{final}%</span>, computed live from {mF.n} runs.
        </Recap>
        <Recap title="Observability">
          Of every run: you <span className="font-semibold text-[var(--color-yc-deep)]">{youPct}%</span>, competitors {compPct}%, did it itself {diyPct}%.
        </Recap>
      </div>

      {/* the company line */}
      <div className="mt-8 border-t border-[var(--color-line-2)] pt-5 text-center">
        <p className="font-display text-[18px] font-semibold tracking-tight text-[var(--color-ink)]">
          Aether is a vertical AI B2B SaaS engine for Agentic Awareness Optimization.
        </p>
        <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-3)]">
          a swarm of agents that runs forever, per customer, with no human in the loop.
        </p>
      </div>
    </div>
  );
}

function Recap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-white p-3.5">
      <div className="eyebrow">{title}</div>
      <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">{children}</p>
    </div>
  );
}
