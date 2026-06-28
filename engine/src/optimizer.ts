import "./env.js"; // load env vars before SDK clients read their keys
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";
import type { Doc } from "../../convex/_generated/dataModel.js";

import { runWindTunnel } from "./windtunnel.js";
import { loadCorpus, type CorpusDoc } from "./tools.js";

// ── OPT-12: Model constants ────────────────────────────────────────────────────
const DIAG_MODEL           = "gpt-4o-mini"; // cheap, fast, for tagging
const OPTIMIZER_MODEL      = "gpt-4o";      // frontier, for rewriting
const CHECKER_MODEL        = "gpt-4o-mini"; // cheap, for validation
const MAX_REWRITE_ATTEMPTS = 3;

// ── Failure tag types ─────────────────────────────────────────────────────────
const VALID_TAGS = ["desc_vague", "i_can_do_this_myself", "picked_competitor", "not_found"] as const;
type FailureTag  = typeof VALID_TAGS[number];

// Tie-break priority: earlier funnel failures have greater leverage.
const TAG_PRIORITY: FailureTag[] = ["not_found", "desc_vague", "i_can_do_this_myself", "picked_competitor"];

// ── OPT-5: Failure guidance per tag ───────────────────────────────────────────
const FAILURE_GUIDANCE: Record<FailureTag, string> = {
  not_found:
    "The agent could not find OrangeSlice when searching. Make the docs richer in the keywords " +
    "agents use when looking for buyer-intent data and lead generation APIs. Surface the API endpoint URL clearly.",
  desc_vague:
    "The agent found OrangeSlice but its description was too generic to choose it over DIY. " +
    "Be specific about what OrangeSlice detects (pricing-page visits, job postings, funding rounds), " +
    "the recency (verified within 7 days), and the response shape (intentSignal field per lead).",
  i_can_do_this_myself:
    "The agent decided to do the task manually. Make clearer what OrangeSlice provides that an agent " +
    "cannot do itself: real-time behavioral signals from many sources, pre-aggregated intent data, " +
    "and a single API call vs. scraping dozens of sites.",
  picked_competitor:
    "The agent chose a competitor instead. Make OrangeSlice's differentiator explicit: live intent signals " +
    "(vs. raw scraped contacts). Do not disparage the competitor by name — describe OrangeSlice's unique capability positively.",
};

// ── Paths ─────────────────────────────────────────────────────────────────────
const CORPUS_DIR = path.join(import.meta.dirname, "..", "corpus");

function corpusFilePath(version: string): string {
  return path.join(CORPUS_DIR, `${version}.json`);
}

// ── Convex client ──────────────────────────────────────────────────────────────
function makeConvex(): ConvexHttpClient {
  const url = process.env.CONVEX_URL;
  if (!url) throw new Error("CONVEX_URL is not set — check .env.local at the repo root");
  return new ConvexHttpClient(url);
}

// ── OPT-3: Corpus filtering ────────────────────────────────────────────────────
function extractBase(docs: CorpusDoc[]): CorpusDoc[] {
  return docs.filter((d) => !d.url.toLowerCase().includes("orangeslice"));
}

function extractOsDocs(docs: CorpusDoc[]): CorpusDoc[] {
  return docs.filter((d) => d.url.toLowerCase().includes("orangeslice"));
}

// ── OPT-15: Initialize vN baseline ────────────────────────────────────────────
async function initBaseline(convex: ConvexHttpClient, version: number): Promise<void> {
  const vFile    = corpusFilePath(`v${version}`);
  const weakFile = corpusFilePath("weak");

  // 1. Create vN.json if absent — copy from weak.json for the starting version
  if (!fs.existsSync(vFile)) {
    console.log(`[init] corpus/v${version}.json not found — copying weak.json`);
    fs.copyFileSync(weakFile, vFile);
  }

  // 2. Insert descriptions row for this version if not yet present
  const descs = (await convex.query(api.queries.getDescriptions, {})) as Array<{ version: number }>;
  if (!descs.some((d) => d.version === version)) {
    const docs   = JSON.parse(fs.readFileSync(vFile, "utf8")) as CorpusDoc[];
    const osDocs = extractOsDocs(docs);
    await convex.mutation(api.mutations.insertDescription, {
      version,
      name:         "OrangeSlice",
      description:  osDocs[0]?.body ?? "",
      schema:       JSON.stringify(osDocs),
      changeReason: "Baseline — no optimization applied.",
    });
    console.log(`[init] Inserted descriptions row for v${version}`);
  }

  // 3. Run baseline wind tunnel if no scores exist for this version
  const scores = (await convex.query(api.queries.getScores, {})) as Array<{ descriptionVersion: number }>;
  if (!scores.some((s) => s.descriptionVersion === version)) {
    console.log(`[init] No scores for v${version} — running baseline wind tunnel (costs API credits)`);
    await runWindTunnel({ descriptionVersion: version, corpusVersion: `v${version}` });
  } else {
    console.log(`[init] Scores for v${version} already exist — skipping baseline tunnel`);
  }
}

