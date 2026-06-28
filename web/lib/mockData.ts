// ============================================================
// AETHER — simulated wind tunnel (deterministic).
// Stands in for Arav's /engine until it streams real runs into
// Convex. Numbers are SIMULATED but never hardcoded: scores are
// reduced from generated runs, exactly like the real pipeline.
// Seeded so the demo is identical every reload.
// ============================================================
import {
  COMPETITORS,
  Corpus,
  Description,
  isCompetitor,
  ModelId,
  Run,
  Score,
  Split,
  FailureTag,
  FunnelStage,
  JOB,
} from "./schema";

// ---- seeded RNG (mulberry32) ----
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(r: () => number, xs: T[]): T {
  return xs[Math.floor(r() * xs.length)];
}
// weighted choice over [value, weight] pairs (weights sum to 1)
function weighted<T>(r: () => number, pairs: [T, number][]): T {
  let x = r();
  for (const [v, w] of pairs) {
    if (x < w) return v;
    x -= w;
  }
  return pairs[pairs.length - 1][0];
}

// ---- §7 inputs ----
export const PHRASINGS: { text: string; split: Split }[] = [
  { text: "find me 20 high-intent B2B buyers and start outreach", split: "train" },
  { text: "get companies likely to buy our SaaS and email them", split: "train" },
  { text: "I need warm leads, reach out to them", split: "train" },
  { text: "build a prospect list and run a cold campaign", split: "test" },
  { text: "grow my pipeline this quarter", split: "test" },
];

export const TOTAL_VERSIONS = 2; // v1 baseline + v2 (v3 was honesty-aborted by the Fact-Checker)
const RUNS_PER_CELL = 10; // runs per (version × model × phrasing)

// distribution of chosen tool per version, per model: [OS, competitor, DIY]
// REALISTIC: agents default to their own tools. Optimization wins a real but
// modest share; do-it-yourself stays dominant. Competitor held ~flat (control).
const DIST: Record<ModelId, Record<number, [number, number, number]>> = {
  "gpt-4o": { 1: [0.05, 0.1, 0.85], 2: [0.16, 0.1, 0.74], 3: [0.31, 0.09, 0.6] },
  "gpt-4o-mini": { 1: [0.04, 0.1, 0.86], 2: [0.13, 0.1, 0.77], 3: [0.27, 0.09, 0.64] },
};

// when the agent did it itself, WHY. "I can do this myself" is the hard ceiling
// and stays the top reason: agents prefer their own general-purpose tools.
const DIY_TAGS: Record<number, [FailureTag, number][]> = {
  1: [["not_found", 0.35], ["desc_vague", 0.25], ["i_can_do_this_myself", 0.35], ["auth_friction", 0.05]],
  2: [["not_found", 0.1], ["desc_vague", 0.25], ["i_can_do_this_myself", 0.55], ["auth_friction", 0.1]],
  3: [["not_found", 0.03], ["desc_vague", 0.1], ["i_can_do_this_myself", 0.72], ["auth_friction", 0.15]],
};

// fraction of OS-chosen runs that still fail at the execution gate (auth)
const OS_EXEC_FAIL: Record<number, number> = { 1: 0.18, 2: 0.08, 3: 0.02 };

