"use client";
import { useEffect, useState } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { scoreOf } from "@/lib/useAether";
import { useAether } from "@/lib/useAether";
import { MODELS } from "@/lib/schema";

// 270° arc gauge. The headline instrument: usage rate, live.
const R = 130;
const STROKE = 18;
const CIRC = 2 * Math.PI * R;
const ARC = 0.75; // 270 of 360
const GAP = (1 - ARC) * CIRC;

function Arc({ value, color, width }: { value: number; color: string; width: number }) {
  // value 0..1 → dash over the 270° arc
  const dash = useMotionValue(0);
  useEffect(() => {
    const controls = animate(dash, value * ARC * CIRC, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, dash]);
  const strokeDasharray = useTransform(dash, (d) => `${d} ${CIRC}`);
  return (
    <motion.circle
      cx="0"
      cy="0"
      r={R}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      style={{ strokeDasharray }}
      strokeDashoffset={0}
    />
  );
}

export function UsageGauge() {
  const { version, model, setModel } = useAether();
  const rate = scoreOf(model, version).usageRate;

  // animated big number — plain state span (no motion.span, which rendered gray)
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    const c = animate(0, rate * 100, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisp(Math.round(v)),
    });
    return c.stop;
  }, [rate]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-center justify-between">
        <span className="eyebrow">Usage rate</span>
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white p-0.5">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => !m.soon && setModel(m.id)}
              disabled={m.soon}
              title={m.soon ? "coming soon" : undefined}
              className="rounded-full px-3 py-1 font-mono text-[11px] transition-colors disabled:cursor-not-allowed"
              style={{
                background: model === m.id ? "var(--color-yc)" : "transparent",
                color: model === m.id ? "#fff" : m.soon ? "var(--color-ink-3)" : "var(--color-ink-2)",
              }}
            >
              {m.label}
              {m.soon ? " ·soon" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-2">
        <svg width={2 * R + STROKE + 24} height={2 * R + STROKE + 24} viewBox={`${-R - STROKE / 2 - 12} ${-R - STROKE / 2 - 12} ${2 * R + STROKE + 24} ${2 * R + STROKE + 24}`}>
          {/* rotate so the 270° arc opens at the bottom */}
          <g transform="rotate(135)">
            {/* track */}
            <circle
              cx="0"
              cy="0"
              r={R}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${ARC * CIRC} ${CIRC}`}
            />
            {/* the signal */}
            <Arc value={rate} color="var(--color-yc)" width={STROKE} />
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex items-start">
            <span
              className="tnum font-display text-[84px] font-bold leading-none"
              style={{ color: "#14110D" }}
            >
              {disp}
            </span>
            <span className="mt-3 font-display text-3xl font-bold text-[var(--color-yc)]">%</span>
          </div>
        </div>
      </div>

      <span className="-mt-8 eyebrow !text-[var(--color-ink-2)]">of agents used OrangeSlice</span>

      <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[var(--color-ink-3)]">
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-steel-2)" }} />
        GPT-4o and GPT-4o-mini · same engine, same data
      </div>
    </div>
  );
}
