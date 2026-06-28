"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { failureBreakdown, runsFor, TAG_FIX, useAether } from "@/lib/useAether";
import { FAILURE_LABEL, FAILURE_TAGS, FailureTag, TOOL_LABEL } from "@/lib/schema";

const TAG_COLOR: Record<FailureTag, string> = {
  not_found: "#8C887F",
  desc_vague: "#B9912E",
  i_can_do_this_myself: "#5A4FCF",
  picked_competitor: "#8A98AD",
  auth_friction: "#D64545",
};

const DEFN: Record<FailureTag, { what: string; detect: string }> = {
  not_found: {
    what: "The agent never surfaced you. You weren't in what its search returned, so you were never even a candidate for the job.",
    detect: "Tagged when the run's reasoning shows no awareness of your tool at all.",
  },
  desc_vague: {
    what: "The agent found you but couldn't tell that you do the job, or how to call you, so it moved on.",
    detect: "Tagged when the reasoning mentions you but is unsure what you do or how to invoke you.",
  },
  i_can_do_this_myself: {
    what: "The agent judged it could finish the job with its own general-purpose tools. This is the hardest reason to beat, agents prefer their own tools.",
    detect: "Tagged when the reasoning says it will assemble the result itself.",
  },
  picked_competitor: {
    what: "The agent chose a rival tool over you, usually because the rival read as the cleaner fit.",
    detect: "Tagged when the reasoning names the competitor as the better choice.",
  },
  auth_friction: {
    what: "The agent tried you, but the call needed setup it couldn't complete, so it abandoned the call.",
    detect: "Tagged when the reasoning shows a 401, a key prompt, or a setup blocker.",
  },
};

export function DiagnosisPanel() {
  const { model, version, feed } = useAether();
  const bd = failureBreakdown(model, version);
  const total = FAILURE_TAGS.reduce((s, t) => s + bd[t], 0) || 1;
  const ranked = [...FAILURE_TAGS].sort((a, b) => bd[b] - bd[a]);
  const [open, setOpen] = useState<FailureTag>(ranked[0]);

  const allForModel = [1, 2, 3].flatMap((v) => runsFor(model, v));
  const examples = allForModel.filter((r) => r.failureTag === open).slice(0, 3);
  const fix = TAG_FIX[open];
  const fixed = version >= fix.version;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-[13px] text-[var(--color-ink-2)]">
        A labeler reads each run&apos;s reasoning and tags{" "}
        <span className="text-[var(--color-ink)]">why you lost the run.</span> Click a reason to see
        exactly how it shows up and what fixes it.
      </p>

      {/* clickable tag bars */}
      <div className="space-y-1.5">
        {ranked.map((t) => {
          const frac = bd[t] / total;
          const active = t === open;
          return (
            <button
              key={t}
              onClick={() => setOpen(t)}
              className="flex w-full items-center gap-3 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-[var(--color-panel)]"
              style={{ background: active ? "var(--color-panel)" : "transparent" }}
            >
              <span className="w-[112px] shrink-0 font-mono text-[11px]" style={{ color: active ? "var(--color-ink)" : "var(--color-ink-2)" }}>
                {FAILURE_LABEL[t]}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--color-panel-2)]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: TAG_COLOR[t] }}
                  animate={{ width: `${frac * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="tnum w-6 shrink-0 text-right font-mono text-[11px] text-[var(--color-ink-2)]">{bd[t]}</span>
              <span className="text-[var(--color-line-2)]">{active ? "▾" : "›"}</span>
            </button>
          );
        })}
      </div>

      {/* detail for the selected reason */}
      <motion.div
        key={open}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: TAG_COLOR[open] }} />
          <span className="font-display text-[15px] font-semibold text-[var(--color-ink)]">{FAILURE_LABEL[open]}</span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
            style={{
              background: fixed ? "#E8F5EE" : "var(--color-panel-2)",
              color: fixed ? "var(--color-good)" : "var(--color-ink-3)",
            }}
          >
            {fixed ? "✓ fixed" : `addressed in v${fix.version}`}
          </span>
        </div>

        <h4 className="mt-3 font-display text-[12.5px] font-bold text-[var(--color-ink)]">What it means</h4>
        <p className="mt-0.5 font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">{DEFN[open].what}</p>

        <h4 className="mt-3 font-display text-[12.5px] font-bold text-[var(--color-ink)]">How we detect it</h4>
        <p className="mt-0.5 font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">{DEFN[open].detect}</p>

        <h4 className="mt-3 font-display text-[12.5px] font-bold text-[var(--color-ink)]">How we fix it</h4>
        <p className="mt-0.5 font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">{fix.fix}</p>

        {examples.length > 0 && (
          <>
            <h4 className="mt-3 font-display text-[12.5px] font-bold text-[var(--color-ink)]">Real agent reasoning</h4>
            <div className="mt-1 flex flex-col gap-1.5">
              {examples.map((r, i) => (
                <p key={i} className="rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 font-sans text-[11.5px] leading-snug text-[var(--color-ink-2)]">
                  “{r.reasoningExcerpt}”
                </p>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* live feed */}
      <div className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Live runs</span>
          <span className="eyebrow !tracking-normal !lowercase">reasoning, as it streams</span>
        </div>
        <div className="relative h-[200px] overflow-hidden rounded-lg border border-[var(--color-line)] bg-white">
          <div className="h-full overflow-y-auto p-2">
            {feed.map((r) => {
              const won = r.chosenTool === "orangeslice" && r.returnedUsableData;
              return (
                <div
                  key={r.id}
                  className="mb-1.5 rounded-md border border-[var(--color-line)] px-2.5 py-1.5 [animation:fadein_.3s_ease]"
                  style={{ background: won ? "var(--color-yc-wash)" : "transparent" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: won ? "var(--color-yc-deep)" : "var(--color-ink-3)" }}
                    >
                      {won ? "● used OrangeSlice" : `○ ${TOOL_LABEL[r.chosenTool]}`}
                    </span>
                    <span className="font-mono text-[9px] uppercase text-[var(--color-ink-3)]">
                      {r.split} · {r.failureTag ? FAILURE_LABEL[r.failureTag] : "execution"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 font-sans text-[11px] leading-snug text-[var(--color-ink-2)]">
                    “{r.reasoningExcerpt}”
                  </p>
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
