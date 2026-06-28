"use client";
import { useEffect, useState } from "react";
import {
  engineStats,
  failureBreakdown,
  mathFor,
  scoreOf,
  useAether,
  TOTAL_VERSIONS,
} from "@/lib/useAether";
import { FAILURE_LABEL, FailureTag } from "@/lib/schema";

type TLine = { k: "cmd" | "out" | "ok" | "add" | "del" | "dim"; t: string };
type Section = { h: string; body: string };
type Step = {
  phase: string;
  title: string;
  desc: string;
  metric: string;
  terminal: TLine[];
  sections: Section[];
};

export function Pipeline() {
  const { version, model } = useAether();
  const s = engineStats();
  const m = mathFor(model, version);
  const bd = failureBreakdown(model, version);
  const topTag = (Object.keys(bd) as FailureTag[]).sort((a, b) => bd[b] - bd[a])[0];
  const converged = version >= TOTAL_VERSIONS;
  const nextV = Math.min(version + 1, TOTAL_VERSIONS);
  const lift = Math.round((scoreOf(model, version).usageRate - scoreOf(model, 1).usageRate) * 100);

  const steps: Step[] = [
    {
      phase: "Measure",
      title: "Ingest the job",
      desc: "Capture the job and ICP the customer wants agents to use them for.",
      metric: "1 job",
      terminal: [
        { k: "cmd", t: "aether init --customer orangeslice" },
        { k: "ok", t: 'job: "find high-intent buyers and start outreach"' },
        { k: "ok", t: "icp: B2B SaaS, 11-200 employees" },
        { k: "dim", t: "win condition = agent picks AND calls OrangeSlice" },
      ],
      sections: [
        { h: "What happens", body: "You hand Aether one job and one ideal-customer profile. That single job becomes the thing every later run is scored against." },
        { h: "Why it matters", body: "One job keeps the usage rate a clean signal instead of an average of unrelated tasks. The number means something." },
      ],
    },
    {
      phase: "Measure",
      title: "Generate phrasings",
      desc: "Derive the many ways an agent might be asked, split train and held-out.",
      metric: `${s.phrasings} phrasings`,
      terminal: [
        { k: "cmd", t: "aether phrasings" },
        { k: "out", t: "train: find me 20 high-intent buyers..." },
        { k: "out", t: "train: get companies likely to buy our SaaS..." },
        { k: "del", t: "held-out: grow my pipeline this quarter" },
        { k: "del", t: "held-out: build a prospect list and run a cold campaign" },
      ],
      sections: [
        { h: "What happens", body: "We expand the job into many real phrasings, then lock some away as a held-out set the optimizer is never allowed to see." },
        { h: "Why it matters", body: "Measuring on held-out phrasings proves we optimized the door, not memorized the exact question. That is the difference between a real lift and overfitting." },
      ],
    },
    {
      phase: "Measure",
      title: "Assemble the toolset",
      desc: "Put your API, a real rival, and do-it-yourself on the table.",
      metric: "3 tools",
      terminal: [
        { k: "cmd", t: "aether toolset" },
        { k: "ok", t: "orangeslice_find_high_intent_buyers   (you)" },
        { k: "out", t: "leadgenius_scrape                     (rival)" },
        { k: "dim", t: "do_it_yourself                        (DIY)" },
      ],
      sections: [
        { h: "What happens", body: "Every run gives the agent three real options: your tool, a working competitor, and just doing the job itself." },
        { h: "Why it matters", body: "The agent is free to ignore you. A win against a real rival and against DIY is what makes the usage rate honest, not a rigged two-way pick." },
      ],
    },
    {
      phase: "Measure",
      title: "Build the corpus",
      desc: "The controlled search surface the agent retrieves from.",
      metric: version === 1 ? "weak" : "optimized",
      terminal: [
        { k: "cmd", t: `aether corpus --version ${version === 1 ? "weak" : "optimized"}` },
        { k: "ok", t: "indexed 3 docs the agent can search" },
        version === 1
          ? { k: "out", t: 'orangeslice.com — "a spreadsheet for sales teams"' }
          : { k: "out", t: "orangeslice.com/api — find buyers + start outreach" },
      ],
      sections: [
        { h: "What happens", body: "The agent searches a corpus we control instead of the live web, so the test is reproducible across runs and on camera." },
        { h: "Why it matters", body: "Only your footprint inside the corpus changes between iterations. That isolates cause from effect, so any lift is attributable to the rewrite." },
      ],
    },
    {
      phase: "Measure",
      title: "Run the wind tunnel",
      desc: "Execute a real agent on every phrasing, model, and repeat.",
      metric: `${m.n} runs`,
      terminal: [
        { k: "cmd", t: "aether run --models gpt5,claude --repeats 10" },
        { k: "dim", t: "running 100 agents..." },
        { k: "out", t: "run 0042  GPT-5   chose: do_it_yourself" },
        { k: "ok", t: "run 0043  Claude  chose: orangeslice" },
        { k: "ok", t: "100 runs complete" },
      ],
      sections: [
        { h: "What happens", body: "Hundreds of real Claude and GPT-5 agents run the job end to end inside an isolated sandbox, with search and code, each blind to the others. We log what every one actually picked and called." },
        { h: "What we collect", body: "Per run we store the phrasing, the model, the tool it chose, whether the call ran and returned usable data, and a slice of its reasoning. Nothing about your end users. That data trains the optimizer and powers every number on this page." },
        { h: "Why it matters", body: "These are real LLM decisions, not a simulation. The whole pipeline stands on observed behavior, which is exactly what survives a code review." },
      ],
    },
    {
      phase: "Measure",
      title: "Capture the funnel",
      desc: "Record candidacy, selection, and execution for each run.",
      metric: `${m.candidacy}/${m.n} found`,
      terminal: [
        { k: "cmd", t: "aether funnel" },
        { k: "out", t: `candidacy  ${m.candidacy}/${m.n}   agent found you` },
        { k: "out", t: `selection  ${m.selection}/${m.n}    agent chose you` },
        { k: "ok", t: `execution  ${m.execution}/${m.n}    call returned leads` },
      ],
      sections: [
        { h: "What happens", body: "Each run is scored on three gates: did you get found, did you get chosen, did the call return usable data." },
        { h: "Why it matters", body: "The funnel shows the exact gate where you leak, so the optimizer fixes the real bottleneck instead of guessing." },
      ],
    },
    {
      phase: "Diagnose",
      title: "Tag the rejections",
      desc: "A labeler reads each run's reasoning and tags why you lost.",
      metric: `${FAILURE_LABEL[topTag]} ·${bd[topTag]}`,
      terminal: [
        { k: "cmd", t: "aether diagnose" },
        { k: "del", t: `not_found             ${bd.not_found}` },
        { k: "del", t: `desc_vague            ${bd.desc_vague}` },
        { k: "del", t: `i_can_do_this_myself  ${bd.i_can_do_this_myself}` },
        { k: "ok", t: `top reason: ${topTag}` },
      ],
      sections: [
        { h: "What happens", body: "A small labeler reads the agent's own reasoning on every lost run and tags why: not found, vague, did-it-itself, picked-competitor, or auth-friction." },
        { h: "Why it matters", body: "These tags are the training signal. The optimizer attacks the single highest-cost reason first, so each rewrite is targeted." },
      ],
    },
    {
      phase: "Optimize",
      title: "Rewrite the footprint",
      desc: "Propose one truthful change to your tool description for the top reason.",
      metric: converged ? "converged" : `v${version} to v${nextV}`,
      terminal: [
        { k: "cmd", t: "aether optimize --target top_reason" },
        { k: "del", t: '- "a spreadsheet for sales teams"' },
        { k: "add", t: '+ "API that finds high-intent buyers. POST /find ..."' },
        { k: "ok", t: `tool description v${version} -> v${nextV}` },
      ],
      sections: [
        { h: "What happens", body: "We rewrite your tool description to kill the top rejection reason, one change at a time, annotated with the reason it was made." },
        { h: "Why it matters", body: "Small, attributable edits turn the change-log into a lab notebook. You can see exactly which words moved the number." },
      ],
    },
    {
      phase: "Optimize",
      title: "Guardrail check",
      desc: "Auto-check the rewrite: truthful, schema-valid, no tool-poisoning.",
      metric: "3/3 pass",
      terminal: [
        { k: "cmd", t: "aether guardrail" },
        { k: "ok", t: "claims truthful" },
        { k: "ok", t: "schema valid" },
        { k: "ok", t: "no 'always use me' injection" },
      ],
      sections: [
        { h: "What happens", body: "Every rewrite is auto-checked before it ships. Claims must be truthful, the schema valid, and there is no instruction injection." },
        { h: "Why it matters", body: "Tool-poisoning is an instant disqualifier. The lift has to come from clarity and fit, not from manipulating the agent." },
      ],
    },
    {
      phase: "Prove",
      title: "Re-prove on held-out",
      desc: "Re-run phrasings the optimizer never saw, confirm the control stays flat.",
      metric: lift > 0 ? `${Math.round(m.rate * 100)}% ·+${lift}` : `${Math.round(m.rate * 100)}%`,
      terminal: [
        { k: "cmd", t: "aether reprove --split held-out" },
        { k: "ok", t: `usage  GPT-5   ${Math.round(scoreOf("gpt", 1).usageRate * 100)}% -> ${Math.round(scoreOf("gpt", version).usageRate * 100)}%` },
        { k: "ok", t: `usage  Claude  ${Math.round(scoreOf("claude", 1).usageRate * 100)}% -> ${Math.round(scoreOf("claude", version).usageRate * 100)}%` },
        { k: "dim", t: "competitor  flat (control)" },
      ],
      sections: [
        { h: "What happens", body: "We re-run on the held-out phrasings the optimizer never saw, on both models, and compare against the competitor's rate." },
        { h: "Why it matters", body: "If usage climbs while the control stays flat, the lift is real, not noise or model drift. That is the entire proof, on two models." },
      ],
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const phaseColor: Record<string, string> = {
    Measure: "var(--color-steel)",
    Diagnose: "var(--color-bad)",
    Optimize: "var(--color-yc)",
    Prove: "var(--color-good)",
  };
  const sel = open !== null ? steps[open] : null;

  return (
    <div>
      <p className="mb-6 max-w-[680px] font-sans text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        We spin up hundreds of real agents in an isolated sandbox, hand them the job through a search
        engine we control, and watch which tool they reach for. By reading their reasoning we reverse
        engineer why a model picks one tool over another, rewrite your footprint to win that decision,
        and prove the lift on phrasings the optimizer never saw.{" "}
        <span className="text-[var(--color-ink-3)]">Click any step to open it.</span>
      </p>

      <ol className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
        {steps.map((st, i) => (
          <li key={st.title} className="sm:[&:nth-child(2)]:border-t-0 first:border-t-0 border-t border-[var(--color-line)]">
            <button
              onClick={() => setOpen(i)}
              className="group flex w-full items-baseline gap-4 py-3.5 text-left"
            >
              <span className="tnum w-6 shrink-0 font-mono text-[12px] text-[var(--color-ink-3)] group-hover:text-[var(--color-yc)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: phaseColor[st.phase] }} />
                  <span className="font-display text-[15px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-yc-deep)]">
                    {st.title}
                  </span>
                  <span className="text-[var(--color-line-2)] opacity-0 transition-opacity group-hover:opacity-100">↗</span>
                </div>
                <p className="mt-0.5 font-sans text-[12.5px] leading-snug text-[var(--color-ink-3)]">{st.desc}</p>
              </div>
              <span className="tnum shrink-0 whitespace-nowrap font-mono text-[12px] font-semibold text-[var(--color-ink-2)]">
                {st.metric}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-line)] pt-4">
        <span className="flex items-center gap-2 font-sans text-[12px] text-[var(--color-ink-3)]">
          <span className="text-[var(--color-yc)]">↺</span>
          loops back to step 05 each iteration, until no rejection reason is worth fixing.
        </span>
        <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
          iteration {version} / {TOTAL_VERSIONS}
        </span>
      </div>

      {/* modal */}
      {sel && open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 [animation:fadein_.15s_ease]"
          onClick={() => setOpen(null)}
        >
          <div className="absolute inset-0" style={{ background: "rgba(20,17,13,0.45)" }} />
          <div
            className="relative flex max-h-[86vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-[var(--color-ink-3)]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: phaseColor[sel.phase] }} />
                  {sel.phase} · step {String(open + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-1 font-display text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">
                  {sel.title}
                </h3>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="rounded-md px-2 py-1 font-mono text-[14px] text-[var(--color-ink-3)] hover:bg-[var(--color-panel-2)]"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              {/* orange-style terminal */}
              <div className="overflow-hidden rounded-xl border border-[var(--color-yc-soft)]">
                <div className="flex items-center gap-2 border-b border-[var(--color-yc-soft)] bg-[var(--color-yc-wash)] px-3 py-2">
                  <span className="flex gap-1">
                    <i className="h-2 w-2 rounded-full" style={{ background: "var(--color-yc)" }} />
                    <i className="h-2 w-2 rounded-full" style={{ background: "var(--color-yc-soft)" }} />
                    <i className="h-2 w-2 rounded-full" style={{ background: "var(--color-yc-soft)" }} />
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-yc-deep)]">
                    aether · {sel.title.toLowerCase()}
                  </span>
                </div>
                <div className="bg-white px-3.5 py-3 font-mono text-[11.5px] leading-relaxed">
                  {sel.terminal.map((l, k) => (
                    <pre key={k} className="whitespace-pre-wrap break-words" style={{ color: lineColor(l.k) }}>
                      {prefix(l.k)}
                      {l.t}
                    </pre>
                  ))}
                </div>
              </div>

              {/* explanation with bold black headers */}
              <div className="mt-5 flex flex-col gap-4">
                {sel.sections.map((sec) => (
                  <div key={sec.h}>
                    <h4 className="font-display text-[14px] font-bold text-[var(--color-ink)]">{sec.h}</h4>
                    <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function lineColor(k: TLine["k"]) {
  switch (k) {
    case "cmd": return "var(--color-ink)";
    case "ok": return "var(--color-good)";
    case "add": return "var(--color-good)";
    case "del": return "var(--color-bad)";
    case "dim": return "var(--color-ink-3)";
    default: return "var(--color-ink-2)";
  }
}
function prefix(k: TLine["k"]) {
  switch (k) {
    case "cmd": return "$ ";
    case "ok": return "✓ ";
    case "add": return "";
    case "del": return "";
    default: return "  ";
  }
}