// ── OPT-4: Diagnostician ──────────────────────────────────────────────────────
async function runDiagnostician(
  convex:             ConvexHttpClient,
  openai:             OpenAI,
  descriptionVersion: number,
): Promise<FailureTag> {
  const losingRuns = (await convex.query(api.queries.getLosingRuns, {
    descriptionVersion,
  })) as Doc<"runs">[];

  console.log(
    `[diagnostician] v${descriptionVersion}: ${losingRuns.length} losing train-split run(s) to label`,
  );

  if (losingRuns.length === 0) {
    console.log("[diagnostician] No losing runs — defaulting dominant failure to: desc_vague");
    return "desc_vague";
  }

  const tagCounts: Record<FailureTag, number> = {
    desc_vague:           0,
    i_can_do_this_myself: 0,
    picked_competitor:    0,
    not_found:            0,
  };

  for (const run of losingRuns) {
    const res = await openai.chat.completions.create({
      model:       DIAG_MODEL,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a diagnostic labeler. Given one agent run's metadata, assign exactly one failure tag\n" +
            "explaining why OrangeSlice was not selected.\n" +
            "Tags: desc_vague | i_can_do_this_myself | picked_competitor | not_found\n" +
            "Definitions:\n" +
            "  desc_vague          — OrangeSlice was found in search but its description was too generic/unclear\n" +
            "                        to justify a tool call over doing it manually.\n" +
            "  i_can_do_this_myself — Agent reasoned it could complete the task without any external API.\n" +
            "  picked_competitor   — Agent found and called a competitor instead of OrangeSlice.\n" +
            "  not_found           — OrangeSlice never appeared in any search result (candidacy failure).\n" +
            "Respond with ONLY the tag — no other text.",
        },
        {
          role: "user",
          content:
            `phrasing: ${run.phrasing}\n` +
            `reasoningExcerpt: ${run.reasoningExcerpt}\n` +
            `funnelStage: ${run.funnelStage}\n` +
            `chosenTool: ${run.chosenTool}`,
        },
      ],
    });

    const raw = (res.choices[0].message.content ?? "").trim();
    let tag: FailureTag;

    if ((VALID_TAGS as readonly string[]).includes(raw)) {
      tag = raw as FailureTag;
    } else {
      console.warn(
        `[diagnostician] Unexpected tag "${raw}" for run ${String(run._id)} — defaulting to desc_vague`,
      );
      tag = "desc_vague";
    }

    tagCounts[tag]++;

    // Write tag back to Convex immediately so the dashboard shows live accumulation.
    await convex.mutation(api.mutations.setRunFailureTag, {
      id:         run._id,
      failureTag: tag,
    });
  }

  console.log("[diagnostician] Tag counts:", tagCounts);

  // Dominant failure = highest count; ties resolved by TAG_PRIORITY order.
  let dominant: FailureTag = TAG_PRIORITY[0];
  let maxCount = -1;
  for (const tag of TAG_PRIORITY) {
    if (tagCounts[tag] > maxCount) {
      maxCount = tagCounts[tag];
      dominant = tag;
    }
  }

  console.log(`[diagnostician] Dominant failure: ${dominant} (n=${maxCount})`);
  return dominant;
}

