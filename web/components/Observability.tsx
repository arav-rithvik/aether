"use client";
import { runsFor, scoreOf, failureBreakdown, TAG_FIX, useAether } from "@/lib/useAether";
import { FAILURE_LABEL, FailureTag, Run } from "@/lib/schema";

const COL = { you: "#FF6600", comp: "#8A98AD", diy: "#D8D4CA" };

function split(runs: Run[]) {
  const n = runs.length;
  const you = runs.filter((r) => r.chosenTool === "orangeslice").length;
  const comp = runs.filter((r) => r.chosenTool === "leadgenius").length;
  const diy = runs.filter((r) => r.chosenTool === "self").length;
  return { n, you, comp, diy };
}

// SVG donut from three counts
function Donut({ you, comp, diy, n }: { you: number; comp: number; diy: number; n: number }) {
  const R = 56, S = 22, C = 2 * Math.PI * R;
  const segs = [
    { v: you, c: COL.you },
    { v: comp, c: COL.comp },
    { v: diy, c: COL.diy },
  ];
  let offset = 0;
  const total = n || 1;
  return (
    <svg width={150} height={150} viewBox="0 0 150 150" className="shrink-0">
      <g transform="translate(75,75) rotate(-90)">
        <circle r={R} fill="none" stroke="var(--color-panel-2)" strokeWidth={S} />
        {segs.map((s, i) => {
          const len = (s.v / total) * C;
          const el = (
            <circle
              key={i}
              r={R}
              fill="none"
              stroke={s.c}
              strokeWidth={S}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="75" y="71" textAnchor="middle" className="fill-[var(--color-ink)]" style={{ font: "700 26px var(--font-display)" }}>
        {total ? Math.round((you / total) * 100) : 0}%
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

  // per-search breakdown (the excessive, drillable data)
  const byPhrasing = Array.from(new Set(cell.map((r) => r.phrasing))).map((p) => {
    const g = cell.filter((r) => r.phrasing === p);
    return { phrasing: p, ...split(g), split: g[0]?.split };
  });

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-[720px] font-sans text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        Every run is observed. This is exactly what an OpenAI agent reached for when sent to do the
        job, over {s.n} runs, broken down against your competitor and the agent doing it itself.
      </p>

      {/* donut + legend/compare */}
      <div className="grid items-center gap-6 rounded-xl border border-[var(--color-line)] bg-white p-5 sm:grid-cols-[150px_1fr]">
        <Donut you={s.you} comp={s.comp} diy={s.diy} n={s.n} />
        <div className="flex flex-col gap-2.5">
          <Row c={COL.you} label="OrangeSlice (you)" v={s.you} n={s.n} pct={youPct} bold />
          <Row c={COL.comp} label="LeadGenius (competitor)" v={s.comp} n={s.n} pct={compPct} />
          <Row c={COL.diy} label="General-purpose agent (did it itself)" v={s.diy} n={s.n} pct={diyPct} />
        </div>
      </div>

      {/* what this proves */}
      <div className="rounded-xl border-l-2 border-[var(--color-yc)] bg-[var(--color-yc-wash)] px-4 py-3">
        <div className="eyebrow !text-[var(--color-yc-deep)]">What this proves</div>
        <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
          Most teams assume an agent would default to its own general-purpose tools. The data says
          otherwise: when an agent needs to find buyers, it reaches for{" "}
          <span className="font-semibold text-[var(--color-ink)]">OrangeSlice {youPct}% of the time</span>
          , up from {baseline}% before the footprint was rewritten, while it fell back to its own
          tools only {diyPct}% of the time.
        </p>
      </div>

      {/* per-search breakdown — the drillable data */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Per search · what the agent chose</span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{byPhrasing.length} searches</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--color-line)]">
          <div className="grid grid-cols-[1fr_60px_1fr] gap-3 border-b border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-3)]">
            <span>search phrasing</span>
            <span>split</span>
            <span>you / competitor / itself</span>
          </div>
          {byPhrasing.map((p) => (
            <div key={p.phrasing} className="grid grid-cols-[1fr_60px_1fr] items-center gap-3 border-b border-[var(--color-line)] px-3 py-2 text-[12px] last:border-0">
              <span className="truncate font-sans text-[var(--color-ink)]">{p.phrasing}</span>
              <span className="font-mono text-[10px] text-[var(--color-ink-3)]">{p.split}</span>
              <div className="flex h-4 overflow-hidden rounded">
                <Bar v={p.you} n={p.n} c={COL.you} />
                <Bar v={p.comp} n={p.n} c={COL.comp} />
                <Bar v={p.diy} n={p.n} c={COL.diy} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* trend / lever */}
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
    </div>
  );
}

function Row({ c, label, v, n, pct, bold }: { c: string; label: string; v: number; n: number; pct: number; bold?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: c }} />
      <span className="flex-1 font-sans text-[13px]" style={{ color: bold ? "var(--color-ink)" : "var(--color-ink-2)", fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{v}/{n}</span>
      <span className="tnum w-10 text-right font-mono text-[13px] font-bold" style={{ color: bold ? "var(--color-yc-deep)" : "var(--color-ink-2)" }}>
        {pct}%
      </span>
    </div>
  );
}

function Bar({ v, n, c }: { v: number; n: number; c: string }) {
  const w = n ? (v / n) * 100 : 0;
  return <div style={{ width: `${w}%`, background: c }} />;
}
