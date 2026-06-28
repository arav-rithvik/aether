# Aether — Agent Awareness Optimization (AAO)

**Make AI agents discover *and use* your product when they do a task.**

> SEO (2018) got you *ranked* when a human searched → a click.
> GEO (2023) got you *mentioned* when a human asked an AI → a citation.
> **AAO (2026, ours)** gets you *used* by an agent that's *doing a task* → **a tool call that runs.**

Aether is a fully AI-native B2B engine — a swarm of agents (no humans in the loop) that continuously reshapes a customer's **public, agent-facing footprint** so that when someone sends an AI agent to do a job the customer can do, the agent **discovers, chooses, and calls that customer.**

Example customer: **OrangeSlice** — "agentic sales enrichment," finds high-intent buyers.
One-liner: *"We make sure that when an agent does a job our customer sells, the agent picks our customer."*

---

## The result (measured, not hardcoded)

A real agent is given a real job — *"find me 20 high-intent leads and start outreach"* — with only its natural **web + code** hands (`web_search` + `call_api`). It must discover a tool, read its docs, and write the API call itself. We change **one variable**: OrangeSlice's public footprint.

| Version | gpt-4o | gpt-4o-mini | competitor (control, gpt-4o) |
|---|---|---|---|
| **v1** (weak footprint) | **0%** | **0%** | 27 / 50 |
| **v2** (after 1 optimization pass) | **42%** | **72%** | 6 / 50 |

- **OrangeSlice usage: 0% → 42% / 72%.** Competitor share *fell* (27→6) — OrangeSlice took it directly.
- **Every number is computed from real agent runs** (`scores` aggregated from `runs`). Nothing is typed by hand.
- **v3 was blocked by our Fact-Checker** — it rejected all rewrite attempts as unverifiable and aborted rather than ship a dishonest claim. Calibrated honesty over a bigger number.

*(Numbers come from a live run and vary slightly between runs — the agents are stochastic by design; that's why each phrasing is sampled ~10×.)*

---

## How it actually works

1. **The medium we optimize = OrangeSlice's public, agent-readable text** — its web footprint and its API docs (`engine/corpus/*.json`). Not its backend, not an MCP install. Just the words an agent *reads* while working.
2. **The agent is real.** A multi-turn loop (`engine/src/agent.ts`) on GPT-4o / GPT-4o-mini with two generic tools: `web_search` (over our controlled corpus) and `call_api` (its "code" hands). OrangeSlice is **never** handed to it — it must *find* it.
3. **The controlled retrieval surface (the honest workaround).** We can't run real SEO on a live site in a hackathon window, so our `web_search` returns a corpus *we* control — OrangeSlice + real competitors + noise. We simulate the **input** (what the web says), never the **outcome** (the agent's choice is 100% real). Wind-tunnel analogy: *real plane (the agent), controlled air (the corpus).*
4. **The closed loop** measures, diagnoses, rewrites, and re-proves — see the swarm below.

**On-camera honesty line:** *"We control the retrieval surface so it's reproducible on camera — in production it's the live web and the customer's real footprint, done over days. We're showing the mechanism, not editing OrangeSlice's live site."*

---

## The Aether swarm → where each agent lives in the code

The company is an AI-native org: each role replaces a human agency function. Code matches the claim:

| Role | What it does | In the code |
|---|---|---|
| 🔭 **Scout** | the job + the phrasings to test (train/test split) | `engine/src/config.ts` |
| 🌬️ **Prober** | runs the agent N× × 2 models, records every pick/call | `engine/src/windtunnel.ts` |
| 🩺 **Diagnostician** | LLM labels *why* OrangeSlice lost (`desc_vague`, `i_can_do_this_myself`, `picked_competitor`, `not_found`) | `engine/src/optimizer.ts` |
| ✍️ **Optimizer** | rewrites OrangeSlice's footprint + API docs to fix the top failure | `engine/src/optimizer.ts` |
| 🛡️ **Fact-Checker** | rejects untruthful claims / "always use me" / fake stats; aborts rather than lie | `engine/src/optimizer.ts` |
| 📊 **Scorer** | aggregates runs → usage rate, computes lift, train/test + competitor control | `engine/src/windtunnel.ts` → `scores` |
| 🚀 **Publisher** | ships the optimized footprint (demo = swaps the corpus version) | `demo/run-universe.ts` |
| 👁️ **Monitor** | *(pitch only)* re-runs forever as models drift | — |

