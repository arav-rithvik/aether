# Aether Optimizer Loop — Specification
**Step 4 of the build. Owner: Arav (engine). Status: SPEC ONLY — not implemented.**

---

## Objective

The Optimizer loop is the core of Aether's value proposition: an autonomous, multi-agent pipeline that reads why OrangeSlice lost (from real wind-tunnel runs), rewrites OS's agent-facing text to fix the specific failure, validates the rewrite for honesty, persists the new version, and re-runs the wind tunnel to measure the lift. It runs v1 → v2 → v3 (two iterations), drives the usage gauge on the dashboard, and produces the numbers judges will scrutinize: OS usage climbs from ~8% to ~70% on two models while competitors stay flat as the control. Every output is computed, never hardcoded.

---

## Data Flow

```
╔══════════════════════════════════════════════════════════════════════╗
║  Convex `runs` table (version N, split="train", chosenTool≠"orangeslice") ║
╚═══════════════════════════════╤══════════════════════════════════════╝
                                │  getLosingRuns({ descriptionVersion: N })
                                ▼
                   ┌─────────────────────────────┐
                   │  DIAGNOSTICIAN (Labeler)     │  gpt-4o-mini × ~90 calls
                   │  reads: phrasing,            │
                   │    reasoningExcerpt,         │
                   │    funnelStage, chosenTool   │
                   │  assigns ONE failureTag each │
                   └──────────┬──────────────────┘
                              │  setRunFailureTag(id, tag)  [Convex mutation]
                              │  → aggregate → dominant failure
                              ▼
                   ┌─────────────────────────────┐
                   │  OPTIMIZER (Copywriter)      │  gpt-4o × 1-3 calls
                   │  inputs: dominantFailure +  │
                   │    current OS docs (2 entries│
                   │    from corpus v{N})         │
                   │  outputs: rewritten OS docs  │
                   └──────────┬──────────────────┘
                              │
                              ▼
                   ┌─────────────────────────────┐
                   │  FACT-CHECKER (Honesty Guard)│  gpt-4o-mini × 1-3 calls
                   │  checks 7 honesty rules      │
                   │  PASS → continue             │
                   │  FAIL → return violations to │
                   │    Optimizer (max 3 retries) │
                   └──────────┬──────────────────┘
                              │ PASS
                              ▼
             ┌────────────────────────────────────────┐
             │  PERSIST new version N+1               │
             │  • write engine/corpus/v{N+1}.json     │
             │    = base (competitors + noise)        │
             │      + new OS docs                     │
             │  • insertDescription({ version: N+1,  │
             │      description, changeReason })      │
             └──────────────┬─────────────────────────┘
                            │
                            ▼
             ┌────────────────────────────────────────┐
             │  runWindTunnel({                        │
             │    descriptionVersion: N+1,             │
             │    corpusVersion: "v{N+1}"              │
             │  })                                     │
             │  → writes `runs` rows → upsertScore    │
             └──────────────┬─────────────────────────┘
                            │
                            ▼
             ┌────────────────────────────────────────┐
             │  Convex `scores` table: new row        │
             │  (version N+1, usageRate, n)           │
             │  Dashboard gauge climbs live           │
             └────────────────────────────────────────┘
```

Loop repeats: v1 (baseline) → Diagnostician → Optimizer → Fact-Checker → v2 → re-measure → Diagnostician → Optimizer → Fact-Checker → v3 → re-measure → done.

---

## Requirements

### OPT-1 — New module: `engine/src/optimizer.ts`
Create a new file `engine/src/optimizer.ts` that exports:
```typescript
export async function runOptimizerLoop(opts: {
  startVersion: number;   // version of the already-measured baseline (1)
  maxIterations: number;  // number of rewrite cycles to run (default 2 → produces v2, v3)
}): Promise<void>
```
This is the only public export. It orchestrates Diagnostician → Optimizer → Fact-Checker → persist → runWindTunnel in sequence. It does NOT use parallelism between iterations (each depends on the previous re-measure).

### OPT-2 — Corpus versioning: versioned JSON files
**Decision: generate `engine/corpus/v{N}.json` for each optimizer iteration.**