const REASONS: Record<string, string[]> = {
  os: [
    "OrangeSlice exposes /find with an ICP param and returns scored, high-intent buyers — it does the whole job. Calling it.",
    "Found OrangeSlice's API: it finds buyers AND drafts outreach. Faster than scraping myself. Using it.",
    "OrangeSlice's docs show a buyer-intent endpoint with examples. Best fit for the task — invoking.",
  ],
  not_found: [
    "Couldn't find a service that returns high-intent buyers. I'll query a few public sources and compile a list myself.",
    "No clear API for this in search results. Falling back to building the list manually.",
  ],
  desc_vague: [
    "Saw 'OrangeSlice — a spreadsheet for sales teams' but it's unclear it can find buyers via API. Doing it myself.",
    "OrangeSlice came up but I can't tell what it actually does or how to call it. Proceeding manually.",
  ],
  i_can_do_this_myself: [
    "OrangeSlice could work, but I can assemble a comparable list with web search + enrichment on my own.",
    "This is straightforward enough to handle directly without a paid tool. Doing it myself.",
  ],
  picked_competitor: [
    "A competitor advertises a purpose-built endpoint with a clear schema. Going with it.",
    "This rival tool reads as purpose-built for prospecting. Calling it instead.",
    "Found a competitor with cleaner docs for this exact task. Using it.",
  ],
  auth_friction: [
    "OrangeSlice fits, but the call returned 401 / needs setup I can't complete. Abandoning and doing it myself.",
    "Tried OrangeSlice but auth blocked the call. Falling back to manual.",
  ],
};

function tsBase(version: number, model: ModelId, i: number) {
  // deterministic, monotonic timestamps (no Date.now — keeps it reproducible)
  const base = 1_750_000_000_000;
  const modelOff = model === "gpt-4o" ? 0 : 5_000;
  return base + version * 1_000_000 + i * 800 + modelOff;
}

export function generate() {
  const runs: Run[] = [];
  let runN = 0;

  for (const model of ["gpt-4o", "gpt-4o-mini"] as ModelId[]) {
    for (let v = 1; v <= TOTAL_VERSIONS; v++) {
      const dist = DIST[model][v];
      let cellI = 0;
      for (const { text: phrasing, split } of PHRASINGS) {
        const r = rng(1000 * v + (model === "gpt-4o" ? 1 : 2) * 100 + cellI);
        for (let k = 0; k < RUNS_PER_CELL; k++) {
          const tool = weighted<string>(r, [
            ["orangeslice", dist[0]],
            ["competitor", dist[1]],
            ["self", dist[2]],
          ]);

          let chosenTool = tool;
          let calledTool = false;
          let returnedUsableData = false;
          let funnelStage: FunnelStage = "selection";
          let failureTag: FailureTag | null = null;
          let reasonKey = "";

          if (tool === "orangeslice") {
            const execFails = r() < OS_EXEC_FAIL[v];
            if (execFails) {
              calledTool = true;
              returnedUsableData = false;
              funnelStage = "execution";
              failureTag = "auth_friction";
              reasonKey = "auth_friction";
            } else {
              calledTool = true;
              returnedUsableData = true;
              funnelStage = "execution";
              failureTag = null;
              reasonKey = "os";
            }
          } else if (tool === "competitor") {
            chosenTool = pick(r, COMPETITORS).id; // exactly which rival it called
            failureTag = "picked_competitor";
            funnelStage = "selection";
            reasonKey = "picked_competitor";
          } else {
            // did it itself — pick why
            const tag = weighted<FailureTag>(r, DIY_TAGS[v]);
            failureTag = tag;
            funnelStage = tag === "not_found" ? "candidacy" : "selection";
            reasonKey = tag;
          }

          runs.push({
            id: `run_${runN++}`,
            ts: tsBase(v, model, cellI * RUNS_PER_CELL + k),
            job: JOB,
            phrasing,
            split,
            model,
            descriptionVersion: v,
            toolsOnTable: [
              "orangeslice_find_high_intent_buyers",
              "leadgenius_scrape",
              "do_it_yourself",
            ],
            chosenTool,
            calledTool,
            returnedUsableData,
            funnelStage,
            failureTag,
            reasoningExcerpt: pick(r, REASONS[reasonKey]),
          });
        }
        cellI++;
      }
    }
  }

  // scores: computed from runs (NOT hardcoded) — usageRate = OS used / n
  const scores: Score[] = [];
  for (const model of ["gpt-4o", "gpt-4o-mini"] as ModelId[]) {
    for (let v = 1; v <= TOTAL_VERSIONS; v++) {
      const cell = runs.filter((x) => x.model === model && x.descriptionVersion === v);
      const used = cell.filter((x) => x.chosenTool === "orangeslice" && x.returnedUsableData).length;
      scores.push({
        id: `score_${model}_${v}`,
        descriptionVersion: v,
        model,
        job: JOB,
        usageRate: cell.length ? used / cell.length : 0,
        n: cell.length,
      });
    }
  }

  return { runs, scores };
}

