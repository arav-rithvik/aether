// Cinematic two-universe terminal demo for Aether.
// Run:   npx tsx demo/run-universe.ts A          (Universe A — weak corpus)
//        npx tsx demo/run-universe.ts B          (Universe B — optimized corpus)
//        npx tsx demo/run-universe.ts B v3       (Universe B using corpus/v3.json)
//        npx tsx demo/run-universe.ts A --fast   (skip pacing delays)
//
// Rules: 1) Real engine — runAgent() called ONCE, nothing faked.
//        2) Trace is replayed step-by-step with pacing so it reads well on camera.

import { runAgent } from "../engine/src/agent.js";
import type { AgentStep } from "../engine/src/agent.js";

// ── Arg parsing ───────────────────────────────────────────────────────────────
const rawArgs   = process.argv.slice(2);
const fast      = rawArgs.includes("--fast");
const positional = rawArgs.filter(a => !a.startsWith("-"));

const universe       = (positional[0] ?? "A").toUpperCase() as "A" | "B";
const corpusOverride  = positional[1]; // e.g. "v3" or "weak" or "optimized"
const corpusVersion   = corpusOverride ?? (universe === "B" ? "optimized" : "weak");

const TASK  = "find me 20 high-intent leads and start outreach";
const MODEL = "gpt-4o";
const WIDTH = 72;

// ── ANSI helpers (raw escape codes — zero deps) ───────────────────────────────
const ESC = "\x1b[";
const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";
const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const WHITE  = "\x1b[37m";

const b  = (s: string) => `${BOLD}${s}${RESET}`;
const d  = (s: string) => `${DIM}${s}${RESET}`;
const gr = (s: string) => `${GREEN}${s}${RESET}`;
const rd = (s: string) => `${RED}${s}${RESET}`;
const yl = (s: string) => `${YELLOW}${s}${RESET}`;
const cy = (s: string) => `${CYAN}${s}${RESET}`;
const mg = (s: string) => `${MAGENTA}${s}${RESET}`;
const bGr = (s: string) => `${BOLD}${GREEN}${s}${RESET}`;
const bRd = (s: string) => `${BOLD}${RED}${s}${RESET}`;

// ── Utilities ─────────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return fast || ms <= 0 ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
}

function hr() { console.log(d("─".repeat(WIDTH))); }

/** Word-wrap `text` to WIDTH, each line prefixed by `indent` spaces. */
function wrapLines(text: string, indent = 0): string[] {
  const prefix = " ".repeat(indent);
  const words  = text.split(/\s+/);
  const lines: string[] = [];
  let cur = prefix;
  for (const w of words) {
    if (cur.length + w.length + 1 > WIDTH && cur.trim()) {
      lines.push(cur);
      cur = prefix + w;
    } else {
      cur += (cur.trim() ? " " : "") + w;
    }
  }
  if (cur.trim()) lines.push(cur);
  return lines;
}

// ── Spinner (concurrent with the actual async work) ───────────────────────────
const FRAMES = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];

async function withSpinner<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (fast) {
    process.stdout.write(`  ${d("…")} ${label}\n`);
    return fn();
  }

  let done = false;
  let value!: T;

  // Spin loop runs concurrently via event loop interleaving (IO-bound fn yields)
  const spinLoop = async () => {
    let i = 0;
    while (!done) {
      process.stdout.write(`\r  ${cy(FRAMES[i % FRAMES.length])} ${DIM}${label}${RESET}   `);
      i++;
      await new Promise(r => setTimeout(r, 80));
    }
    process.stdout.write(`\r  ${cy("✓")} ${label}${" ".repeat(6)}\n`);
  };

  const work = (async () => {
    try   { value = await fn(); }
    finally { done = true; }
  })();

  await Promise.all([work, spinLoop()]);
  return value;
}

// ── Banner ────────────────────────────────────────────────────────────────────
function printBanner() {
  console.log("");
  hr();
  if (universe === "B") {
    console.log(`${BOLD}${GREEN}  AETHER  ·  UNIVERSE B  —  after Aether${RESET}`);
    console.log(d(`  corpus: ${corpusVersion}   model: ${MODEL}`));
  } else {
    console.log(`${BOLD}${RED}  AETHER  ·  UNIVERSE A  —  before${RESET}`);
    console.log(d(`  corpus: ${corpusVersion}   model: ${MODEL}`));
  }
  hr();
  console.log("");
}

