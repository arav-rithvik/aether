"use client";
import { mathFor, useAether, TOTAL_VERSIONS } from "@/lib/useAether";
import { FAILURE_LABEL, MODELS, ModelId, TOOL_LABEL } from "@/lib/schema";

export function DemoConsole() {
  const { version, setVersion, model, setModel, playing, play, feed } = useAether();
  const m = mathFor(model, version);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
      {/* command bar — the job an agent is given */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
        <span className="text-[var(--color-yc)]">✦</span>
        <span className="min-w-0 flex-1 truncate font-sans text-[14px] text-[var(--color-ink)]">
          find me 20 high-intent buyers and start outreach
        </span>

        {/* model toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-[var(--color-line)] p-0.5">
          {MODELS.map((mm) => (
            <button
              key={mm.id}
              onClick={() => setModel(mm.id as ModelId)}
              className="rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors"
              style={{
                background: model === mm.id ? "var(--color-ink)" : "transparent",
                color: model === mm.id ? "#fff" : "var(--color-ink-2)",
              }}
            >
              {mm.label}
            </button>
          ))}
        </div>

        {/* version stepper */}
        <div className="flex items-center gap-0.5 rounded-lg border border-[var(--color-line)] p-0.5">
          {Array.from({ length: TOTAL_VERSIONS }, (_, i) => i + 1).map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className="rounded-md px-2 py-1 font-mono text-[11px] transition-colors"
              style={{
                background: v === version ? "var(--color-panel-2)" : "transparent",
                color: v === version ? "var(--color-ink)" : "var(--color-ink-3)",
              }}
            >
              v{v}
            </button>
          ))}
        </div>

        <button
          onClick={play}
          disabled={playing}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-sans text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: "var(--color-yc)" }}
        >
          {playing ? "optimizing…" : "Run wind tunnel →"}
        </button>
      </div>

      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[var(--color-ink)] px-2 py-1 font-sans text-[11px] font-semibold text-white">
            All runs
          </span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{m.n} runs · iteration {version}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--color-ink-2)]">
          <span>
            used you{" "}
            <span className="font-bold text-[var(--color-yc-deep)]">{Math.round(m.rate * 100)}%</span>
          </span>
          <span className="hidden text-[var(--color-ink-3)] sm:inline">·</span>
          <span className="hidden text-[var(--color-ink-3)] sm:inline">⛁ Filter</span>
          <span className="hidden text-[var(--color-ink-3)] sm:inline">⇅ Sort</span>
        </div>
      </div>

      {/* table header */}
      <div className="grid grid-cols-[28px_1fr_64px_110px_90px] gap-3 border-b border-[var(--color-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-3)] md:grid-cols-[28px_1.1fr_64px_120px_84px_1.4fr]">
        <span>#</span>
        <span>task phrasing</span>
        <span>model</span>
        <span>agent chose</span>
        <span>result</span>
        <span className="hidden md:block">reasoning</span>
      </div>

      {/* rows */}
      <div className="max-h-[420px] overflow-y-auto">
        {feed.map((r, i) => {
          const won = r.chosenTool === "orangeslice" && r.returnedUsableData;
          return (
            <div
              key={r.id}
              className="grid grid-cols-[28px_1fr_64px_110px_90px] items-center gap-3 border-b border-[var(--color-line)] px-4 py-2.5 text-[12px] [animation:fadein_.3s_ease] md:grid-cols-[28px_1.1fr_64px_120px_84px_1.4fr]"
              style={{ background: won ? "var(--color-yc-wash)" : "transparent" }}
            >
              <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{i + 1}</span>
              <span className="truncate font-sans text-[var(--color-ink)]">{r.phrasing}</span>
              <span className="font-mono text-[11px] text-[var(--color-ink-2)]">
                {r.model === "gpt" ? "GPT-5" : "Claude"}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background:
                      r.chosenTool === "orangeslice"
                        ? "var(--color-yc)"
                        : r.chosenTool === "leadgenius"
                        ? "var(--color-steel)"
                        : "var(--color-diy)",
                  }}
                />
                <span
                  className="truncate font-sans text-[12px]"
                  style={{
                    color: won ? "var(--color-yc-deep)" : "var(--color-ink-2)",
                    fontWeight: won ? 600 : 400,
                  }}
                >
                  {r.chosenTool === "orangeslice" ? "OrangeSlice" : TOOL_LABEL[r.chosenTool]}
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {won ? (
                  <span className="text-[var(--color-good)]">✓ leads</span>
                ) : (
                  <span className="text-[var(--color-ink-3)]">
                    {r.failureTag ? "✗" : "—"}
                  </span>
                )}
              </span>
              <span className="hidden truncate font-sans text-[11.5px] text-[var(--color-ink-3)] md:block">
                {r.failureTag ? `${FAILURE_LABEL[r.failureTag]} — ` : ""}
                {r.reasoningExcerpt}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