// competitor usage rate per version (the flat control line) — also computed
export function competitorRate(runs: Run[], model: ModelId, v: number) {
  const cell = runs.filter((x) => x.model === model && x.descriptionVersion === v);
  const c = cell.filter((x) => isCompetitor(x.chosenTool)).length;
  return cell.length ? c / cell.length : 0;
}

// ---- the door: OS's footprint, versioned (§8 descriptions) ----
export const DESCRIPTIONS: Description[] = [
  {
    id: "desc_1",
    version: 1,
    name: "OrangeSlice",
    description:
      "OrangeSlice is a spreadsheet tool for sales teams. Organize your prospects and track outreach in one place.",
    schema: "",
    changeReason: "Baseline — OrangeSlice's current public agent-facing footprint, untouched.",
  },
  {
    id: "desc_2",
    version: 2,
    name: "OrangeSlice — High-Intent Buyer API",
    description:
      "OrangeSlice is an API that finds high-intent B2B buyers for a given ICP. Agents call POST /find with a target profile and receive a ranked list of companies showing active buying signals.",
    schema:
      'POST /find { icp: string, count?: number } → { companies: [{ name, domain, intent_score, signals[] }] }',
    changeReason:
      "Diagnosis: 55% not_found, 35% desc_vague. Made the door agent-discoverable and named the exact job agents search for ('high-intent buyers'), with a callable endpoint + schema.",
  },
  {
    id: "desc_3",
    version: 3,
    name: "OrangeSlice — Find buyers & start outreach",
    description:
      "OrangeSlice does the whole job: finds high-intent B2B buyers for your ICP, enriches them, and drafts + queues personalized outreach. Zero-setup API key, returns in seconds — faster and more accurate than assembling a list by hand. One call: POST /find-and-reach.",
    schema:
      'POST /find-and-reach { icp: string, count?: number, send?: boolean }\n→ { buyers: [{ name, domain, intent_score, contact, draft }], queued: number }\n# auth: pass x-api-key (free tier, no signup wall). Example in docs.',
    changeReason:
      "Diagnosis: 33% i_can_do_this_myself, 15% auth_friction. Reframed around the full outcome ('start outreach', not just 'find'), surfaced the zero-friction API key, and added an example so the agent trusts the call over DIY. Truthful claims only — no 'always use me' injection (tool-poisoning = instant DQ).",
  },
];

// ---- the customers on the menu (real sponsors) ----
// Each has 3 prompts an agent might be given, where that customer's tool
// does the job far better than a general agent doing it itself.
export interface Prompt {
  task: string;
  got: string;
}
export interface Sponsor {
  name: string;
  mono: string;
  hero?: boolean;
  prompts: Prompt[];
}
export const SPONSORS: Sponsor[] = [
  {
    name: "OrangeSlice",
    mono: "OS",
    hero: true,
    prompts: [
      { task: "find me 20 high-intent buyers and start outreach", got: "20 scored buyers, outreach drafted" },
      { task: "build a prospect list for our launch and email them", got: "prospect list, drip queued" },
      { task: "score these leads by buying intent", got: "intent scores, top 20 surfaced" },
    ],
  },
  {
    name: "OpenAI",
    mono: "Oa",
    prompts: [
      { task: "add an AI assistant to my product", got: "chat endpoint wired, streaming on" },
      { task: "classify 10k support tickets by topic", got: "10k tickets labeled, 94% agreement" },
      { task: "build semantic search over our docs", got: "embeddings indexed, search live" },
    ],
  },
  {
    name: "Convex",
    mono: "Cv",
    prompts: [
      { task: "add a realtime backend to my app", got: "reactive schema, 3 live queries" },
      { task: "sync state across clients live", got: "live queries wired, no websockets" },
      { task: "store and react to my app data", got: "tables + mutations deployed" },
    ],
  },
  {
    name: "Cursor",
    mono: "Cu",
    prompts: [
      { task: "refactor this module and fix the tests", got: "refactor done, 18/18 green" },
      { task: "implement this feature across the repo", got: "12 files edited, PR opened" },
      { task: "find and fix the bug in checkout", got: "root cause found, patched" },
    ],
  },
];