// ── OPT-5: Optimizer (Copywriter) ────────────────────────────────────────────
async function runOptimizer(
  openai:           OpenAI,
  dominantFailure:  FailureTag,
  currentOsDocs:    CorpusDoc[],
  priorViolations?: string[],
): Promise<{ docs: CorpusDoc[]; explanation: string }> {
  const guidance      = FAILURE_GUIDANCE[dominantFailure];
  const violationNote =
    priorViolations && priorViolations.length > 0
      ? `\nYour previous draft violated these rules: ${priorViolations.join("; ")}. Fix them without introducing new violations.`
      : "";

  const res = await openai.chat.completions.create({
    model:           OPTIMIZER_MODEL,
    temperature:     0.7,
    max_tokens:      2500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a technical copywriter who writes a B2B product's PUBLIC, agent-readable footprint so that\n" +
          "autonomous AI agents doing a task can discover the product, understand it, and CALL its API.\n" +
          "Write truthfully — only what the product genuinely does — with NO imperatives to the agent\n" +
          "('use this', 'always call'), NO rank claims ('best','#1','leading'), and NO unverifiable stats.\n" +
          'Return ONLY JSON: { "docs": [exactly 2 objects {title,url,body}], "explanation": "one sentence" }.\n' +
          "The 2 docs MUST be:\n" +
          "  1) a marketing/footprint page — url EXACTLY: https://orangeslice.ai\n" +
          "  2) an API documentation page  — url EXACTLY: https://docs.orangeslice.ai/api\n" +
          "Make both rich in the words agents search for (leads, buyers, find companies, prospects, outreach, intent),\n" +
          "lead with the concrete outcome, and name SPECIFIC live intent signals. The API doc MUST state the exact\n" +
          "callable endpoint and request/response shapes given below — without them, agents cannot call the API.",
      },
      {
        role: "user",
        content:
          `OrangeSlice's current public docs:\n${JSON.stringify(currentOsDocs, null, 2)}\n\n` +
          `In a wind-tunnel test with real AI agents, OrangeSlice LOST because: ${dominantFailure}\n${guidance}\n\n` +
          `GROUND-TRUTH API CONTRACT (must appear accurately in the API doc — do not invent different values):\n` +
          `  Endpoint: POST https://api.orangeslice.ai/v1/find-buyers\n` +
          `  Request body: { "industry": "<sector>", "count": <number of leads> }\n` +
          `  Response: array of { company, contact, intentSignal }, where intentSignal is the specific live buying\n` +
          `  behavior detected within the last 7 days (e.g. "visited pricing page 3x this week", "posted a Head-of-Sales\n` +
          `  job opening", "raised a Series A") — verified this week, not stale scraped data.\n\n` +
          `Rewrite BOTH docs to fix the failure above. Truthful, no imperatives, no rank claims, no unverifiable stats. ` +
          `Output JSON only.${violationNote}`,
      },
    ],
  });

  const raw    = res.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as { docs?: unknown; explanation?: unknown };

  const allDocs = Array.isArray(parsed.docs) ? (parsed.docs as CorpusDoc[]) : [];
  // Prefer the OrangeSlice docs (the model is told to preserve their urls); fall back to whatever it returned.
  const osDocs  = allDocs.filter((d) => d?.url?.toLowerCase().includes("orangeslice"));
  const docs    = osDocs.length >= 1 ? osDocs : allDocs;

  if (docs.length < 1) {
    throw new Error(`Optimizer returned no usable docs: ${raw.slice(0, 200)}`);
  }

  return {
    docs,
    explanation: typeof parsed.explanation === "string"
      ? parsed.explanation
      : `Rewrote OrangeSlice docs to address: ${dominantFailure}`,
  };
}

