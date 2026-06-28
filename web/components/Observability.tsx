"use client";
import { useEffect, useState } from "react";
import { runsFor, scoreOf, failureBreakdown, TAG_FIX, useAether } from "@/lib/useAether";
import { COMPETITORS, FAILURE_LABEL, FailureTag, isCompetitor, Run, toolLabel } from "@/lib/schema";

const COL = { you: "#FF6600", comp: "#8A98AD", diy: "#D8D4CA" };

function split(runs: Run[]) {
  const n = runs.length;
  return {
    n,
    you: runs.filter((r) => r.chosenTool === "orangeslice").length,
    comp: runs.filter((r) => isCompetitor(r.chosenTool)).length,
    diy: runs.filter((r) => r.chosenTool === "self").length,
  };
}

function Donut({ you, comp, diy, n }: { you: number; comp: number; diy: number; n: number }) {
  const R = 56, S = 22, C = 2 * Math.PI * R;
  const segs = [{ v: you, c: COL.you }, { v: comp, c: COL.comp }, { v: diy, c: COL.diy }];
  let offset = 0;
  const total = n || 1;
  return (
    <svg width={150} height={150} viewBox="0 0 150 150" className="shrink-0">
      <g transform="translate(75,75) rotate(-90)">
        <circle r={R} fill="none" stroke="var(--color-panel-2)" strokeWidth={S} />
        {segs.map((s, i) => {
          const len = (s.v / total) * C;
          const el = <circle key={i} r={R} fill="none" stroke={s.c} strokeWidth={S} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </g>
      <text x="75" y="71" textAnchor="middle" className="fill-[var(--color-ink)]" style={{ font: "700 26px var(--font-display)" }}>
        {Math.round((you / total) * 100)}%
      </text>
      <text x="75" y="90" textAnchor="middle" className="fill-[var(--color-ink-3)]" style={{ font: "10px var(--font-mono)" }}>
        chose you
      </text>
    </svg>
  );
}

export function Observability() {
  const { version, model } = useAether();
  const cell = runsFor(model, version);
  const s = split(cell);
  const n = s.n || 1;
  const youPct = Math.round((s.you / n) * 100);
  const compPct = Math.round((s.comp / n) * 100);
  const diyPct = Math.round((s.diy / n) * 100);
  const baseline = Math.round(scoreOf(model, 1).usageRate * 100);

  const bd = failureBreakdown(model, version);
  const topTag = (Object.keys(bd) as FailureTag[]).filter((t) => bd[t] > 0).sort((a, b) => bd[b] - bd[a])[0];

  const byPhrasing = Array.from(new Set(cell.map((r) => r.phrasing))).map((p) => {
    const g = cell.filter((r) => r.phrasing === p);
    return { phrasing: p, runs: g, ...split(g), splitKind: g[0]?.split };
  });

  const [openP, setOpenP] = useState<string | null>(null);
  useEffect(() => {
    if (!openP) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenP(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openP]);
  const sel = byPhrasing.find((p) => p.phrasing === openP);

  // exactly which competitors it called
  const compCounts = COMPETITORS.map((c) => ({
    ...c,
    v: cell.filter((r) => r.chosenTool === c.id).length,
  })).filter((c) => c.v > 0).sort((a, b) => b.v - a.v);

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-[720px] font-sans text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        Every run is observed. This is exactly what an OpenAI agent reached for over {s.n} runs:
        you, the named competitors it called instead, and the agent doing it itself. Agents prefer
        their own tools, so the honest game is moving a stubborn number.
      </p>

      {/* donut + legend */}
      <div className="grid items-center gap-6 rounded-xl border border-[var(--color-line)] bg-white p-5 sm:grid-cols-[150px_1fr]">
        <Donut you={s.you} comp={s.comp} diy={s.diy} n={s.n} />
        <div className="flex flex-col gap-2.5">
          <Row c={COL.you} label="OrangeSlice (you)" v={s.you} n={s.n} pct={youPct} bold />
          <Row c={COL.comp} label="Competitors (named below)" v={s.comp} n={s.n} pct={compPct} />
          <Row c={COL.diy} label="General-purpose agent (did it itself)" v={s.diy} n={s.n} pct={diyPct} />
        </div>
      </div>

      {/* exactly which competitors it called */}
      {compCounts.length > 0 && (
        <div>
          <span className="eyebrow">Who it called instead · named competitors</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {compCounts.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: COL.comp }} />
                <span className="font-sans text-[12.5px] font-medium text-[var(--color-ink)]">{c.name}</span>
                <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{c.v} runs · {Math.round((c.v / n) * 100)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* what this proves */}
      <div className="rounded-xl border-l-2 border-[var(--color-yc)] bg-[var(--color-yc-wash)] px-4 py-3">
        <div className="eyebrow !text-[var(--color-yc-deep)]">What this proves</div>
        <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
          Agents default to their own general-purpose tools. The win is real but bounded: when an
          agent needs to find buyers, it reaches for{" "}
          <span className="font-semibold text-[var(--color-ink)]">OrangeSlice {youPct}% of the time</span>
          , up from {baseline}%, while it still falls back to its own tools {diyPct}% of the time.
        </p>
      </div>

      {/* per-search, clickable */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Per search · click to see every run</span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{byPhrasing.length} searches</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--color-line)]">
          {byPhrasing.map((p) => (
            <button
              key={p.phrasing}
              onClick={() => setOpenP(p.phrasing)}
              className="grid w-full grid-cols-[1fr_56px_1fr_16px] items-center gap-3 border-b border-[var(--color-line)] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-[var(--color-panel)]"
            >
              <span className="truncate font-sans text-[12px] text-[var(--color-ink)]">{p.phrasing}</span>
              <span className="font-mono text-[10px] text-[var(--color-ink-3)]">{p.splitKind}</span>
              <div className="flex h-4 overflow-hidden rounded">
                <Bar v={p.you} n={p.n} c={COL.you} />
                <Bar v={p.comp} n={p.n} c={COL.comp} />
                <Bar v={p.diy} n={p.n} c={COL.diy} />
              </div>
              <span className="text-[var(--color-line-2)]">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* trend */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3">
        <div className="eyebrow">Trend · your biggest lever</div>
        {topTag ? (
          <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
            Your most expensive leak is{" "}
            <span className="font-semibold text-[var(--color-ink)]">{FAILURE_LABEL[topTag]}</span> on{" "}
            {bd[topTag]} runs. {TAG_FIX[topTag].fix} Close it and usage keeps climbing.
          </p>
        ) : (
          <p className="mt-1 font-sans text-[13.5px] text-[var(--color-ink-2)]">
            No leak worth fixing remains at this footprint. You have converged.
          </p>
        )}
      </div>

      {/* per-search drilldown modal */}
      {sel && openP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 [animation:fadein_.15s_ease]" onClick={() => setOpenP(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(20,17,13,0.45)" }} />
          <div className="relative flex max-h-[86vh] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] px-5 py-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-3)]">
                  search · {sel.splitKind} · {sel.n} runs · OpenAI
                </div>
                <h3 className="mt-1 max-w-[520px] font-display text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
                  “{sel.phrasing}”
                </h3>
                <div className="mt-1 font-mono text-[11px] text-[var(--color-ink-2)]">
                  you {Math.round((sel.you / sel.n) * 100)}% · competitor {Math.round((sel.comp / sel.n) * 100)}% · itself {Math.round((sel.diy / sel.n) * 100)}%
                </div>
              </div>
              <button onClick={() => setOpenP(null)} className="rounded-md px-2 py-1 font-mono text-[14px] text-[var(--color-ink-3)] hover:bg-[var(--color-panel-2)]">✕</button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-1.5">
                {sel.runs.map((r, i) => {
                  const won = r.chosenTool === "orangeslice" && r.returnedUsableData;
                  return (
                    <div key={r.id} className="rounded-lg border border-[var(--color-line)] px-3 py-2" style={{ background: won ? "var(--color-yc-wash)" : "white" }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-[var(--color-ink-3)]">run {i + 1} · {r.model === "gpt" ? "OpenAI" : "Claude"}</span>
                        <span className="font-mono text-[10px] font-semibold uppercase" style={{ color: won ? "var(--color-yc-deep)" : "var(--color-ink-2)" }}>
                          {r.chosenTool === "orangeslice" ? "used you" : toolLabel(r.chosenTool)} · {r.failureTag ? FAILURE_LABEL[r.failureTag] : "execution"}
                        </span>
                      </div>
                      <p className="mt-1 font-sans text-[12px] leading-snug text-[var(--color-ink-2)]">“{r.reasoningExcerpt}”</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ c, label, v, n, pct, bold }: { c: string; label: string; v: number; n: number; pct: number; bold?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: c }} />
      <span className="flex-1 font-sans text-[13px]" style={{ color: bold ? "var(--color-ink)" : "var(--color-ink-2)", fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{v}/{n}</span>
      <span className="tnum w-10 text-right font-mono text-[13px] font-bold" style={{ color: bold ? "var(--color-yc-deep)" : "var(--color-ink-2)" }}>{pct}%</span>
    </div>
  );
}

function Bar({ v, n, c }: { v: number; n: number; c: string }) {
  return <div style={{ width: `${n ? (v / n) * 100 : 0}%`, background: c }} />;
}