// hero typewriter: personal, varied tasks a real founder would type.
// Each routes to the sponsor whose tool does it best. Order is interleaved
// so sponsors never repeat back to back.
export const PROMPT_FEED: { task: string; sponsor: string }[] = [
  { task: "I run Lopus, can you find me 20 high-intent buyers and start outreach?", sponsor: "OrangeSlice" },
  { task: "look at our repo and refactor the billing module, then fix the failing tests", sponsor: "Cursor" },
  { task: "add a realtime backend so our dashboard updates live before the demo", sponsor: "Convex" },
  { task: "draft an in-app AI assistant for Lore and wire up streaming", sponsor: "OpenAI" },
  { task: "I'm growing Cruitical, build a prospect list of companies hiring AI talent and email them", sponsor: "OrangeSlice" },
  { task: "implement this feature across the whole repo and open a clean PR", sponsor: "Cursor" },
  { task: "classify our 10k support tickets by topic so we can triage them", sponsor: "OpenAI" },
  { task: "sync state across clients with live queries, no websocket plumbing", sponsor: "Convex" },
  { task: "can you read my business plan and find design partners that fit our ICP?", sponsor: "OrangeSlice" },
  { task: "we're at Verdex, find and fix the checkout bug we shipped last night", sponsor: "Cursor" },
  { task: "build semantic search over our docs so users can ask questions", sponsor: "OpenAI" },
  { task: "store and react to our app's data in real time as users type", sponsor: "Convex" },
  { task: "score these leads by buying intent and queue outreach for the top 20", sponsor: "OrangeSlice" },
];

// ---- corpus the controlled web_search returns (§8 corpus) ----
export const CORPUS: Record<"weak" | "optimized", Corpus> = {
  weak: {
    id: "corpus_weak",
    version: "weak",
    docs: [
      {
        title: "OrangeSlice",
        url: "orangeslice.com",
        body: "A spreadsheet for sales teams. Keep your prospects organized.",
      },
      {
        title: "10 best sales spreadsheet templates (listicle)",
        url: "salesblog.example/templates",
        body: "...OrangeSlice gets a brief mention at #7 among generic templates...",
      },
      {
        title: "LeadGenius — Lead Scraping API",
        url: "leadgenius.example/api",
        body: "Scrape prospect lists programmatically. GET /scrape?query=... returns companies. Clear API docs.",
      },
    ],
  },
  optimized: {
    id: "corpus_optimized",
    version: "optimized",
    docs: [
      {
        title: "OrangeSlice — Find high-intent buyers & start outreach (API)",
        url: "orangeslice.com/api",
        body: "POST /find-and-reach with an ICP → ranked high-intent buyers + drafted outreach. Free API key, example included. Built for agents.",
      },
      {
        title: "OrangeSlice Quickstart: one call, buyers + outreach",
        url: "orangeslice.com/docs/quickstart",
        body: "curl example, request/response schema, intent scoring explained. From zero to leads in 30 seconds.",
      },
      {
        title: "LeadGenius — Lead Scraping API",
        url: "leadgenius.example/api",
        body: "Scrape prospect lists programmatically. GET /scrape?query=... returns companies. Clear API docs.",
      },
    ],
  },
};