**The loop:** Scout picks the job → Prober runs it → Diagnostician finds why we lost → Optimizer rewrites the footprint → Fact-Checker approves → Prober re-runs → Scorer proves the lift → Publisher ships it.

---

## Repo structure

```
engine/     The AI engine (Arav)
  src/agent.ts        real multi-turn agent: web_search + call_api, ambient discovery (OpenAI + Anthropic)
  src/windtunnel.ts   Prober + Scorer — runs the grid, writes runs, computes scores (live to Convex)
  src/optimizer.ts    Diagnostician + Optimizer + Fact-Checker — the rewrite loop
  src/tools.ts        controlled web_search + the call_api intercept (OrangeSlice / competitors mocked)
  src/config.ts       the job + train/test phrasings + models
  corpus/             the controlled "web": weak.json, optimized.json, v1.json, v2.json (OS = only variable)
convex/     Reactive DB + the frozen shared contract (Arav)
  schema.ts           corpus · descriptions · runs · scores
  queries.ts          getScores / getRuns / getDescriptions / getLosingRuns / getCorpus
  mutations.ts        insertRun / upsertScore / insertDescription / setRunFailureTag
web/        Next.js dashboard (Rithvik) — live gauge, agent swarm, diagnosis, change-log, proof chart
demo/       run-universe.ts — the cinematic two-terminal demo (Universe A vs B)
```

---

## Reproduce it

**Prerequisites:** Node 22+, an `OPENAI_API_KEY`.

```bash
# 1. Install
npm install
npm --prefix engine install
npm --prefix web install

# 2. Configure Convex + key  (.env.local at the repo root)
#    OPENAI_API_KEY=sk-...
#    CONVEX_URL=https://<your-deployment>.convex.cloud
npx convex dev            # provisions the deployment + deploys functions (leave running)

# 3. Baseline wind tunnel — 100 real agents, expect ~0% (honest "before")
npx convex run seed:clearAll
npm --prefix engine run tunnel

# 4. Optimizer — diagnose → rewrite → re-prove (the climb)
npx tsx engine/src/optimizer.ts

# 5. The two-terminal demo
npm run demo:a           # before Aether → agent never finds OrangeSlice
npm run demo:b           # after Aether  → agent finds + calls OrangeSlice, real leads

# 6. The dashboard (live, reactive)
npm --prefix web run dev   # http://localhost:3000
```

The dashboard auto-connects to the live Convex deployment and shows the climb as the engine writes it — no extra wiring.

---

## Tech stack

- **Monorepo:** TypeScript + npm workspaces (ESM), Node 22
- **Engine:** OpenAI SDK (`gpt-4o` + `gpt-4o-mini`), Anthropic SDK (wired), `tsx`, `dotenv`
- **Backend/DB:** Convex (reactive — live subscriptions, no websocket code)
- **Frontend:** Next.js 16, React 19, Tailwind v4, Framer Motion
- **Models:** `gpt-4o` (frontier) + `gpt-4o-mini` (volume runs + the diagnosis labeler)

---

## What's real vs represented (calibrated honesty)

- ✅ **Real:** the agent loop, every tool call, the usage-rate numbers, the optimizer's rewrites, the train/test split, the competitor control, the Fact-Checker's veto.
- 🎛️ **Controlled (and stated):** the retrieval surface (our corpus stands in for the live web's content about OrangeSlice — what real SEO shapes over days).
- 🗣️ **Pitch-only (not built):** live web crawling, real OrangeSlice integration, MCP installs, the always-on Monitor, the cross-customer predictor.

We never fake the engine — the code matches every claim above.