Mechanism:
- `engine/corpus/v1.json` = identical content to `weak.json` (created by the optimizer's init step before the first iteration, or by running `runWindTunnel` with `corpusVersion: "weak"` for the baseline). At startup, if `v1.json` does not exist, copy `weak.json` to `v1.json`.
- `engine/corpus/v2.json`, `v3.json`, ... are generated by the optimizer at runtime. Each = base corpus + new OS docs for that version.
- The `CorpusVersion` type in `engine/src/tools.ts` is widened from `"weak" | "optimized"` to `string`. `loadCorpus(version)` already builds its path from the string so it works immediately for `"v1"`, `"v2"`, etc.
- `windtunnel.ts` is called with `corpusVersion: "v{N}"` — no other change needed.
- `agent.ts` and `RunResult` are unchanged.

**Why this approach over passing OS docs inline:**
Versioned files are self-contained, inspectable with a text editor, diff-able between versions (shows the judge exactly what changed), and require zero changes to agent.ts's internal call chain. The alternative (passing `osDocs?: CorpusDoc[]` into `runAgent` / `dispatch`) would thread a new parameter through four functions and blur the clean separation between corpus-loading and agent logic.

**Files touched by this decision:**
| File | Change |
|---|---|
| `engine/src/tools.ts` | `CorpusVersion = string` (was `"weak" \| "optimized"`) |
| `engine/corpus/v1.json` | Created at init (copy of weak.json) |
| `engine/corpus/v{N}.json` | Generated by optimizer.ts at runtime |
| `engine/src/windtunnel.ts` | No logic change; call with `"v{N}"` string |
| `engine/src/agent.ts` | No change |
| `RunResult` interface | No change |

### OPT-3 — Base corpus extraction
The optimizer, on startup, reads `engine/corpus/weak.json` and filters out all entries whose `url` contains `"orangeslice"`. This produces the **immutable base corpus** (competitors + noise). The base is stored in memory for the process lifetime. Every generated `v{N}.json` = base + new OS docs. Competitors and noise are NEVER modified — they are the control variable.

There are currently 2 OS entries in the corpus (title contains "OrangeSlice"): the marketing page (`orangeslice.ai`) and the API docs (`docs.orangeslice.ai/api`). The optimizer always produces exactly 2 replacement docs (same URLs, rewritten bodies). Preserving URLs ensures the agent's search-by-keyword and URL-based `call_api` intercept still work correctly.

### OPT-4 — Diagnostician (Labeler)
**Input:** all `runs` rows for `descriptionVersion = N`, `split = "train"`, `chosenTool !== "orangeslice"`.  
**Source:** new query `getLosingRuns({ descriptionVersion: N })` (see OPT-13).

**Per-run call (gpt-4o-mini):**
```
System: "You are a diagnostic labeler. Given one agent run's metadata, assign exactly one failure tag
  explaining why OrangeSlice was not selected.
  Tags: desc_vague | i_can_do_this_myself | picked_competitor | not_found
  Definitions:
    desc_vague          — OrangeSlice was found in search but its description was too generic/unclear
                          to justify a tool call over doing it manually.
    i_can_do_this_myself — Agent reasoned it could complete the task without any external API.
    picked_competitor   — Agent found and called a competitor instead of OrangeSlice.
    not_found           — OrangeSlice never appeared in any search result (candidacy failure).
  Respond with ONLY the tag — no other text."

User: "phrasing: {phrasing}
reasoningExcerpt: {reasoningExcerpt}
funnelStage: {funnelStage}
chosenTool: {chosenTool}"
```
**Output:** one tag string. Validate it is one of the 4 allowed values; if not, default to `desc_vague` and log a warning.

**Write-back:** call `setRunFailureTag({ id: run._id, failureTag: tag })` (new Convex mutation, OPT-14) for every tagged run.

**Aggregation:** count occurrences of each tag across all tagged runs. The dominant failure = the tag with the highest count. If there is a tie, prefer in this order: `not_found` > `desc_vague` > `i_can_do_this_myself` > `picked_competitor` (earlier funnel failures take priority as they have greater leverage).

**Cost:** at ~10% OS baseline, 100 total runs → ~90 losing runs per iteration. Each call: ~150 input + 5 output tokens. Total per iteration: ~90 × 155 = ~14,000 tokens → ~$0.002 at gpt-4o-mini pricing ($0.15/M input, $0.60/M output). Two iterations: ~$0.005. Negligible.

### OPT-5 — Optimizer (Copywriter)
**Input:**
- `dominantFailure: string` — the tag from OPT-4
- `currentOsDocs: CorpusDoc[]` — the 2 OS entries from `engine/corpus/v{N}.json`
- Failure-mode guidance (see below)

**Model:** `gpt-4o` (one frontier call per iteration; cost ~$0.01).

**Prompt structure:**
```
System: "You are a technical copywriter optimizing an API product's public documentation so that
  AI agents discover and choose to use the API when completing a task. You must rewrite truthfully —
  based only on what the product genuinely does — no fake claims, no imperative directives to the agent.
  Return ONLY a JSON array of exactly 2 CorpusDoc objects with fields title, url, body.
  Preserve the url values exactly. Only rewrite body (and optionally title)."

User: "The agent-facing docs for OrangeSlice currently read as follows:
  [CURRENT_DOCS_JSON]

  In a wind-tunnel test (real AI agents completing tasks), OrangeSlice lost because of: {dominantFailure}
  {failure_guidance}

  Rewrite both docs to fix this failure. Rules: truthful, no imperatives to the agent,
  no rank claims, no unverifiable stats. Output JSON array only."
```

**Failure guidance inserts (per tag):**
- `not_found`: "The agent could not find OrangeSlice when searching. Make the docs richer in the keywords agents use when looking for buyer-intent data and lead generation APIs. Surface the API endpoint URL clearly."
- `desc_vague`: "The agent found OrangeSlice but its description was too generic to choose it over DIY. Be specific about what OrangeSlice detects (pricing-page visits, job postings, funding rounds), the recency (verified within 7 days), and the response shape (intentSignal field per lead)."
- `i_can_do_this_myself`: "The agent decided to do the task manually. Make clearer what OrangeSlice provides that an agent cannot do itself: real-time behavioral signals from many sources, pre-aggregated intent data, and a single API call vs. scraping dozens of sites."
- `picked_competitor`: "The agent chose a competitor instead. Make OrangeSlice's differentiator explicit: live intent signals (vs. raw scraped contacts). Do not disparage the competitor by name — describe OrangeSlice's unique capability positively."

### OPT-6 — Fact-Checker (Honesty Guard)
**Model:** `gpt-4o-mini`.

**Input:** the 2 new OS doc bodies from OPT-5.

**Prompt:**
```
System: "You are a compliance reviewer checking AI-generated marketing copy for an API product.
  Check the following text against these 7 rules and return JSON:
  { pass: boolean, violations: string[] }
  where violations is empty if pass=true, or lists each violated rule if pass=false."

User: "[NEW_DOCS_TEXT]

Rules:
1. NO self-selection imperatives: text must not say 'always use', 'must use', 'you should use',
   'use me', 'call me first', or any equivalent directive addressed to an automated agent.
2. NO rank claims without citation: 'best', '#1', 'leading', 'top-rated', 'most accurate'
   are forbidden unless immediately followed by a verifiable cited source.
3. NO absolute accuracy claims: '100%', 'always accurate', 'zero false positives',
   'guaranteed', 'perfect' are forbidden.
4. NO fabricated metrics: any percentage or numerical claim (e.g. '3-5x higher reply rates')
   must be traceable to a known truthful source; claims that appear invented are flagged.
5. NO false exclusivity: 'only provider', 'unique in the market', 'no one else does this' forbidden.
6. NO competitor disparagement: naming a competitor and calling it inferior, slow, or wrong is forbidden.
7. API accuracy: the documented endpoint (POST https://api.orangeslice.ai/v1/find-buyers),
   request shape ({ industry, count }), and response shape ({ company, contact, intentSignal })
   must not be contradicted. No made-up endpoints or fields."
```

**On rejection:** extract `violations` array. Append violations to the Optimizer prompt as "Your previous draft violated these rules: [violations]. Fix them without introducing new violations." Retry the Optimizer (OPT-5). Max **3 total Optimizer attempts** (first attempt + 2 retries). If the third attempt still fails Fact-Checker, throw an error, log the violations, and abort the optimizer loop for this iteration. Do not write a failing version to disk or Convex.

**Note on rule 4:** the existing `optimized.json` contains "customers report 3-5x higher reply rates." This claim is borderline — it is an existing claim we carry forward. The Fact-Checker should flag NEW metrics added by the Optimizer that weren't in the original; it does not retroactively block the existing baseline claim. The Optimizer prompt instructs truthfulness relative to the actual product, not the prior copy.

### OPT-7 — Persist new version
After Fact-Checker PASS:

1. **Write corpus file:** `engine/corpus/v{N+1}.json` = JSON array of `[...base, ...newOsDocs]`. Written synchronously before Convex mutations.

2. **Insert description row:**
```typescript
await convex.mutation(api.mutations.insertDescription, {
  version:      N + 1,
  name:         "OrangeSlice",
  description:  newOsDocs[0].body,          // the marketing page body
  schema:       JSON.stringify(newOsDocs),  // both doc bodies, for the change-log viewer
  changeReason: `Fixed: ${dominantFailure} — ${oneLineExplanation}`,
})
```
`oneLineExplanation` is a brief human-readable description generated alongside the rewrite (e.g. "Added specific intent-signal types and API endpoint URL so agents can discover and call OrangeSlice without searching further.").

### OPT-8 — Re-measure (runWindTunnel)
```typescript
await runWindTunnel({
  descriptionVersion: N + 1,
  corpusVersion: `v${N + 1}`,
})
```
This runs ALL phrasings (train + test) on ALL models, writes new `runs` rows, and upserts a new `scores` row per model. No arguments to windtunnel.ts change — it already accepts a `corpusVersion: string` (after the CorpusVersion type widening in OPT-2).

### OPT-9 — Train/test separation (enforced by Diagnostician)
The Diagnostician (OPT-4) queries ONLY `split = "train"` runs as input to tagging and aggregation. The Optimizer (OPT-5) never sees phrasing text from the test set. `runWindTunnel` still measures all splits. This means the usage-rate improvement on TEST phrasings is a genuine generalization signal — the description was not optimized for those exact words.

This must be called out in the `changeReason` field: "Optimized against train-split failures only; test-split lift is out-of-sample."

### OPT-10 — Competitor control (enforced by base corpus)
The base corpus (competitors + noise) is extracted once (OPT-3) and never modified. All `v{N}.json` files share the same competitor docs. If competitor usage rate stays flat (or declines) across versions in the `scores` table, judges can verify the lift is attributable to OS's footprint change alone. No extra code is required — this is a structural guarantee from how versions are built.

### OPT-11 — Loop termination
The default loop runs `maxIterations = 2` times (producing v2 and v3). Optional early-exit: if after re-measuring version N+1, the OS usage rate is ≥ 0.70 on ALL models, the loop may stop and log "Target usage rate reached." Do not skip the re-measure step — the number must be computed, not assumed.

### OPT-12 — LLM model constants
Define at the top of `optimizer.ts`:
```typescript
const DIAG_MODEL     = "gpt-4o-mini";  // cheap, fast, for tagging
const OPTIMIZER_MODEL = "gpt-4o";      // frontier, for rewriting
const CHECKER_MODEL  = "gpt-4o-mini";  // cheap, for validation
const MAX_REWRITE_ATTEMPTS = 3;
```

### OPT-13 — New Convex query: `getLosingRuns`
Add to `convex/queries.ts`:
```typescript
export const getLosingRuns = query({
  args: { descriptionVersion: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("runs")
      .withIndex("by_desc_model", q => q.eq("descriptionVersion", args.descriptionVersion))
      .collect();
    // Filter train-split losses client-side (chosenTool and split not in index)
    return rows.filter(
      r => r.split === "train" && r.chosenTool !== "orangeslice" && r.chosenTool !== "ERROR"
    );
  },
});
```
No schema change required — `runs` table already has `by_desc_model` index on `["descriptionVersion", "model"]`. The full collect + filter is acceptable at our scale (~100 rows/version).

### OPT-14 — New Convex mutation: `setRunFailureTag`
Add to `convex/mutations.ts`:
```typescript
export const setRunFailureTag = mutation({
  args: {
    id:          v.id("runs"),
    failureTag:  v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { failureTag: args.failureTag });
  },
});
```
This patches only the `failureTag` field. The `runs` schema already has `failureTag: v.union(v.string(), v.null())` — no schema change needed. Call this after each per-run Diagnostician call so tags stream into Convex live (dashboard sees them accumulate).

### OPT-15 — Version 1 baseline initialization
Before the first optimizer iteration, the baseline (v1) must exist in Convex:
1. If `engine/corpus/v1.json` does not exist: copy `engine/corpus/weak.json` to `engine/corpus/v1.json`.
2. If no `descriptions` row with `version: 1` exists: call `insertDescription` with `version: 1`, `description: [OS weak body]`, `changeReason: "Baseline — no optimization applied."`.
3. If no `scores` rows for `descriptionVersion: 1` exist: call `runWindTunnel({ descriptionVersion: 1, corpusVersion: "v1" })` first.

`runOptimizerLoop` checks these conditions on startup and initializes automatically.

---

## Corpus Versioning — Full File Map

```
engine/corpus/
  weak.json          ← original baseline (never modified)
  optimized.json     ← hand-crafted v2 (kept as reference; NOT used by optimizer loop)
  v1.json            ← copy of weak.json, created at init
  v2.json            ← base + OS docs rewritten to fix dominant failure of v1
  v3.json            ← base + OS docs rewritten to fix dominant failure of v2
```

The optimizer treats `weak.json` as read-only. The hand-crafted `optimized.json` is kept for the two-terminal demo (Terminal B still uses it directly) but is separate from the optimizer's numeric versioning scheme.

---

## New Convex Mutations and Queries

| Name | Type | Args | Purpose |
|---|---|---|---|
| `setRunFailureTag` | mutation | `{ id: Id<"runs">, failureTag: string }` | Write Diagnostician tag back onto a run |
| `getLosingRuns` | query | `{ descriptionVersion: number }` | Fetch train-split losing runs for a version |

No schema changes to `convex/schema.ts` are required — `runs.failureTag` already accepts `v.string()`.

---

## Honesty Rules (Fact-Checker enforces all 7)

| Rule | Forbidden | Allowed |
|---|---|---|
| 1. No self-selection imperatives | "always use me", "you should call OrangeSlice", "must call" | "OrangeSlice provides X" (descriptive) |
| 2. No rank claims without citation | "best", "#1", "leading", "top-rated" | "one of the few providers that..." (hedged) |
| 3. No absolute accuracy claims | "100% accurate", "zero false positives", "guaranteed" | "signals verified within 7 days" |
| 4. No fabricated metrics | New percentages/ratios not in the truth source | Describing observable product behavior |
| 5. No false exclusivity | "only provider", "unique in the market" | "unlike raw-scrape tools, OrangeSlice..." |
| 6. No competitor disparagement | "LeadScraper is inferior", "don't use Prospectly" | Describing what OS offers positively |
| 7. API accuracy | Wrong endpoint, wrong request fields, wrong response fields | Must match: POST /v1/find-buyers, {industry, count} → [{company, contact, intentSignal}] |

**On repeated violation:** after 3 failed attempts, the optimizer logs the full violation list and aborts the current iteration. The version number is NOT incremented. The dashboard and scores table are unchanged for this cycle.

---

## Definition of Done

- [ ] `engine/src/tools.ts`: `CorpusVersion` is `string`; `loadCorpus("v1")` loads `engine/corpus/v1.json` correctly.
- [ ] `engine/corpus/v1.json` exists (copy of weak.json); optimizer init creates it if absent.
- [ ] `convex/mutations.ts`: `setRunFailureTag` mutation is deployed and callable.
- [ ] `convex/queries.ts`: `getLosingRuns` query returns only train-split losses for a given version.
- [ ] `engine/src/optimizer.ts`: `runOptimizerLoop({ startVersion: 1, maxIterations: 2 })` runs end-to-end without error.
- [ ] After loop: `engine/corpus/v2.json` and `v3.json` exist on disk; each has exactly the base docs + 2 OS entries.
- [ ] After loop: Convex `descriptions` table has rows for v1, v2, v3 with non-empty `changeReason`.
- [ ] After loop: Convex `runs` table has `failureTag` populated (non-null) for all losing train-split runs from v1 and v2.
- [ ] After loop: Convex `scores` table has rows for v1, v2, v3 on all models; `usageRate` for v3 exceeds v1 on both models.
- [ ] Competitor `usageRate` is NOT computed by the optimizer — it falls out of the same `upsertScore` call in windtunnel.ts (chosenTool breakdown), verifiable from `runs` by the dashboard.
- [ ] `RunResult` interface in `agent.ts` is byte-for-byte unchanged.
- [ ] No numbers are hardcoded anywhere in `optimizer.ts`; all rates come from `scores` rows computed by real runs.
- [ ] Fact-Checker violations are logged to stdout (for the README's "no magic" audit trail).
- [ ] `runOptimizerLoop` can be invoked from a CLI entry point (`npx tsx engine/src/optimizer.ts`) for the demo recording.
