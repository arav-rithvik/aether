"use client";
import { useEffect, useRef, useState } from "react";
import { runsFor, useAether, TOTAL_VERSIONS } from "@/lib/useAether";
import { FAILURE_LABEL, isCompetitor, Run, toolLabel } from "@/lib/schema";
import { SPONSORS } from "@/lib/mockData";
import { OrangeSliceMark } from "./OrangeSliceMark";

// A test fires 100 runs: every phrasing, repeated, across models.
// GPT-4o and GPT-4o-mini rows are both live.
function testBatch(version: number): Run[] {
  const g = runsFor("gpt-4o", version);
  const c = runsFor("gpt-4o-mini", version);
  const out: Run[] = [];
  for (let i = 0; i < Math.max(g.length, c.length); i++) {
    if (g[i]) out.push(g[i]);
    if (c[i]) out.push(c[i]);
  }
  return out;
}

type Status = "idle" | "running" | "done";

export function DemoConsole() {
  const { version, setVersion } = useAether();
  const [status, setStatus] = useState<Status>("idle");
  const [shown, setShown] = useState<Run[]>([]);
  const [progress, setProgress] = useState(0);
  const batch = useRef<Run[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  // autonomous: the engine runs the test itself on load (and stays re-runnable)
  useEffect(() => {
    const id = setTimeout(() => runTest(), 600);
    return () => {
      clearTimeout(id);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runTest(v: number = version) {
    stop();
    batch.current = testBatch(v);
    setShown([]);
    setProgress(0);
    setStatus("running");
    let i = 0;
    timer.current = setInterval(() => {
      if (i >= batch.current.length) {
        stop();
        setStatus("done");
        return;
      }
      const r = batch.current[i++];
      setShown((prev) => [r, ...prev]);
      setProgress(i);
    }, 45);
  }

  const total = batch.current.length || testBatch(version).length;
  const used = shown.filter((r) => r.chosenTool === "orangeslice" && r.returnedUsableData).length;
  const rate = shown.length ? Math.round((used / shown.length) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
      {/* test setup */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
        <OrangeSliceMark size={26} />
        <div className="min-w-0 flex-1">
          <div className="font-sans text-[14px] font-semibold text-[var(--color-ink)]">
            Test: does an agent pick OrangeSlice?
          </div>
          <div className="truncate font-mono text-[11.5px] text-[var(--color-ink-3)]">
            runs automatically · re-tests as models drift · GPT-4o · GPT-4o-mini agents
          </div>
        </div>

        {/* autonomous chain-trigger status (also fires on click) */}
        <button
          onClick={() => runTest()}
          disabled={status === "running"}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-[12px] font-semibold text-white transition-opacity disabled:opacity-90"
          style={{ background: "var(--color-yc)" }}
        >
          {status === "running" ? `chain triggered · ${progress}/${total}` : "Waiting for Chain Trigger"}
        </button>

        {/* black demo button: steps the footprint and re-runs */}
        <button
          onClick={() => {
            const nv = version >= TOTAL_VERSIONS ? 1 : version + 1;
            setVersion(nv);
            runTest(nv);
          }}
          disabled={status === "running"}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-ink)] px-3.5 py-2 font-sans text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          ▶ Demo
        </button>
      </div>

      {/* progress + result */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[var(--color-ink)] px-2 py-1 font-sans text-[11px] font-semibold text-white">
            Runs
          </span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
            {shown.length}/{total} · footprint v{version}
          </span>
        </div>
        <span className="font-mono text-[11px] text-[var(--color-ink-2)]">
          {status === "idle" ? (
            "click Run test to fire 100 real runs"
          ) : (
            <>
              OrangeSlice used{" "}
              <span className="font-bold text-[var(--color-yc-deep)]">
                {used}/{shown.length} = {rate}%
              </span>
            </>
          )}
        </span>
      </div>

      {/* thin progress bar */}
      <div className="h-0.5 w-full bg-[var(--color-line)]">
        <div
          className="h-full bg-[var(--color-yc)] transition-[width] duration-100"
          style={{ width: `${total ? (shown.length / total) * 100 : 0}%` }}
        />
      </div>

      {/* header */}
      <div className="grid grid-cols-[28px_1fr_64px_120px_84px] gap-3 border-b border-[var(--color-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-3)] md:grid-cols-[28px_1.1fr_64px_120px_84px_1.4fr]">
        <span>#</span>
        <span>task phrasing</span>
        <span>agent</span>
        <span>chose</span>
        <span>result</span>
        <span className="hidden md:block">reasoning</span>
      </div>

      {/* rows */}
      <div className="max-h-[420px] min-h-[160px] overflow-y-auto">
        {status === "idle" && (
          <div className="flex h-[160px] flex-col items-center justify-center gap-1 text-center">
            <span className="font-sans text-[13px] text-[var(--color-ink-2)]">
              The engine runs this on its own schedule. Starting…
            </span>
            <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
              100 phrasings of the same job, through real agents, results stream in live.
            </span>
          </div>
        )}
        {shown.map((r, i) => {
          const won = r.chosenTool === "orangeslice" && r.returnedUsableData;
          return (
            <div
              key={r.id}
              className="grid grid-cols-[28px_1fr_64px_120px_84px] items-center gap-3 border-b border-[var(--color-line)] px-4 py-2.5 text-[12px] [animation:fadein_.25s_ease] md:grid-cols-[28px_1.1fr_64px_120px_84px_1.4fr]"
              style={{ background: won ? "var(--color-yc-wash)" : "transparent" }}
            >
              <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{shown.length - i}</span>
              <span className="truncate font-sans text-[var(--color-ink)]">{r.phrasing}</span>
              <span className="font-mono text-[11px] text-[var(--color-ink-2)]">
                {r.model === "gpt-4o" ? "GPT-4o" : "GPT-4o-mini"}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background:
                      r.chosenTool === "orangeslice"
                        ? "var(--color-yc)"
                        : isCompetitor(r.chosenTool)
                        ? "var(--color-steel)"
                        : "var(--color-diy)",
                  }}
                />
                <span
                  className="truncate font-sans text-[12px]"
                  style={{ color: won ? "var(--color-yc-deep)" : "var(--color-ink-2)", fontWeight: won ? 600 : 400 }}
                >
                  {toolLabel(r.chosenTool)}
                </span>
              </span>
              <span className="font-mono text-[11px]">
                {won ? (
                  <span className="text-[var(--color-good)]">✓ leads</span>
                ) : (
                  <span className="text-[var(--color-ink-3)]">{r.failureTag ? "✗" : "·"}</span>
                )}
              </span>
              <span className="hidden truncate font-sans text-[11.5px] text-[var(--color-ink-3)] md:block">
                {r.failureTag ? `${FAILURE_LABEL[r.failureTag]}. ` : ""}
                {r.reasoningExcerpt}
              </span>
            </div>
          );
        })}
      </div>

      {/* footer: the menu of customers */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5">
        <span className="font-mono text-[10.5px] text-[var(--color-ink-3)]">also testable:</span>
        {SPONSORS.filter((s) => !s.hero).map((s) => (
          <span
            key={s.name}
            className="rounded-md border border-[var(--color-line)] bg-white px-2 py-0.5 font-mono text-[10.5px] text-[var(--color-ink-3)]"
          >
            {s.name}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10.5px] text-[var(--color-ink-3)]">
          compute sponsored by the customer
        </span>
      </div>
    </div>
  );
}
