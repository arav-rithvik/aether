"use client";
import { motion } from "framer-motion";
import { scoreOf, compRate, useAether, TOTAL_VERSIONS } from "@/lib/useAether";
import { ModelId } from "@/lib/schema";

const W = 340;
const H = 150;
const PAD = { l: 30, r: 14, t: 14, b: 24 };
const iw = W - PAD.l - PAD.r;
const ih = H - PAD.t - PAD.b;

function x(v: number) {
  return PAD.l + ((v - 1) / (TOTAL_VERSIONS - 1)) * iw;
}
function y(r: number) {
  return PAD.t + (1 - r) * ih;
}

function series(fn: (v: number) => number) {
  return Array.from({ length: TOTAL_VERSIONS }, (_, i) => ({ v: i + 1, r: fn(i + 1) }));
}

export function ClimbChart() {
  const { version, model } = useAether();
  const other: ModelId = model === "gpt" ? "claude" : "gpt";

  const primary = series((v) => scoreOf(model, v).usageRate);
  const secondary = series((v) => scoreOf(other, v).usageRate);
  const competitor = series((v) => compRate(model, v));

  const path = (pts: { v: number; r: number }[]) =>
    pts.map((p, i) => `${i ? "L" : "M"}${x(p.v)},${y(p.r)}`).join(" ");

  return (
    <div className="flex h-full flex-col">
      <p className="font-sans text-[13px] text-[var(--color-ink-2)]">
        Same job, same held-out phrasings. Only your footprint changed —{" "}
        <span className="text-[var(--color-ink)]">usage climbs on both models; the competitor stays flat as a control.</span>
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" style={{ maxHeight: 170 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(g) + 3} textAnchor="end" className="fill-[var(--color-ink-3)]" style={{ font: "10px var(--font-mono)" }}>
              {g * 100}
            </text>
          </g>
        ))}
        {[1, 2, 3].map((v) => (
          <text key={v} x={x(v)} y={H - 8} textAnchor="middle" className="fill-[var(--color-ink-3)]" style={{ font: "10px var(--font-mono)" }}>
            v{v}
          </text>
        ))}

        {/* competitor — flat control */}
        <path d={path(competitor)} fill="none" stroke="var(--color-steel)" strokeWidth={1.5} strokeDasharray="3 3" />
        {/* secondary model */}
        <motion.path
          d={path(secondary)}
          fill="none"
          stroke="#FFB37A"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9 }}
        />
        {/* primary model */}
        <motion.path
          d={path(primary)}
          fill="none"
          stroke="var(--color-yc)"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9 }}
        />

        {primary.map((p) => (
          <circle key={p.v} cx={x(p.v)} cy={y(p.r)} r={p.v === version ? 5 : 3} fill="var(--color-yc)" stroke="#fff" strokeWidth={p.v === version ? 2 : 0} />
        ))}
      </svg>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 font-mono text-[10px] text-[var(--color-ink-3)]">
        <Legend color="var(--color-yc)" label={model === "gpt" ? "GPT-5" : "Claude"} />
        <Legend color="#FFB37A" label={other === "gpt" ? "GPT-5" : "Claude"} />
        <Legend color="var(--color-steel)" label="Competitor (control)" dash />
      </div>
    </div>
  );
}

function Legend({ color, label, dash }: { color: string; label: string; dash?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4 rounded"
        style={{ background: dash ? `repeating-linear-gradient(90deg,${color} 0 3px,transparent 3px 6px)` : color }}
      />
      {label}
    </span>
  );
}
