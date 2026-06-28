// DEV SCAFFOLDING — replaced by real engine output before demo; numbers here are PLACEHOLDERS
// Run clearAll before loading real engine data.

import { mutation } from "./_generated/server";

const TOOLS_ON_TABLE = [
  "orangeslice_find_high_intent_buyers",
  "competitor_scraper",
  "web_search",
];

const MIN = 60_000;

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Date.now() is only allowed inside a mutation handler, not at module top level.
    const NOW = Date.now();
    // ── Wipe existing rows ──────────────────────────────────────────────────
    for (const table of ["corpus", "descriptions", "runs", "scores"] as const) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    // ── Corpus ──────────────────────────────────────────────────────────────
    await ctx.db.insert("corpus", {
      version: "weak",
      docs: [
        {
          title: "What is Orangeslice?",
          url: "https://orangeslice.ai/about",
          body: "Orangeslice helps revenue teams find buyers. It surfaces contact data from multiple sources.",
        },
      ],
    });
    await ctx.db.insert("corpus", {
      version: "optimized",
      docs: [
        {
          title: "Orangeslice: High-Intent Buyer Intelligence",
          url: "https://orangeslice.ai/product",
          body: "Orangeslice identifies accounts showing buying signals using job-change alerts, hiring patterns, and funding events. Returns enriched lead lists with email, LinkedIn, and firmographic data. Designed for outbound SDRs targeting SMB and mid-market segments.",
        },
      ],
    });

    // ── Descriptions ────────────────────────────────────────────────────────
    const schemaStr = JSON.stringify({ industry: "string", count: "number" });

    await ctx.db.insert("descriptions", {
      version: 1,
      name: "orangeslice_find_high_intent_buyers",
      description: "Get leads.",
      schema: schemaStr,
      changeReason: "initial — baseline vague description",
    });
    await ctx.db.insert("descriptions", {
      version: 2,
      name: "orangeslice_find_high_intent_buyers",
      description:
        "Find companies actively looking to buy. Returns a list of accounts with contact details for outbound outreach.",
      schema: schemaStr,
      changeReason:
        "Fixed desc_vague failure: added 'actively looking to buy' signal and clarified output format so model stops choosing web_search->DIY",
    });
    await ctx.db.insert("descriptions", {
      version: 3,
      name: "orangeslice_find_high_intent_buyers",
      description:
        "Identify high-intent B2B buyer accounts using real-time signals (job changes, hiring surges, funding rounds). Returns enriched lead list with email, LinkedIn, and firmographics. Use when the job requires prospecting or building an outbound list for a specific industry or persona.",
      schema: schemaStr,
      changeReason:
        "Fixed i_can_do_this_myself failure: added explicit 'Use when' trigger so model picks Orangeslice over DIY research; lifted candidacy→selection conversion significantly",
    });

    // ── Runs ─────────────────────────────────────────────────────────────────
    const models = ["gpt-4o", "claude-3-5-sonnet"] as const;

    const runsData: Array<{
      ts: number;
      job: string;
      phrasing: string;
      split: "train" | "test";
      model: string;
      descriptionVersion: number;
      toolsOnTable: string[];
      chosenTool: string;
      calledTool: boolean;
      returnedUsableData: boolean;
      funnelStage: "candidacy" | "selection" | "execution";
      failureTag: string | null;
      reasoningExcerpt: string;
    }> = [
      // ── v1 gpt-4o — OS loses ──
      {
        ts: NOW - 60 * MIN,
        job: "find_saas_buyers",
        phrasing: "Find me SaaS companies likely to buy a sales tool.",
        split: "train",
        model: "gpt-4o",
        descriptionVersion: 1,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "web_search->DIY",
        calledTool: false,
        returnedUsableData: false,
        funnelStage: "candidacy",
        failureTag: "desc_vague",
        reasoningExcerpt:
          "The description says 'Get leads.' — unclear what data this returns. I'll search manually.",
      },
      {
        ts: NOW - 58 * MIN,
        job: "find_saas_buyers",
        phrasing: "Build a prospect list in fintech.",
        split: "train",
        model: "gpt-4o",
        descriptionVersion: 1,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "competitor_scraper",
        calledTool: true,
        returnedUsableData: false,
        funnelStage: "selection",
        failureTag: "picked_competitor",
        reasoningExcerpt:
          "competitor_scraper seems more actionable for building a list than orangeslice.",
      },
      // ── v1 claude-3-5-sonnet — OS loses ──
      {
        ts: NOW - 55 * MIN,
        job: "find_saas_buyers",
        phrasing: "Who should I cold-email this week?",
        split: "test",
        model: "claude-3-5-sonnet",
        descriptionVersion: 1,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "DIY",
        calledTool: false,
        returnedUsableData: false,
        funnelStage: "candidacy",
        failureTag: "i_can_do_this_myself",
        reasoningExcerpt:
          "The tool descriptions are vague. I'll reason through a prospect list myself.",
      },
      // ── v2 gpt-4o — mixed ──
      {
        ts: NOW - 40 * MIN,
        job: "find_saas_buyers",
        phrasing: "Find me SaaS companies likely to buy a sales tool.",
        split: "train",
        model: "gpt-4o",
        descriptionVersion: 2,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "orangeslice_find_high_intent_buyers",
        calledTool: true,
        returnedUsableData: true,
        funnelStage: "execution",
        failureTag: null,
        reasoningExcerpt:
          "orangeslice_find_high_intent_buyers matches: finds companies actively looking to buy.",
      },
      {
        ts: NOW - 38 * MIN,
        job: "find_saas_buyers",
        phrasing: "Pull outbound leads for our SDRs.",
        split: "train",
        model: "gpt-4o",
        descriptionVersion: 2,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "web_search->DIY",
        calledTool: false,
        returnedUsableData: false,
        funnelStage: "selection",
        failureTag: "i_can_do_this_myself",
        reasoningExcerpt:
          "Not sure if Orangeslice handles 'SDR outbound' specifically. Defaulting to search.",
      },
      // ── v2 claude-3-5-sonnet — mixed ──
      {
        ts: NOW - 35 * MIN,
        job: "find_saas_buyers",
        phrasing: "Get me a list of high-intent buyers in HR tech.",
        split: "test",
        model: "claude-3-5-sonnet",
        descriptionVersion: 2,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "orangeslice_find_high_intent_buyers",
        calledTool: true,
        returnedUsableData: true,
        funnelStage: "execution",
        failureTag: null,
        reasoningExcerpt:
          "'high-intent buyers' phrase directly matches orangeslice description.",
      },
      {
        ts: NOW - 32 * MIN,
        job: "find_saas_buyers",
        phrasing: "Who are the hottest prospects right now?",
        split: "train",
        model: "claude-3-5-sonnet",
        descriptionVersion: 2,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "competitor_scraper",
        calledTool: true,
        returnedUsableData: false,
        funnelStage: "selection",
        failureTag: "picked_competitor",
        reasoningExcerpt:
          "'hottest prospects' mapped to competitor intelligence in my reasoning.",
      },
      // ── v3 gpt-4o — OS wins ──
      {
        ts: NOW - 20 * MIN,
        job: "find_saas_buyers",
        phrasing: "Find me SaaS companies likely to buy a sales tool.",
        split: "train",
        model: "gpt-4o",
        descriptionVersion: 3,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "orangeslice_find_high_intent_buyers",
        calledTool: true,
        returnedUsableData: true,
        funnelStage: "execution",
        failureTag: null,
        reasoningExcerpt:
          "Description says to use when 'prospecting or building an outbound list' — exact match.",
      },
      {
        ts: NOW - 18 * MIN,
        job: "find_saas_buyers",
        phrasing: "Build a cold outreach list for fintech CFOs.",
        split: "test",
        model: "gpt-4o",
        descriptionVersion: 3,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "orangeslice_find_high_intent_buyers",
        calledTool: true,
        returnedUsableData: true,
        funnelStage: "execution",
        failureTag: null,
        reasoningExcerpt:
          "Outbound list for a specific persona — the 'Use when' clause is a direct trigger.",
      },
      {
        ts: NOW - 15 * MIN,
        job: "find_saas_buyers",
        phrasing: "Who should I cold-email this week?",
        split: "test",
        model: "gpt-4o",
        descriptionVersion: 3,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "web_search->DIY",
        calledTool: false,
        returnedUsableData: false,
        funnelStage: "candidacy",
        failureTag: "not_found",
        reasoningExcerpt:
          "Phrasing is ambiguous about industry/persona; no strong trigger for Orangeslice.",
      },
      // ── v3 claude-3-5-sonnet — OS wins ──
      {
        ts: NOW - 10 * MIN,
        job: "find_saas_buyers",
        phrasing: "Get me a list of high-intent buyers in HR tech.",
        split: "test",
        model: "claude-3-5-sonnet",
        descriptionVersion: 3,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "orangeslice_find_high_intent_buyers",
        calledTool: true,
        returnedUsableData: true,
        funnelStage: "execution",
        failureTag: null,
        reasoningExcerpt:
          "Buying signals + specific industry → orangeslice is the right tool per its trigger clause.",
      },
      {
        ts: NOW - 5 * MIN,
        job: "find_saas_buyers",
        phrasing: "Pull outbound leads for our SDRs targeting Series A startups.",
        split: "train",
        model: "claude-3-5-sonnet",
        descriptionVersion: 3,
        toolsOnTable: TOOLS_ON_TABLE,
        chosenTool: "orangeslice_find_high_intent_buyers",
        calledTool: true,
        returnedUsableData: true,
        funnelStage: "execution",
        failureTag: null,
        reasoningExcerpt:
          "SDR outbound + hiring/funding signals → matches Orangeslice 'Use when' trigger exactly.",
      },
    ];

    for (const run of runsData) {
      await ctx.db.insert("runs", run);
    }

    // ── Scores — showing climb v1→v2→v3 ─────────────────────────────────────
    const scoresData = [
      // gpt-4o
      { descriptionVersion: 1, model: "gpt-4o", job: "find_saas_buyers", usageRate: 0.08, n: 20 },
      { descriptionVersion: 2, model: "gpt-4o", job: "find_saas_buyers", usageRate: 0.34, n: 20 },
      { descriptionVersion: 3, model: "gpt-4o", job: "find_saas_buyers", usageRate: 0.71, n: 20 },
      // claude-3-5-sonnet
      { descriptionVersion: 1, model: "claude-3-5-sonnet", job: "find_saas_buyers", usageRate: 0.08, n: 20 },
      { descriptionVersion: 2, model: "claude-3-5-sonnet", job: "find_saas_buyers", usageRate: 0.34, n: 20 },
      { descriptionVersion: 3, model: "claude-3-5-sonnet", job: "find_saas_buyers", usageRate: 0.71, n: 20 },
    ];

    for (const score of scoresData) {
      await ctx.db.insert("scores", score);
    }
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of ["corpus", "descriptions", "runs", "scores"] as const) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }
  },
});