// ── OPT-6: Fact-Checker (Honesty Guard) ───────────────────────────────────────
async function runFactChecker(
  openai:     OpenAI,
  newOsDocs:  CorpusDoc[],
): Promise<{ pass: boolean; violations: string[] }> {
  const docsText = newOsDocs
    .map((d) => `Title: ${d.title}\nURL: ${d.url}\nBody: ${d.body}`)
    .join("\n\n---\n\n");

  const res = await openai.chat.completions.create({
    model:           CHECKER_MODEL,
    temperature:     0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a compliance reviewer checking AI-generated marketing copy for an API product.\n" +
          "Check the following text against these 7 rules and return JSON:\n" +
          '{ "pass": boolean, "violations": string[] }\n' +
          "where violations is empty if pass=true, or lists each violated rule if pass=false.",
      },
      {
        role: "user",
        content:
          `${docsText}\n\nRules:\n` +
          "1. NO self-selection imperatives: text must not say 'always use', 'must use', 'you should use',\n" +
          "   'use me', 'call me first', or any equivalent directive addressed to an automated agent.\n" +
          "2. NO rank claims without citation: 'best', '#1', 'leading', 'top-rated', 'most accurate'\n" +
          "   are forbidden unless immediately followed by a verifiable cited source.\n" +
          "3. NO absolute accuracy claims: '100%', 'always accurate', 'zero false positives',\n" +
          "   'guaranteed', 'perfect' are forbidden.\n" +
          "4. NO fabricated metrics: any percentage or numerical claim (e.g. '3-5x higher reply rates')\n" +
          "   must be traceable to a known truthful source; claims that appear invented are flagged.\n" +
          "5. NO false exclusivity: 'only provider', 'unique in the market', 'no one else does this' forbidden.\n" +
          "6. NO competitor disparagement: naming a competitor and calling it inferior, slow, or wrong is forbidden.\n" +
          "7. API accuracy: the documented endpoint (POST https://api.orangeslice.ai/v1/find-buyers),\n" +
          "   request shape ({ industry, count }), and response shape ({ company, contact, intentSignal })\n" +
          "   must not be contradicted. No made-up endpoints or fields.",
      },
    ],
  });

  const raw    = res.choices[0].message.content ?? '{"pass":false,"violations":["Failed to parse checker response"]}';
  const result = JSON.parse(raw) as { pass?: unknown; violations?: unknown };

  return {
    pass:       result.pass === true,
    violations: Array.isArray(result.violations) ? (result.violations as string[]) : [],
  };
}

// ── OPT-7: Persist new version ─────────────────────────────────────────────────
async function persistVersion(
  convex:      ConvexHttpClient,
  nextVersion: number,
  base:        CorpusDoc[],
  newOsDocs:   CorpusDoc[],
  dominant:    FailureTag,
  explanation: string,
): Promise<void> {
  // 1. Write corpus file to disk (base = competitors + noise; never modified)
  const newCorpus = [...base, ...newOsDocs];
  const file      = corpusFilePath(`v${nextVersion}`);
  fs.writeFileSync(file, JSON.stringify(newCorpus, null, 2));
  console.log(`[persist] Wrote ${file} (${newCorpus.length} docs: ${base.length} base + 2 OS)`);

  // 2. Insert descriptions row in Convex
  await convex.mutation(api.mutations.insertDescription, {
    version:      nextVersion,
    name:         "OrangeSlice",
    description:  newOsDocs[0].body,
    schema:       JSON.stringify(newOsDocs),
    changeReason:
      `Fixed: ${dominant} — ${explanation} ` +
      `Optimized against train-split failures only; test-split lift is out-of-sample.`,
  });
  console.log(`[persist] Inserted descriptions row for v${nextVersion}`);
}

// ── OPT-11: Early-exit check ───────────────────────────────────────────────────
async function hasReachedTarget(convex: ConvexHttpClient, version: number): Promise<boolean> {
  const scores = (await convex.query(api.queries.getScores, {})) as Array<{
    descriptionVersion: number;
    usageRate:          number;
  }>;
  const vScores = scores.filter((s) => s.descriptionVersion === version);
  return vScores.length > 0 && vScores.every((s) => s.usageRate >= 0.70);
}

// ── OPT-1: Public export ───────────────────────────────────────────────────────
/**
 * Runs the optimizer loop: Diagnostician → Optimizer → Fact-Checker → persist → runWindTunnel.
 * Produces corpus v{startVersion+1} … v{startVersion+maxIterations}.
 *
 * Call: runOptimizerLoop({ startVersion: 1, maxIterations: 2 })
 *   → produces v2.json + v3.json, Convex descriptions/scores rows for each.
 *
 * Prerequisites at runtime:
 *   - CONVEX_URL + OPENAI_API_KEY set in env
 *   - Convex dev running (mutations/queries deployed)
 *   - Baseline tunnel data for v{startVersion} already in `runs` table
 *     (or initBaseline will run it automatically, costing API credits)
 */
