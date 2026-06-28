"use client";
import { AnimatePresence, motion } from "framer-motion";
import { failureBreakdown, useAether } from "@/lib/useAether";
import { FAILURE_LABEL, FAILURE_TAGS, FailureTag, TOOL_LABEL } from "@/lib/schema";

const TAG_COLOR: Record<FailureTag, string> = {
  not_found: "#8C887F",
  desc_vague: "#B9912E",
  i_can_do_this_myself: "#5A4FCF",
  picked_competitor: "#8A98AD",
  auth_friction: "#D64545",
};

export function DiagnosisPanel() {
  const { model, version, feed } = useAether();
  const bd = failureBreakdown(model, version);
  const total = FAILURE_TAGS.reduce((s, t) => s + bd[t], 0) || 1;
  const ranked = [...FAILURE_TAGS].sort((a, b) => bd[b] - bd[a]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-sans text-[13px] text-[var(--color-ink-2)]">
          A small labeler reads each run&apos;s reasoning and tags{" "}
          <span className="text-[var(--color-ink)]">why OrangeSlice lost.</span> These tags drive the next rewrite.
        </p>
        <div className="mt-3 space-y-2">
          {ranked.map((t) => {
            const frac = bd[t] / total;
            return (
              <div key={t} className="flex items-center gap-3">
                <span className="w-[112px] shrink-0 font-mono text-[11px] text-[var(--color-ink-2)]">
                  {FAILURE_LABEL[t]}
                </span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[var(--color-panel-2)]">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: TAG_COLOR[t] }}
                    animate={{ width: `${frac * 100}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="tnum w-7 shrink-0 text-right font-mono text-[11px] text-[var(--color-ink-3)]">
                  {bd[t]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Live runs</span>
          <span className="eyebrow !tracking-normal !lowercase">reasoning, as it streams</span>
        </div>
        <div className="relative h-[240px] overflow-hidden rounded-lg border border-[var(--color-line)] bg-white">
          <div className="h-full overflow-y-auto p-2">
            <AnimatePresence initial={false}>
              {feed.map((r) => {
                const won = r.chosenTool === "orangeslice" && r.returnedUsableData;
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mb-1.5 rounded-md border border-[var(--color-line)] px-2.5 py-1.5"
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
