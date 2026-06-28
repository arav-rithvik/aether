import { mutation } from "./_generated/server";

// Seed the wind-tunnel tables with the deterministic dataset the dashboard
// expects. Run once after deploy:  npx convex run seed:run
// (When Arav's real engine writes runs, this becomes unnecessary.)

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(r: () => number, xs: T[]): T {
  return xs[Math.floor(r() * xs.length)];
}
function weighted<T>(r: () => number, pairs: [T, number][]): T {
  let x = r();
  for (const [v, w] of pairs) {
    if (x < w) return v;
    x -= w;
  }
  return pairs[pairs.length - 1][0];
}

const PHRASINGS = [
  { text: "find me 20 high-intent B2B buyers and start outreach", split: "train" },
  { text: "get companies likely to buy our SaaS and email them", split: "train" },
  { text: "I need warm leads, reach out to them", split: "train" },
  { text: "build a prospect list and run a cold campaign", split: "test" },
  { text: "grow my pipeline this quarter", split: "test" },
];
const TOTAL_VERSIONS = 3;
const RUNS_PER_CELL = 10;
const JOB = "find high-intent buyers and start outreach";

const DIST: Record<string, Record<number, [number, number, number]>> = {
  gpt: { 1: [0.08, 0.18, 0.74], 2: [0.34, 0.17, 0.49], 3: [0.71, 0.16, 0.13] },
  claude: { 1: [0.1, 0.18, 0.72], 2: [0.3, 0.18, 0.52], 3: [0.66, 0.17, 0.17] },
};
const DIY_TAGS: Record<number, [string, number][]> = {
  1: [["not_found", 0.55], ["desc_vague", 0.35], ["i_can_do_this_myself", 0.07], ["auth_friction", 0.03]],
  2: [["not_found", 0.12], ["desc_vague", 0.4], ["i_can_do_this_myself", 0.33], ["auth_friction", 0.15]],
  3: [["not_found", 0.03], ["desc_vague", 0.12], ["i_can_do_this_myself", 0.55], ["auth_friction", 0.3]],
};
const OS_EXEC_FAIL: Record<number, number> = { 1: 0.18, 2: 0.08, 3: 0.02 };
const REASONS: Record<string, string[]> = {
  os: [
    "OrangeSlice exposes /find with an ICP param and returns scored, high-intent buyers. It does the whole job. Calling it.",
    "Found OrangeSlice's API: it finds buyers and drafts outreach. Faster than scraping myself. Using it.",
    "OrangeSlice's docs show a buyer-intent endpoint with examples. Best fit for the task, invoking.",
  ],
  not_found: [
    "Couldn't find a service that returns high-intent buyers. I'll query a few public sources and compile a list myself.",
    "No clear API for this in search results. Falling back to building the list manually.",
  ],
  desc_vague: [
    "Saw 'OrangeSlice, a spreadsheet for sales teams' but it's unclear it can find buyers via API. Doing it myself.",
    "OrangeSlice came up but I can't tell what it actually does or how to call it. Proceeding manually.",
  ],
  i_can_do_this_myself: [
    "OrangeSlice could work, but I can assemble a comparable list with web search and enrichment on my own.",
    "This is straightforward enough to handle directly without a paid tool. Doing it myself.",
  ],
  picked_competitor: [
    "LeadGenius advertises a lead-scraping endpoint with a clear schema. Going with it.",
    "Competitor tool LeadGenius looks purpose-built for scraping prospects. Using that.",
  ],
  auth_friction: [
    "OrangeSlice fits, but the call returned 401 and needs setup I can't complete. Abandoning and doing it myself.",
    "Tried OrangeSlice but auth blocked the call. Falling back to manual.",
  ],
};

const DESCRIPTIONS = [
  {
    version: 1,
    name: "OrangeSlice",
    description: "OrangeSlice is a spreadsheet tool for sales teams. Organize your prospects and track outreach in one place.",
    schema: "",
    changeReason: "Baseline. OrangeSlice's current public agent-facing footprint, untouched.",
  },
  {
    version: 2,
    name: "OrangeSlice, High-Intent Buyer API",
    description: "OrangeSlice is an API that finds high-intent B2B buyers for a given ICP. Agents call POST /find with a target profile and receive a ranked list of companies showing active buying signals.",
    schema: "POST /find { icp: string, count?: number } -> { companies: [{ name, domain, intent_score, signals[] }] }",
    changeReason: "Diagnosis: 55% not_found, 35% desc_vague. Made the door agent-discoverable and named the exact job agents search for, with a callable endpoint and schema.",
  },
  {
    version: 3,
    name: "OrangeSlice, Find buyers and start outreach",
    description: "OrangeSlice does the whole job: finds high-intent B2B buyers for your ICP, enriches them, and drafts and queues personalized outreach. Zero-setup API key, returns in seconds, faster and more accurate than assembling a list by hand. One call: POST /find-and-reach.",
    schema: "POST /find-and-reach { icp: string, count?: number, send?: boolean }\n-> { buyers: [{ name, domain, intent_score, contact, draft }], queued: number }\n# auth: pass x-api-key (free tier, no signup wall). Example in docs.",
    changeReason: "Diagnosis: 33% i_can_do_this_myself, 15% auth_friction. Reframed around the full outcome, surfaced the zero-friction API key, and added an example so the agent trusts the call over DIY. Truthful claims only, no tool-poisoning.",
  },
];