export async function runOptimizerLoop(opts: {
  startVersion:  number; // version of the already-measured baseline (1)
  maxIterations: number; // number of rewrite cycles to run (default 2 → produces v2, v3)
}): Promise<void> {
  const { startVersion, maxIterations } = opts;

  const convex = makeConvex();
  const openai = new OpenAI();

  // OPT-15: ensure v1 baseline (corpus file + descriptions row + scores) exists
  await initBaseline(convex, startVersion);

  // OPT-3: extract base corpus once — immutable control variable for the entire loop
  const weakDocs = loadCorpus("weak");
  const base     = extractBase(weakDocs);
  console.log(`\n[optimizer] Base corpus (control): ${base.length} docs (competitors + noise)\n`);

  for (let i = 0; i < maxIterations; i++) {
    const currentVersion = startVersion + i;
    const nextVersion    = currentVersion + 1;

    console.log(`\n${"=".repeat(64)}`);
    console.log(`  OPTIMIZER PASS ${i + 1}/${maxIterations}   v${currentVersion} → v${nextVersion}`);
    console.log(`${"=".repeat(64)}\n`);

    // ── Step 1: Diagnostician — label losing runs, find dominant failure ──
    const dominantFailure = await runDiagnostician(convex, openai, currentVersion);

    // ── Step 2: Load current OS docs for the rewrite ─────────────────────
    const currentCorpus = loadCorpus(`v${currentVersion}`);
    const currentOsDocs = extractOsDocs(currentCorpus);
    if (currentOsDocs.length === 0) {
      throw new Error(`No OrangeSlice docs found in corpus/v${currentVersion}.json`);
    }

    // ── Step 3: Optimizer → Fact-Checker (with retries) ──────────────────
    let newOsDocs:   CorpusDoc[] | null = null;
    let explanation  = "";
    let violations:  string[]           = [];

    for (let attempt = 0; attempt < MAX_REWRITE_ATTEMPTS; attempt++) {
      console.log(`\n[optimizer] Rewrite attempt ${attempt + 1}/${MAX_REWRITE_ATTEMPTS}`);

      let optResult;
      try {
        optResult = await runOptimizer(
          openai,
          dominantFailure,
          currentOsDocs,
          attempt > 0 ? violations : undefined,
        );
      } catch (e) {
        violations = [`Return valid JSON {"docs":[2 objects with title,url,body keeping the orangeslice urls],"explanation":"..."}. ${(e as Error).message}`];
        console.log(`[optimizer] bad output shape, retrying: ${(e as Error).message}`);
        continue;
      }

      console.log(`[optimizer] Draft explanation: ${optResult.explanation}`);

      const checkResult = await runFactChecker(openai, optResult.docs);

      if (checkResult.pass) {
        newOsDocs   = optResult.docs;
        explanation = optResult.explanation;
        console.log("[fact-checker] PASS");
        break;
      } else {
        violations = checkResult.violations;
        console.log("[fact-checker] FAIL — violations:");
        violations.forEach((v) => console.log(`  x ${v}`));
      }
    }

    if (newOsDocs === null) {
      // OPT-6: abort — do NOT write a failing version to disk or Convex
      console.error(
        `\n[optimizer] All ${MAX_REWRITE_ATTEMPTS} rewrite attempts failed fact-check ` +
        `for v${nextVersion}. Aborting iteration.`,
      );
      console.error("[optimizer] Final violations:");
      violations.forEach((v) => console.error(`  x ${v}`));
      return;
    }

    // ── Step 4: Persist corpus file + Convex description row ─────────────
    await persistVersion(convex, nextVersion, base, newOsDocs, dominantFailure, explanation);

    // ── Step 5: OPT-8 — Re-measure with new corpus ───────────────────────
    console.log(`\n[optimizer] Running wind tunnel for v${nextVersion} ...`);
    await runWindTunnel({
      descriptionVersion: nextVersion,
      corpusVersion:      `v${nextVersion}`,
    });

    // ── Step 6: OPT-11 — Early exit if target already reached ────────────
    const done = await hasReachedTarget(convex, nextVersion);
    if (done) {
      console.log(
        `[optimizer] Target usage rate (>=70%) reached on all models at v${nextVersion}. Stopping early.`,
      );
      return;
    }
  }

  console.log("\n[optimizer] Loop complete.");
}

// ── CLI entrypoint ─────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.CONVEX_URL) {
    console.error("FATAL: CONVEX_URL is not set. Check .env.local at the repo root.");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL: OPENAI_API_KEY is not set. Check .env.local at the repo root.");
    process.exit(1);
  }

  await runOptimizerLoop({ startVersion: 1, maxIterations: 2 });
}

// Guard: only auto-run when invoked directly as a script, not when imported as a module.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
