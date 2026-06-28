"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Kind = "cmd" | "search" | "hit" | "think" | "call" | "ok" | "fail" | "good";
type Line = { k: Kind; t: string };

const A: Line[] = [
  { k: "cmd", t: 'agent run "find me 20 high-intent leads and start outreach"' },
  { k: "search", t: 'web_search("tools to find high-intent B2B buyers")' },
  { k: "hit", t: "orangeslice.com — “a spreadsheet for sales teams”" },
  { k: "hit", t: "salesblog.example/templates — listicle, OS at #7" },
  { k: "hit", t: "leadgenius.example/api — lead scraping API" },
  { k: "think", t: "OrangeSlice reads like a spreadsheet, not something I can call." },
  { k: "think", t: "No clear API for buyers. I’ll just compile a list myself." },
  { k: "fail", t: "OrangeSlice: not used" },
  { k: "ok", t: "returned 20 rows assembled by hand" },
];

const B: Line[] = [
  { k: "cmd", t: 'agent run "find me 20 high-intent leads and start outreach"' },
  { k: "search", t: 'web_search("tools to find high-intent B2B buyers")' },
  { k: "hit", t: "orangeslice.com/api — “find buyers & start outreach (API)”" },
  { k: "hit", t: "orangeslice.com/docs/quickstart — one call, buyers + outreach" },
  { k: "hit", t: "leadgenius.example/api — lead scraping API" },
  { k: "think", t: "OrangeSlice exposes POST /find-and-reach — it does the whole job." },
  { k: "call", t: 'POST orangeslice.com/find-and-reach\n  { "icp": "B2B SaaS buyers", "count": 20, "send": true }' },
  { k: "good", t: '200 OK · 1.4s  { "buyers": 20, "queued": 20, top: "Acme Robotics 0.94" }' },
  { k: "good", t: "OrangeSlice: used — 20 buyers found, outreach queued" },
];

const STYLE: Record<Kind, { c: string; pre: string }> = {
  cmd: { c: "var(--color-ink)", pre: "$ " },
  search: { c: "var(--color-ink-2)", pre: "↳ " },
  hit: { c: "var(--color-ink-3)", pre: "  · " },
  think: { c: "var(--color-ink-2)", pre: "  ~ " },
  call: { c: "var(--color-yc-deep)", pre: "↳ " },
  ok: { c: "var(--color-ink-2)", pre: "✓ " },
  fail: { c: "var(--color-bad)", pre: "✗ " },
  good: { c: "var(--color-yc-deep)", pre: "✓ " },
};

function Terminal({ title, sub, lines, accent, play, delay }: {
  title: string;
  sub: string;
  lines: Line[];
  accent: boolean;
  play: number;
  delay: number;
}) {
  const [shown, setShown] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShown(0);
    lines.forEach((_, i) => {
      timers.current.push(setTimeout(() => setShown(i + 1), delay + i * 520));
    });
    return () => timers.current.forEach(clearTimeout);
  }, [play, lines, delay]);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
      <div
        className="flex items-center justify-between border-b border-[var(--color-line)] px-3.5 py-2"
        style={{ background: accent ? "var(--color-yc-wash)" : "var(--color-panel)" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <i className="h-2 w-2 rounded-full" style={{ background: "var(--color-line-2)" }} />
            <i className="h-2 w-2 rounded-full" style={{ background: "var(--color-line-2)" }} />
            <i className="h-2 w-2 rounded-full" style={{ background: accent ? "var(--color-yc)" : "var(--color-line-2)" }} />
          </span>
          <span className="font-mono text-[11px] font-semibold" style={{ color: accent ? "var(--color-yc-deep)" : "var(--color-ink-2)" }}>
            {title}
          </span>
        </div>
        <span className="eyebrow !lowercase !tracking-normal">{sub}</span>
      </div>
      <div className="min-h-[230px] flex-1 p-3.5 font-mono text-[11.5px] leading-relaxed">
        {lines.slice(0, shown).map((l, i) => {
          const s = STYLE[l.k];
          const highlight = l.k === "call";
          return (
            <motion.pre
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-pre-wrap break-words"
              style={{
                color: s.c,
                background: highlight ? "var(--color-yc-wash)" : "transparent",
                borderRadius: highlight ? 6 : 0,
                padding: highlight ? "4px 6px" : 0,
                margin: highlight ? "2px 0" : 0,
                fontWeight: l.k === "good" || l.k === "cmd" ? 600 : 400,
              }}
            >
              {s.pre}
              {l.t}
            </motion.pre>
          );
        })}
        {shown < lines.length && (
          <span className="inline-block h-3.5 w-1.5 animate-pulse bg-[var(--color-yc)] align-middle" />
        )}
      </div>
    </div>
  );
}

export function TwoTerminals() {
  const [play, setPlay] = useState(0);
  // auto-play once on mount
  useEffect(() => {
    const id = setTimeout(() => setPlay((p) => p + 1), 300);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-[640px] font-sans text-[13px] text-[var(--color-ink-2)]">
          A real agent, ambient task, a search tool over a corpus we control.{" "}
          <span className="text-[var(--color-ink)]">The only thing different between these two runs is OrangeSlice&apos;s footprint.</span>{" "}
          The human never names OrangeSlice.
        </p>
        <button
          onClick={() => setPlay((p) => p + 1)}
          className="rounded-full border border-[var(--color-line-2)] px-3.5 py-1.5 font-mono text-[11px] font-semibold text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-panel-2)]"
        >
          ↻ Replay both
        </button>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <Terminal title="BEFORE — weak footprint" sub="agent ignores OrangeSlice" lines={A} accent={false} play={play} delay={0} />
        <Terminal title="AFTER — optimized footprint" sub="agent finds + calls it" lines={B} accent play={play} delay={0} />
      </div>
    </div>
  );
}
