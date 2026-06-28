"use client";
import { motion } from "framer-motion";
import {
  DESCRIPTIONS,
  failureBreakdown,
  scoreOf,
  TAG_FIX,
  useAether,
  TOTAL_VERSIONS,
} from "@/lib/useAether";
import { FAILURE_LABEL, FailureTag } from "@/lib/schema";

export function ToolRecommendation() {
  const { version, model, setVersion } = useAether();
  const converged = version >= TOTAL_VERSIONS;
  const cur = DESCRIPTIONS.find((d) => d.version === version)!;
  const next = DESCRIPTIONS.find((d) => d.version === version + 1);

  // reasons this recommendation targets (top tags at the current version)
  const bd = failureBreakdown(model, version);
  const targeted = (Object.keys(bd) as FailureTag[])
    .filter((t) => bd[t] > 0)
    .sort((a, b) => bd[b] - bd[a])
    .slice(0, 2);

  const before = Math.round(scoreOf(model, version).usageRate * 100);
  const after = next ? Math.round(scoreOf(model, version + 1).usageRate * 100) : before;

  if (converged || !next) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-3">
        <span className="rounded-full bg-[var(--color-yc-wash)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--color-yc-deep)]">
          ✓ converged at v{version}
        </span>
        <p className="font-sans text-[13px] leading-relaxed text-[var(--color-ink-2)]">
          No rejection reason is worth fixing anymore. Your current tool description is the
          recommendation — agents pick you {before}% of the time.
        </p>
        <button
          onClick={() => setVersion(1)}
          className="rounded-full border border-[var(--color-line-2)] px-3.5 py-1.5 font-mono text-[11px] font-semibold text-[var(--color-ink-2)] hover:bg-[var(--color-panel-2)]"
        >
          ↺ replay from v1
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[13px] text-[var(--color-ink-2)]">
          Proposed change to your <span className="text-[var(--color-ink)]">tool description</span>
        </span>
        <span className="font-mono text-[11px] text-[var(--color-ink-3)]">v{version} → v{version + 1}</span>
      </div>

      {/* before / after diff */}
      <div className="grid gap-2 sm:grid-cols-2">
        <DiffCard tone="before" label={`Now · v${version}`} name={cur.name} body={cur.description} schema={cur.schema} />
        <DiffCard tone="after" label={`Proposed · v${version + 1}`} name={next.name} body={next.description} schema={next.schema} />
      </div>

      {/* why */}
      <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
        <div className="eyebrow">Why this change</div>
        <div className="mt-2 flex flex-col gap-2">
          {targeted.map((t) => (
            <div key={t} className="flex items-start gap-2">
              <span
                className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-bad)]"
                style={{ background: "#FBEAEA" }}
              >
                {FAILURE_LABEL[t]} · {bd[t]}
              </span>
              <span className="font-sans text-[12px] leading-snug text-[var(--color-ink-2)]">
                {TAG_FIX[t].fix}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 border-t border-[var(--color-line)] pt-2 font-mono text-[10px] text-[var(--color-ink-3)]">
          truthful claims only — no “always use me” injection (tool-poisoning = instant DQ).
        </p>
      </div>

      {/* projected result */}
      <button
        onClick={() => setVersion(version + 1)}
        className="group flex items-center justify-between rounded-lg border border-[var(--color-yc)] bg-[var(--color-yc-wash)] px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--color-yc-soft)]"
      >
        <span className="font-mono text-[12px] font-semibold text-[var(--color-yc-deep)]">
          Apply &amp; re-prove →
        </span>
        <span className="flex items-center gap-2 font-mono text-[13px] font-bold">
          <span className="text-[var(--color-ink-3)]">{before}%</span>
          <span className="text-[var(--color-ink-3)]">→</span>
          <motion.span key={after} className="text-[var(--color-yc-deep)]">
            {after}%
          </motion.span>
          <span className="text-[var(--color-good)]">+{after - before}</span>
        </span>
      </button>
    </div>
  );
}

function DiffCard({
  tone,
  label,
  name,
  body,
  schema,
}: {
  tone: "before" | "after";
  label: string;
  name: string;
  body: string;
  schema: string;
}) {
  const after = tone === "after";
  return (
    <div
      className="flex flex-col rounded-lg border p-2.5"
      style={{
        borderColor: after ? "var(--color-yc)" : "var(--color-line-2)",
        background: after ? "var(--color-yc-wash)" : "var(--color-panel)",
      }}
    >
      <div
        className="font-mono text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: after ? "var(--color-yc-deep)" : "var(--color-ink-3)" }}
      >
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[11px] font-semibold text-[var(--color-ink)]">{name}</div>
      <p className="mt-1 font-sans text-[11.5px] leading-snug text-[var(--color-ink-2)]">{body}</p>
      {schema !== "—" && (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-white/70 px-2 py-1.5 font-mono text-[9.5px] leading-relaxed text-[var(--color-ink-2)]">
          {schema}
        </pre>
      )}
    </div>
  );
}
