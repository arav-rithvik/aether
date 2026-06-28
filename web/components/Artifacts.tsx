"use client";
import { motion } from "framer-motion";
import { CORPUS, useAether } from "@/lib/useAether";

export function Artifacts() {
  const { version } = useAether();
  const corpus = version === 1 ? CORPUS.weak : CORPUS.optimized;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-sans text-[13px] text-[var(--color-ink-2)]">
        What the agent&apos;s search tool returns for the job. These are the documents Aether{" "}
        <span className="text-[var(--color-ink)]">writes and controls on your behalf</span> — your
        footprint as the agent sees it.
      </p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-[var(--color-ink-3)]">corpus:</span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
          style={{
            background: version === 1 ? "var(--color-panel-2)" : "var(--color-yc-wash)",
            color: version === 1 ? "var(--color-ink-2)" : "var(--color-yc-deep)",
          }}
        >
          {version === 1 ? "weak (untouched)" : "optimized"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {corpus.docs.map((d) => {
          const isYou = d.url.includes("orangeslice");
          return (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg border p-2.5"
              style={{
                borderColor: isYou ? "var(--color-yc)" : "var(--color-line)",
                background: isYou ? "var(--color-yc-wash)" : "white",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold text-[var(--color-ink)]">
                  {d.title}
                </span>
                {isYou && (
                  <span className="shrink-0 rounded-full bg-[var(--color-yc)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                    YOU
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-[var(--color-ink-3)]">{d.url}</div>
              <p className="mt-1 font-sans text-[11.5px] leading-snug text-[var(--color-ink-2)]">
                {d.body}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
