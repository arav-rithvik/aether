"use client";
import { useAether, TOTAL_VERSIONS, TOTAL_RUNS, SWARM_SIZE } from "@/lib/useAether";

export function StatusRail() {
  const { version, setVersion, playing, play } = useAether();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(255,255,255,0.82)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-5 py-3">
        {/* wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-6 w-6 items-center justify-center">
            <span className="absolute inset-0 rounded-md" style={{ background: "var(--color-yc)" }} />
            <span className="relative font-display text-[13px] font-bold text-white">Æ</span>
          </span>
          <div className="leading-none">
            <div className="font-display text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
              Aether
            </div>
          </div>
          <span className="ml-1 hidden rounded-full bg-[var(--color-panel-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-3)] sm:inline">
            Agent Awareness Optimization
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* live indicator */}
          <div className="hidden items-center gap-1.5 font-mono text-[11px] text-[var(--color-ink-3)] md:flex">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-yc)]" />
            {SWARM_SIZE}-agent swarm · {TOTAL_RUNS} runs
          </div>

          {/* version stepper */}
          <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-line)] bg-white p-0.5">
            {Array.from({ length: TOTAL_VERSIONS }, (_, i) => i + 1).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className="rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors"
                style={{
                  background: v === version ? "var(--color-ink)" : "transparent",
                  color: v === version ? "#fff" : "var(--color-ink-3)",
                }}
              >
                v{v}
              </button>
            ))}
          </div>

          {/* the money button */}
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
        </div>
      </div>
    </header>
  );
}
