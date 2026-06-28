"use client";
import { useState } from "react";

type Engine = {
  id: string;
  name: string;
  mono: string;
  blurb: string;
  status: "live" | "soon";
  placeholder: string;
};

const ENGINES: Engine[] = [
  { id: "openai", name: "OpenAI", mono: "Oa", blurb: "GPT-5 agents run the wind tunnel today.", status: "live", placeholder: "sk-..." },
  { id: "gpt-4o-mini", name: "GPT-4o-mini", mono: "4m", blurb: "Smaller OpenAI model, same engine and data.", status: "live", placeholder: "sk-..." },
  { id: "cursor", name: "Cursor", mono: "Cu", blurb: "Coding-agent runs over your repo.", status: "soon", placeholder: "key..." },
];

function EngineCard({ e }: { e: Engine }) {
  const [key, setKey] = useState("");
  const [connected, setConnected] = useState(false);
  const live = e.status === "live";

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-ink)] font-mono text-[12px] font-bold text-white">
          {e.mono}
        </span>
        <div className="flex-1">
          <div className="font-display text-[15px] font-semibold text-[var(--color-ink)]">{e.name}</div>
          <div className="font-sans text-[11.5px] text-[var(--color-ink-3)]">{e.blurb}</div>
        </div>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
          style={{
            background: connected ? "var(--color-yc-wash)" : live ? "#E8F5EE" : "var(--color-panel-2)",
            color: connected ? "var(--color-yc-deep)" : live ? "var(--color-good)" : "var(--color-ink-3)",
          }}
        >
          {connected ? "connected" : live ? "ready" : "coming soon"}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="password"
          value={key}
          disabled={!live}
          onChange={(ev) => setKey(ev.target.value)}
          placeholder={e.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 font-mono text-[12px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-yc)] disabled:opacity-50"
        />
        <button
          disabled={!live || key.length < 6}
          onClick={() => setConnected(true)}
          className="rounded-lg px-3.5 py-2 font-sans text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-yc)" }}
        >
          {connected ? "✓" : "Connect"}
        </button>
      </div>
    </div>
  );
}

export function AgentsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[680px] font-sans text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        Aether runs the wind tunnel with your own keys. Connect a model to test how its agents behave
        on your footprint. GPT-4o and GPT-4o-mini are both live on the same engine.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {ENGINES.map((e) => (
          <EngineCard key={e.id} e={e} />
        ))}
      </div>
      <p className="font-mono text-[11px] text-[var(--color-ink-3)]">
        Keys stay in your browser and run your own agents. Persisted securely once you connect Convex.
      </p>
    </div>
  );
}