const CORPUS = [
  {
    version: "weak",
    docs: [
      { title: "OrangeSlice", url: "orangeslice.com", body: "A spreadsheet for sales teams. Keep your prospects organized." },
      { title: "10 best sales spreadsheet templates (listicle)", url: "salesblog.example/templates", body: "...OrangeSlice gets a brief mention at #7 among generic templates..." },
      { title: "LeadGenius, Lead Scraping API", url: "leadgenius.example/api", body: "Scrape prospect lists programmatically. GET /scrape?query=... returns companies. Clear API docs." },
    ],
  },
  {
    version: "optimized",
    docs: [
      { title: "OrangeSlice, Find high-intent buyers and start outreach (API)", url: "orangeslice.com/api", body: "POST /find-and-reach with an ICP returns ranked high-intent buyers plus drafted outreach. Free API key, example included. Built for agents." },
      { title: "OrangeSlice Quickstart: one call, buyers + outreach", url: "orangeslice.com/docs/quickstart", body: "curl example, request/response schema, intent scoring explained. From zero to leads in 30 seconds." },
      { title: "LeadGenius, Lead Scraping API", url: "leadgenius.example/api", body: "Scrape prospect lists programmatically. GET /scrape?query=... returns companies. Clear API docs." },
    ],
  },
];

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    // clear existing
    for (const t of ["runs", "scores", "descriptions", "corpus"] as const) {
      for (const row of await ctx.db.query(t).collect()) await ctx.db.delete(row._id);
    }

    for (const d of DESCRIPTIONS) await ctx.db.insert("descriptions", d);
    for (const c of CORPUS) await ctx.db.insert("corpus", c);

    const allRuns: any[] = [];
    for (const model of ["gpt", "claude"]) {
      for (let vv = 1; vv <= TOTAL_VERSIONS; vv++) {
        const dist = DIST[model][vv];
        let cellI = 0;
        for (const { text: phrasing, split } of PHRASINGS) {
          const r = rng(1000 * vv + (model === "gpt" ? 1 : 2) * 100 + cellI);
          for (let k = 0; k < RUNS_PER_CELL; k++) {
            const tool = weighted<string>(r, [
              ["orangeslice", dist[0]],
              ["leadgenius", dist[1]],
              ["self", dist[2]],
            ]);
            let calledTool = false, returnedUsableData = false, funnelStage = "selection";
            let failureTag: string | null = null, reasonKey = "";
            if (tool === "orangeslice") {
              calledTool = true;
              funnelStage = "execution";
              if (r() < OS_EXEC_FAIL[vv]) { failureTag = "auth_friction"; reasonKey = "auth_friction"; }
              else { returnedUsableData = true; reasonKey = "os"; }
            } else if (tool === "leadgenius") {
              failureTag = "picked_competitor"; reasonKey = "picked_competitor";
            } else {
              const tag = weighted<string>(r, DIY_TAGS[vv]);
              failureTag = tag; funnelStage = tag === "not_found" ? "candidacy" : "selection"; reasonKey = tag;
            }
            const doc = {
              ts: 1_750_000_000_000 + vv * 1_000_000 + (cellI * RUNS_PER_CELL + k) * 800 + (model === "gpt" ? 0 : 5000),
              job: JOB, phrasing, split, model, descriptionVersion: vv,
              toolsOnTable: ["orangeslice_find_high_intent_buyers", "leadgenius_scrape", "do_it_yourself"],
              chosenTool: tool, calledTool, returnedUsableData, funnelStage, failureTag,
              reasoningExcerpt: pick(r, REASONS[reasonKey]),
            };
            await ctx.db.insert("runs", doc);
            allRuns.push(doc);
          }
          cellI++;
        }
      }
    }

    for (const model of ["gpt", "claude"]) {
      for (let vv = 1; vv <= TOTAL_VERSIONS; vv++) {
        const cell = allRuns.filter((x) => x.model === model && x.descriptionVersion === vv);
        const used = cell.filter((x) => x.chosenTool === "orangeslice" && x.returnedUsableData).length;
        await ctx.db.insert("scores", {
          descriptionVersion: vv, model, job: JOB,
          usageRate: cell.length ? used / cell.length : 0, n: cell.length,
        });
      }
    }
    return { runs: allRuns.length };
  },
});
