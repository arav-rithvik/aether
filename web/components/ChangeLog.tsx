"use client";
import { motion } from "framer-motion";
import { DESCRIPTIONS, useAether } from "@/lib/useAether";

export function ChangeLog() {
  const { version, setVersion } = useAether();
  const desc = DESCRIPTIONS.find((d) => d.version === version) ?? DESCRIPTIONS[0];

  return (
    <div className="flex h-full flex-col">
      {/* version rail */}
      <div className="mb-3 flex items-center gap-1">
        {DESCRIPTIONS.map((d) => {
          const active = d.version === version;
          return (
            <button
              key={d.version}
              onClick={() => setVersion(d.version)}
              className="group flex items-center gap-2"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-[12px] font-semibold transition-colors"
                style={{
                  background: active ? "var(--color-yc)" : "var(--color-panel-2)",
                  color: active ? "#fff" : "var(--color-ink-3)",
                }}
              >
                v{d.version}
              </span>
              {d.version < DESCRIPTIONS.length && (
                <span className="font-mono text-[var(--color-ink-3)]">→</span>
              )}
            </button>
          );
        })}
        <span className="ml-auto eyebrow">the door, rewritten</span>
      </div>

      <motion.div
        key={desc.version}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        <div className="rounded-lg border border-[var(--color-line)] bg-white p-3.5">
          <div className="font-mono text-[11px] font-semibold text-[var(--color-ink)]">
            {desc.name}
          </div>
          <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">
            {desc.description}
          </p>
          {desc.schema !== "—" && (
            <pre className="mt-2.5 overflow-x-auto whitespace-pre-wrap rounded-md bg-[var(--color-panel-2)] px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-[var(--color-ink-2)]">
              {desc.schema}
            </pre>
          )}
        </div>

        <div className="rounded-lg border-l-2 border-[var(--color-yc)] bg-[var(--color-yc-wash)] px-3.5 py-2.5">
          <div className="eyebrow !text-[var(--color-yc-deep)]">
            {desc.version === 1 ? "Starting point" : `Why v${desc.version}`}
          </div>
          <p className="mt-1 font-sans text-[12px] leading-relaxed text-[var(--color-ink-2)]">
            {desc.changeReason}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
