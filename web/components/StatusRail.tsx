"use client";
import { useAether, TOTAL_VERSIONS, TOTAL_RUNS, SWARM_SIZE } from "@/lib/useAether";

export function StatusRail() {
  const { version, setVersion, playing, play } = useAether();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(255,255,255,0.85)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-5 py-3">
        {/* product wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-md" style={{ background: "var(--color-yc)" }} />
            <span className="relative font-display text-[13px] font-bold text-white">Æ</span>
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
            Aether
          </span>
        </div>

        {/* workspace switcher — you are inside OrangeSlice's account */}
        <span className="mx-1 text-[var(--color-line-2)]">/</span>
        <button className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 transition-colors hover:bg-[var(--color-panel-2)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--color-yc)] font-mono text-[10px] font-bold text-white">
            OS
          </span>
          <span className="font-sans text-[13px] font-semibold text-[var(--color-ink)]">OrangeSlice</span>
          <span className="hidden font-mono text-[10px] text-[var(--color-ink-3)] sm:inline">workspace</span>
          <span className="text-[var(--color-ink-3)]">▾</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-1.5 font-mono text-[11px] text-[var(--color-ink-2)] lg:flex">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
            {SWARM_SIZE}-agent swarm · {TOTAL_RUNS} runs
          </div>

          <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-line)] bg-white p-0.5">
            {Array.from({ length: TOTAL_VERSIONS }, (_, i) => i + 1).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className="rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors"
                style={{
                  background: v === version ? "var(--color-ink)" : "transparent",
                  color: v === version ? "#fff" : "var(--color-ink-2)",
                }}
              >
                v{v}
              </button>
            ))}
          </div>

          <button
            onClick={play}
            disabled={playing}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[12px] font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-yc)" }}
          >
            {playing ? (
              <>
                <span className="live-dot">●</span> optimizing…
              </>
            ) : (
              <>▶ Run wind tunnel</>
            )}
          </button>

          {/* signed-in account */}
          <span className="hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line-2)] bg-[var(--color-panel-2)] font-mono text-[11px] font-bold text-[var(--color-ink-2)] sm:flex">
            OS
          </span>
        </div>
      </div>
    </header>
  );
}