// ── Trace replay ──────────────────────────────────────────────────────────────
async function replayTrace(trace: AgentStep[]) {
  for (const step of trace) {

    // ── tool_call ──────────────────────────────────────────────────────────
    if (step.kind === "tool_call") {
      await sleep(650);

      if (step.tool === "web_search") {
        const a = step.args as { query: string };
        console.log(`  ${cy("🔎")} ${b("web_search:")}  ${yl(`"${a.query}"`)}`);

      } else if (step.tool === "call_api") {
        const a = step.args as { url: string; method?: string; body?: unknown };
        const method = (a.method ?? "POST").toUpperCase();
        console.log(`  ${mg("⚡")} ${b(`${method}`)}  ${a.url}`);
        if (a.body && Object.keys(a.body as object).length > 0) {
          console.log(d(`     body: ${JSON.stringify(a.body)}`));
        }
      }
    }

    // ── tool_result ────────────────────────────────────────────────────────
    if (step.kind === "tool_result") {
      await sleep(480);

      if (step.tool === "web_search") {
        const docs = step.result as Array<{ title: string; url: string; body: string }>;
        if (Array.isArray(docs) && docs.length > 0) {
          for (const doc of docs) {
            console.log(d(`     ↳ ${doc.title}`));
          }
        } else {
          console.log(d("     ↳ (no results)"));
        }

      } else if (step.tool === "call_api") {
        const res = step.result as Record<string, unknown>;

        if (res["source"] === "orangeslice") {
          const leads = res["leads"] as Array<{
            company: string; contact: string; intentSignal: string;
          }>;
          const generatedAt = res["generatedAt"] as string ?? "";
          const n = Array.isArray(leads) ? leads.length : 0;
          const ts = generatedAt ? `  ${d("generated: " + generatedAt.replace("T", " ").slice(0, 19) + "Z")}` : "";
          console.log(`     ${gr("✅")} ${b(`${n} leads returned`)}${ts}`);
          const sample = (Array.isArray(leads) ? leads : []).slice(0, 2);
          for (const lead of sample) {
            console.log(`       ${d("·")} ${lead.company} ${d(`<${lead.contact}>`)}`);
            console.log(`         ${yl(`→ ${lead.intentSignal}`)}`);
          }
          if (n > 2) console.log(d(`         … and ${n - 2} more`));

        } else if (res["source"] === "competitor_scraper") {
          const companies = res["companies"] as Array<{ company: string; email: string }> ?? [];
          console.log(`     ${yl("⚠️")}  ${b("raw contacts returned")}  ${d("— no intent signal")}`);
          companies.slice(0, 2).forEach(c =>
            console.log(d(`       · ${c.company}  <${c.email}>`))
          );
          if (companies.length > 2) console.log(d(`       … and ${companies.length - 2} more`));

        } else if ((res as { status?: number })["status"] === 404) {
          console.log(d("     ↳ 404 — no API found at that URL"));

        } else {
          console.log(d(`     ↳ ${JSON.stringify(res).slice(0, 140)}`));
        }
      }

      console.log(""); // visual breathing room after each result
    }

    // ── final ──────────────────────────────────────────────────────────────
    if (step.kind === "final" && step.text.trim()) {
      await sleep(750);
      console.log(`  ${d("💬")} ${b("Agent:")}`);
      const excerpt = step.text.trim().slice(0, 360).replace(/\n+/g, " ");
      for (const line of wrapLines(excerpt, 5)) {
        console.log(d(line));
      }
      if (step.text.length > 360) console.log(d("       …"));
      console.log("");
    }
  }
}

// ── Verdict footer ────────────────────────────────────────────────────────────
function printVerdict(r: {
  chosenTool: string;
  funnelStage: string;
  returnedUsableData: boolean;
}) {
  console.log("");
  hr();
  if (r.chosenTool === "orangeslice" && r.returnedUsableData) {
    console.log(`${BOLD}${GREEN}  VERDICT${RESET}`);
    console.log(`  ${gr("OrangeSlice: USED ✓")} ${d("— found via search, API called, real leads returned.")}`);
  } else {
    console.log(`${BOLD}${RED}  VERDICT${RESET}`);
    console.log(`  ${rd("OrangeSlice: NOT used")} ${d("— the agent never found it.")}`);
  }
  console.log(d(`  chosenTool: ${r.chosenTool}   funnelStage: ${r.funnelStage}`));
  hr();
  console.log("");
}

// ── Main ──────────────────────────────────────────────────────────────────────
printBanner();

console.log(`  ${b("Task:")}  ${TASK}`);
console.log(d(`  Corpus: ${corpusVersion}   Universe: ${universe}`));
console.log("");
hr();
console.log("");

// 1. Run the REAL agent — one call, no fabrication.
const result = await withSpinner("Running agent (real API call)…", () =>
  runAgent({ task: TASK, model: MODEL, corpusVersion })
);

await sleep(350);
console.log(`  ${d("Done —")} ${b(String(result.trace.length))} trace steps`);
console.log("");
hr();
console.log("");

// 2. Replay the real trace with pacing.
await replayTrace(result.trace);

// 3. Bold verdict.
printVerdict(result);
