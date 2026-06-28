import "./env.js";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";

import { runAgent } from "./agent.js";
import {
  JOB,
  MODELS,
  RUNS_PER_PHRASING,
  TRAIN_PHRASINGS,
  TEST_PHRASINGS,
} from "./config.js";
import type { CorpusVersion } from "./tools.js";

// ── Convex client ─────────────────────────────────────────────────────────────

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

// ── Types ─────────────────────────────────────────────────────────────────────

type Split = "train" | "test";

interface RunItem {
  model: string;
  phrasing: string;
  split: Split;
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

/**
 * Run up to `concurrency` async tasks at once.
 * tasks: array of zero-arg async functions.
 */
async function pool<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIdx = 0;

  async function worker() {
    while (nextIdx < tasks.length) {
      const idx = nextIdx++;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Core export ───────────────────────────────────────────────────────────────

export async function runWindTunnel(opts: {
  descriptionVersion: number;
  corpusVersion: CorpusVersion;
  smoke?: boolean;
  concurrency?: number;
}): Promise<void> {
  const { descriptionVersion, corpusVersion, smoke = false, concurrency = 6 } = opts;

  // Build run list
  const models: readonly string[] = smoke ? [MODELS[0]] : MODELS;
  const phrasings: Array<{ phrasing: string; split: Split }> = smoke
    ? [{ phrasing: TRAIN_PHRASINGS[0], split: "train" }]
    : [
        ...TRAIN_PHRASINGS.map((p) => ({ phrasing: p, split: "train" as Split })),
        ...TEST_PHRASINGS .map((p) => ({ phrasing: p, split: "test"  as Split })),
      ];
  const repeats = smoke ? 2 : RUNS_PER_PHRASING;

  const items: RunItem[] = [];
  for (const model of models) {
    for (const { phrasing, split } of phrasings) {
      for (let i = 0; i < repeats; i++) {
        items.push({ model, phrasing, split });
      }
    }
  }

  const total = items.length;
  console.log(
    `\nWind tunnel: ${total} runs | corpus=${corpusVersion} | v${descriptionVersion}${smoke ? " [SMOKE]" : ""}\n`,
  );

  let completed = 0;

  // Build tasks — one per run item. Each writes to Convex immediately on finish.
  const tasks = items.map((item) => async () => {
    const { model, phrasing, split } = item;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let row: any;

    try {
      const r = await runAgent({
        task: phrasing,
        corpusVersion,
        model,
      });

      completed++;
      const w = String(total).length;
      console.log(
        `[${String(completed).padStart(w)}/${total}] ${model} "${phrasing}" → ${r.chosenTool} (${r.funnelStage})`,
      );

      row = {
        ts:                 Date.now(),
        job:                JOB,
        phrasing,
        split,
        model,
        descriptionVersion,
        toolsOnTable:       ["web_search", "call_api"],
        chosenTool:         r.chosenTool,
        calledTool:         r.calledTool,
        returnedUsableData: r.returnedUsableData,
        funnelStage:        r.funnelStage,
        failureTag:         null,
        reasoningExcerpt:   (r.reasoning ?? "").slice(0, 500),
      };
    } catch (err) {
      completed++;
      const msg = err instanceof Error ? err.message : String(err);
      const w = String(total).length;
      console.error(
        `[${String(completed).padStart(w)}/${total}] ERROR ${model} "${phrasing}": ${msg}`,
      );

      row = {
        ts:                 Date.now(),
        job:                JOB,
        phrasing,
        split,
        model,
        descriptionVersion,
        toolsOnTable:       ["web_search", "call_api"],
        chosenTool:         "ERROR",
        calledTool:         false,
        returnedUsableData: false,
        funnelStage:        "candidacy" as const,
        failureTag:         "error",
        reasoningExcerpt:   msg.slice(0, 500),
      };
    }

    // Write to Convex IMMEDIATELY so the dashboard animates live (not batched).
    await convex.mutation(api.mutations.insertRun, row);
  });

  await pool(tasks, concurrency);

  // ── Scorer ────────────────────────────────────────────────────────────────

  console.log("\n── Scoring ──");

  // Fetch all runs once; filter per model below. Large limit so multi-version re-runs aren't truncated.
  const allRuns = (await convex.query(api.queries.getRuns, { limit: 10000 })) as Array<{
    model: string;
    descriptionVersion: number;
    chosenTool: string;
  }>;

  for (const model of models) {
    const mine = allRuns.filter(
      (r) =>
        r.model === model &&
        r.descriptionVersion === descriptionVersion &&
        r.chosenTool !== "ERROR",
    );

    const n         = mine.length;
    const usageRate = n === 0 ? 0 : mine.filter((r) => r.chosenTool === "orangeslice").length / n;

    console.log(`  ${model}: orangeslice usage = ${(usageRate * 100).toFixed(1)}% (n=${n})`);

    await convex.mutation(api.mutations.upsertScore, {
      descriptionVersion,
      model,
      job: JOB,
      usageRate,
      n,
    });
  }

  console.log("\nDone.\n");
}

// ── CLI entrypoint ────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.CONVEX_URL) {
    console.error("FATAL: CONVEX_URL is not set. Check .env.local at the repo root.");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL: OPENAI_API_KEY is not set. Check .env.local at the repo root.");
    process.exit(1);
  }

  const smoke = process.argv.includes("--smoke");

  await runWindTunnel({
    descriptionVersion: 1,
    corpusVersion: "weak",
    smoke,
  });
}

// Guard: only auto-run when this file is the CLI entry point, not when imported as a module.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
