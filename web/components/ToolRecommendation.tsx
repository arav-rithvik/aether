"use client";
import { useEffect, useState } from "react";
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
  const [mode, setMode] = useState<"manual" | "auto">("manual");

  const converged = version >= TOTAL_VERSIONS;
  const cur = DESCRIPTIONS.find((d) => d.version === version)!;
  const next = DESCRIPTIONS.find((d) => d.version === version + 1);

  const bd = failureBreakdown(model, version);
  const targeted = (Object.keys(bd) as FailureTag[])
    .filter((t) => bd[t] > 0)
    .sort((a, b) => bd[b] - bd[a])
    .slice(0, 2);

  const before = Math.round(scoreOf(model, version).usageRate * 100);
  const after = next ? Math.round(scoreOf(model, version + 1).usageRate * 100) : before;

  // AI-native auto-apply: when on, it advances itself until converged
  useEffect(() => {
    if (mode !== "auto" || converged) return;
    const t = setTimeout(() => setVersion(version + 1), 2400);
    return () => clearTimeout(t);
  }, [mode, version, converged, setVersion]);

  return (
    <div className="flex flex-col gap-5">
      {/* mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[420px] font-sans text-[13px] text-[var(--color-ink-2)]">
          The engine proposes one truthful change to your tool description at a time. Approve each, or
          let it run fully AI-native.
        </p>
        <div className="flex items-center gap-0.5 rounded-lg border border-[var(--color-line)] bg-white p-0.5">
          {(["manual", "auto"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors"
              style={{
                background: mode === m ? "var(--color-ink)" : "transparent",
                color: mode === m ? "#fff" : "var(--color-ink-2)",
              }}
            >
              {m === "manual" ? "Manual approve" : "Auto-apply"}
            </button>
          ))}
        </div>
      </div>

      {/* current recommendation */}
      {!converged && next ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[13px] text-[var(--color-ink-2)]">
              Proposed change to your <span className="text-[var(--color-ink)]">tool description</span>
            </span>
            <span className="font-mono text-[11px] text-[var(--color-ink-3)]">v{version} → v{version + 1}</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <DiffCard tone="before" label={`Now · v${version}`} name={cur.name} body={cur.description} schema={cur.schema} />
            <DiffCard tone="after" label={`Proposed · v${version + 1}`} name={next.name} body={next.description} schema={next.schema} />
          </div>

          <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
            <div className="eyebrow">Why this change</div>
            <div className="mt-2 flex flex-col gap-2">
              {targeted.map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-bad)]" style={{ background: "#FBEAEA" }}>
                    {FAILURE_LABEL[t]} · {bd[t]}
                  </span>
                  <span className="font-sans text-[12px] leading-snug text-[var(--color-ink-2)]">{TAG_FIX[t].fix}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 border-t border-[var(--color-line)] pt-2 font-mono text-[10px] text-[var(--color-ink-3)]">
              truthful claims only. No “always use me” injection (tool-poisoning is an instant DQ).
            </p>
          </div>

          {mode === "manual" ? (
            <button
              onClick={() => setVersion(version + 1)}
              className="group flex items-center justify-between rounded-lg border border-[var(--color-yc)] bg-[var(--color-yc-wash)] px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--color-yc-soft)]"
            >
              <span className="font-mono text-[12px] font-semibold text-[var(--color-yc-deep)]">Approve &amp; re-prove →</span>
              <span className="flex items-center gap-2 font-mono text-[13px] font-bold">
                <span className="text-[var(--color-ink-3)]">{before}%</span>
                <span className="text-[var(--color-ink-3)]">→</span>
                <span className="text-[var(--color-yc-deep)]">{after}%</span>
                <span className="text-[var(--color-good)]">+{after - before}</span>
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-yc)] bg-[var(--color-yc-wash)] px-3.5 py-2.5">
              <span className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold text-[var(--color-yc-deep)]">
                <span className="live-dot">●</span> auto-applying v{version} → v{version + 1}…
              </span>
              <span className="font-mono text-[13px] font-bold text-[var(--color-yc-deep)]">{before}% → {after}%</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3">
          <span className="font-sans text-[13px] text-[var(--color-ink-2)]">
            <span className="font-semibold text-[var(--color-ink)]">Converged.</span> No reason left worth
            fixing. Agents pick you {before}% of the time.
          </span>
          <button onClick={() => setVersion(1)} className="rounded-full border border-[var(--color-line-2)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[var(--color-ink-2)] hover:bg-white">
            ↺ replay
          </button>
        </div>
      )}

      {/* full history (the change-log, scrollable) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Change-log · every rewrite, with the reason</span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{DESCRIPTIONS.length} versions</span>
        </div>
        <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2.5">
          {[...DESCRIPTIONS].reverse().map((d) => {
            const active = d.version === version;
            return (
              <div key={d.version} className="rounded-lg border bg-white p-3" style={{ borderColor: active ? "var(--color-yc)" : "var(--color-line)" }}>
                <div className="flex items-center gap-2">
                  <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white" style={{ background: active ? "var(--color-yc)" : "var(--color-ink-3)" }}>
                    v{d.version}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-[var(--color-ink)]">{d.name}</span>
                  {active && <span className="ml-auto font-mono text-[10px] text-[var(--color-yc-deep)]">current</span>}
                </div>
                <p className="mt-1.5 font-sans text-[12px] leading-snug text-[var(--color-ink-2)]">{d.description}</p>
                <p className="mt-1.5 border-t border-[var(--color-line)] pt-1.5 font-sans text-[11.5px] leading-snug text-[var(--color-ink-3)]">
                  <span className="font-semibold text-[var(--color-ink-2)]">{d.version === 1 ? "Starting point: " : "Why: "}</span>
                  {d.changeReason}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DiffCard({ tone, label, name, body, schema }: { tone: "before" | "after"; label: string; name: string; body: string; schema: string }) {
  const after = tone === "after";
  return (
    <div className="flex flex-col rounded-lg border p-2.5" style={{ borderColor: after ? "var(--color-yc)" : "var(--color-line-2)", background: after ? "var(--color-yc-wash)" : "var(--color-panel)" }}>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-wide" style={{ color: after ? "var(--color-yc-deep)" : "var(--color-ink-3)" }}>{label}</div>
      <div className="mt-1.5 font-mono text-[11px] font-semibold text-[var(--color-ink)]">{name}</div>
      <p className="mt-1 font-sans text-[11.5px] leading-snug text-[var(--color-ink-2)]">{body}</p>
      {schema && (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-white/70 px-2 py-1.5 font-mono text-[9.5px] leading-relaxed text-[var(--color-ink-2)]">{schema}</pre>
      )}
    </div>
  );
}
