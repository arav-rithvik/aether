# Hello, we are at the hackathon today. Our project is aether. Use the aether.md file to get our full blueprint. Then guide us through the entire thing. Make sure we understand every single thing. Go from top to bottom. Take your time to understand it and teach it in technical terms to us. After this we should be able to write the PRD, contracts and start building. Do not skip any details in the document. also if something is super technical dive deep and explain us those technical concepts. I should be an expert on this by the end of the conversation. I am Arav so explain me exactly what I am building and then what rithvik is building. (Master Doc: Context + PRD + Build Plan)
*The single source of truth. If you are an agent or teammate opening this cold: read §0 → §3 → §9 → §10, then start. Everything we ever decided is here.*

> **Owners:** Arav (backend / AI / ML — the engine) · Rithvik (frontend / design — dashboard + video).
> **Two-person team. ~6 hours. Goal: a real, working pipeline + a 3-min video, both judge-ready.**
> **Deliverables:** (1) a **GitHub repo** (they check the code matches the claims), (2) a **3-minute demo video** (this decides the winner).

---

## 0. HOW TO USE THIS DOC
- This is the **brain**. Any new Claude Code session on either Mac should be pointed at this file first.
- **Locked = decided, don't relitigate.** Open questions are in §14.
- If something here conflicts with older files (`aether.md`, `MASTER.md`), **this wins.**
- Cardinal rule for the build: **the engine is REAL; the video is BEAUTIFUL. Never fake the engine — they read the code.**

---

## 1. WHAT AETHER IS (one screen)
- **Category we coined:** **Agent Awareness Optimization (AAO / "2AO")** — the successor to SEO → GEO.
  - **SEO (2018):** get *ranked* when a human searches → a click.
  - **GEO (2023):** get *mentioned* when a human asks an AI → a citation.
  - **AAO (2026, ours):** get *used* by an agent that's *doing a task* → a **tool call that runs.**
- **The company:** a fully **AI-native B2B SaaS** — a swarm of agents (no humans) that continuously shapes a customer's **agent-facing footprint** so that when someone sends an AI agent to do a task the customer can do, the agent **discovers + uses that customer.**
- **Example customer = OrangeSlice (OS)** — YC S25, "agentic sales enrichment spreadsheet," finds **high-intent buyers**. (Founder **Vihaar Nandigala** runs this hackathon → making OS the hero flatters the organizer.)
- **One-liner:** *"We make sure that when an agent does a job our customer sells, the agent picks our customer."*
- **The wedge vs GEO (say this):** GEO gets you *mentioned* to a human who decides. AAO gets you *used* by an agent that decides itself. Our scoreboard = **usage rate**, a number GEO can't show.

## 2. HOW IT ACTUALLY WORKS (the mechanism — locked)
- **The ambient path (no human in the loop, no MCP install required):** an agent with **web + code** (Codex / Claude Code) can, mid-task, **web-search → find OrangeSlice → read its API/docs → call its API in code.** The human said "find 20 leads"; the agent did the discovery + the call itself. **The human never knows OrangeSlice exists.**
  - MCP is just a *pre-installed* shortcut (needs a one-time human connect). The **API+docs path needs zero install** — this is the true ambient route and what we optimize for.
- **Two layers:**
  1. **Candidacy** (get OS *onto the menu*) = the agent finds OS when it searches. This is **GEO + agent-readable docs/distribution.** Table stakes; the *customer/business* owns it in production. **NOT our novel IP.**
  2. **Invocation** (get OS *used*) = once OS is reachable, the agent **chooses + actually calls** it over doing-it-itself or a rival. **This is our IP.**
- **What we optimize = OS's PUBLIC agent-facing footprint** (its docs, API description, positioning, tool description) so the agent finds it, understands it can do the task, knows how to call it, and prefers it. Public → we never need OS's backend.
- **Honest constraints (do not violate / do not overclaim):**
  - We **cannot** retrain the model, **cannot** force an agent to connect to anything, **cannot** edit OS's live site, **cannot** make the real ChatGPT index changes in hours (crawl latency).
  - "No human in the loop" is true for **usage decisions**, not the one-time connect (when MCP is used).
  - We touch **nobody's agent**. Aether is backend-only; agents never know Aether exists.

## 3. THE ALGORITHM (the real engine — what we build)
A closed loop, per customer, per job:
1. **The job + phrasings.** One job: *"find high-intent buyers and start outreach."* A small set of ways to ask it (train + held-out test sets — see §7).
2. **Wind tunnel (measurement).** Run a **real agent** (GPT + Claude) on each phrasing **~10×**, with a toolset on the table: **OS's door + a realistic competitor + "do it yourself."** Record what it actually picked + called. Aggregate → a **usage rate**.
3. **Diagnose.** A small LLM "labeler" reads each run's reasoning and tags **why OS lost**: `desc_vague`, `i_can_do_this_myself`, `picked_competitor`, `auth_friction`, `not_found`.
4. **Optimize.** Read the failure tags → rewrite **OS's description / footprint** (`v1 → v2 → v3`), each change annotated with *why*. Truthful claims only (no "ALWAYS use me" injection — that's tool-poisoning, instant disqualifier).
5. **Re-prove.** Re-run the same phrasings → usage rate climbs (e.g. **8% → 34% → 71%**), competitor held **flat as control**, on **two models**.
6. **(Pitch only, not built):** this runs forever per customer as models drift; the cross-customer data trains a model that predicts good descriptions without testing.
- **The funnel we measure each run:** **Candidacy** (did OS appear / get found?) → **Selection** (picked OS over rival/DIY?) → **Execution** (call ran + returned usable data?).

## 4. THE DEMO — FINAL VERDICT (locked)
**Two pre-recorded terminals + the engine dashboard, wrapped in animation.** Real engine, beautiful video.

**The two terminals (the visceral "future" moment):** a real agent given *"find me 20 high-intent leads and start outreach,"* with a **search tool we control** (a retrieval index over a corpus WE built) + OS's **mocked API**. The agent *really* searches, reads, and writes the call — nothing pre-decided.
- **Terminal A — "before Aether":** corpus has OS's weak/buried footprint → agent searches, can't justify OS → **does it itself. No OrangeSlice.**
- **Terminal B — "after Aether":** corpus has OS's **optimized** footprint → agent **finds OS, reads it, calls its API, returns leads.** It *chose* OS on its own.
- **Only variable changed = OS's footprint.** Rigorous, honest, reproducible (no live-crawl gamble), and it shows the **full ambient pipeline** (search → find → read → call). This crushes "pick from 2 given tools."

**The dashboard (the depth + proof):** the **100-agent swarm** spinning up, the **diagnosis** (why agents skipped OS), the **change-log** (description v1→v2→v3 with *why*), the **usage gauge climbing** over versions on **two models**, competitor flat.

**Honest on-camera line:** *"We control the retrieval surface so it's reproducible on camera — in production this is the live web and the customer's own footprint, which they delegate to us. We're showing the mechanism, not editing OrangeSlice's live site."*

**Why this wins:** real (survives code review) + ambient (human never named OS) + a measurable number that moves + a new category we named.

## 5. JUDGES — who they are + what they reward
~10–11 judges, **mostly technical** (full bios in `judge-analysis.md` if present). They collectively reward:
- **A closed agentic loop that ACTS + measures** — not a dashboard with an AI button. ✅ our wind tunnel.
- **Real ML / real statistics, not a GPT wrapper** — the optimizer + measured rates. ✅
- **A single, honest outcome number on real behavior** (usage rate, with a control). ✅
- **Calibrated honesty** — say what's real vs represented; show the competitor flat; admit constraints. Judges *trust* this. ✅
- **Beautiful, non-generic UI** (design-minded judges) — Rithvik's dashboard + the video. ✅
- **Why-now + inevitability** — agents becoming the buyers; a picks-and-shovels infra bet. ✅
- **Category creation** — SEO → GEO → **AAO**, named by us. ✅
- **What loses:** vaporware, faked demos, "we hand-tuned one tool to win," over-claiming magic, generic AI-slop UI.

## 6. ARCHITECTURE / STACK (locked)
**One TypeScript monorepo. One GitHub repo. Both Macs work in it.**
- **`/engine`** (Arav) — Node/TS. The wind tunnel (agent runner with a `web_search` tool over our corpus + OS mocked API + competitor tool), the optimizer loop, the failure-tagger. Calls **OpenAI + Anthropic** SDKs. Writes results to Convex.
- **`/convex`** (Arav, shared schema) — Convex DB + queries/mutations. **Reactive** → the dashboard auto-updates live as runs stream in (the gauge animates for free). Tables in §8.
- **`/web`** (Rithvik) — Next.js + React + Tailwind + **Framer Motion**. The dashboard: live gauge, diagnosis panel, change-log diff viewer, the animated agent-swarm, the two-terminal visual.
- **`/demo`** (Arav builds, both use) — the **agent-CLI** that produces the clean terminal trace for the two recordings + the **corpus files** (two versions: weak / optimized).
- **Why Convex:** sponsor-available, reactive (no websocket plumbing), one language end-to-end. **Why this split:** Arav and Rithvik touch *different folders* → near-zero merge conflicts.
- **Models:** OpenAI (sponsor credit, ~$50) as primary agent + cheap model for tagging; Anthropic Claude as the 2nd model for the generalization proof. Use cheap models for the high-volume runs; frontier only where needed.

## 7. THE TEST INPUTS (the one job, locked)
- **Job:** "find high-intent buyers and start outreach."
- **Train phrasings (set A — optimizer may see):**
  - "find me 20 high-intent B2B buyers and start outreach"
  - "get companies likely to buy our SaaS and email them"
  - "I need warm leads, reach out to them"
- **Held-out phrasings (set B — measure on these, optimizer NEVER sees):**
  - "build a prospect list and run a cold campaign"
  - "grow my pipeline this quarter" *(indirect — agent must infer the task)*
- **Runs:** ~10 per phrasing per model. ~5–10 phrasings total. **Build no more.**
- **Why train/test split:** proves we optimized the **door**, not memorized the **questions.**

## 8. THE CONVEX SCHEMA (the frozen contract — agree HOUR 1)
This is the **one shared interface.** Arav writes it; Rithvik reads it. Freeze it first, then both work independently.
```
corpus        { id, version: "weak"|"optimized", docs: [ {title, url, body} ] }   // what the search tool returns
descriptions  { id, version: number, name, description, schema, changeReason }     // OS door, versioned
runs          { id, ts, job, phrasing, split: "train"|"test", model, descriptionVersion,
                toolsOnTable: [string], chosenTool: string, calledTool: boolean,
                returnedUsableData: boolean, funnelStage: "candidacy"|"selection"|"execution",
                failureTag: string|null, reasoningExcerpt: string }
scores        { id, descriptionVersion, model, job, usageRate: number, n: number }  // aggregated → the gauge
```
- Dashboard subscribes to `scores` (live gauge), `descriptions` (change-log diff), `runs` (diagnosis tags).

## 9. THE TWO-PERSON SPLIT (exact ownership)
**Arav — the brain (`/engine`, `/convex`, `/demo`):**
- Convex schema (§8) — write it FIRST, commit, tell Rithvik.
- The agent runner: real LLM loop with `web_search(corpus)` + `orangeslice_find_high_intent_buyers(mocked)` + `competitor` tool + DIY.
- The wind tunnel: run phrasings × models × repeats → write `runs` → compute `scores`.
- The failure-tagger (small LLM labeler) + the optimizer (rewrite description v2/v3 from tags).
- The `/demo` agent-CLI + the two corpus versions for the recorded terminals.

**Rithvik — the face (`/web`) + the video:**
- The dashboard (Next.js + Convex client): **live usage gauge**, **diagnosis panel** (failure tags), **change-log diff viewer** (v1→v2→v3 + reasons), **animated 100-agent swarm**, **two-terminal panel**.
- Tailwind + Framer Motion. **Non-generic, hi-fi.** This is a judged surface.
- Owns the **3-min video edit** (§12) — wraps the real terminal recordings + dashboard in motion graphics.

**Integration point = the Convex schema only.** Until it's frozen, each mocks the other side (Arav writes fake rows; Rithvik reads them).

## 10. IMPLEMENTATION PLAN — 6 HOURS, 0 → 100
> Both Macs, Claude Code. Commit small + often. Pull before you push. Different folders = safe.

**H0 · 0:00–0:30 — SETUP (both, together)**
- Arav: create GitHub repo `aether`, push skeleton (`/engine /convex /web /demo`), invite Rithvik.
- Both: `git clone`, install deps, set env keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, Convex). `npx convex dev`.
- Arav: write + commit the **Convex schema (§8).** ← unblocks Rithvik.
- Lock the corpus + phrasings (§7). ✅ Gate: both repos run, schema pushed.

**H1 · 0:30–1:30 — CORE (parallel)**
- Arav: agent runner that takes (task + tools) and returns the real tool choice for ONE phrasing, ONE model. Print a clean trace.
- Rithvik: Next.js + Convex connected; empty **gauge** reads `scores`; layout shell. ✅ Gate: one real agent run prints a choice; dashboard renders live from Convex.

**H2 · 1:30–2:30 — WIND TUNNEL + PANELS (parallel)**
- Arav: loop phrasings × ~10 runs × 2 models → write `runs` → compute `scores`. Baseline ~**0–10%**.
- Rithvik: **diagnosis panel** + **change-log** reading `runs`/`descriptions`. ✅ Gate: a real baseline number appears live on the gauge.

**H3 · 2:30–3:30 — OPTIMIZER + ANIMATION (parallel)**
- Arav: failure-tagger → rewrite OS description v2/v3 → re-run → **scores climb** on both models, competitor flat.
- Rithvik: gauge climb animation + the **100-agent swarm** viz. ✅ Gate: gauge climbs 0→~70% from REAL re-runs.

**H4 · 3:30–4:30 — THE TWO TERMINALS (parallel)**
- Arav: `/demo` agent-CLI — clean terminal trace of agent **search → find → call OS**; Universe A (weak corpus) vs B (optimized). Record-ready.
- Rithvik: **two-terminal panel** + final dashboard polish. ✅ Gate: Terminal A = no OS; Terminal B = OS found + called, real leads + timestamp.

**H5 · 4:30–5:30 — INTEGRATE + TEST (both)**
- Run the whole thing end-to-end. Verify every number is **computed, not hardcoded.** Run the §13 checklist. Capture the two terminal recordings. Fix bugs. Freeze the repo.

**H6 · 5:30–6:00 — RECORD + SUBMIT (both)**
- Rithvik: record + edit the **3-min video** (§12). Arav: clean README so the **code matches every claim** (judges check). Submit **git + video.** 🎬

## 11. GIT WORKFLOW (two Claude Macs)
- **One repo, branch `main`.** Both work on `main` (folders are separate → safe). Optional: feature branches + fast PRs if you prefer.
- **Loop:** `git pull --rebase` → work → `git add -A` → `git commit -m "..."` → `git pull --rebase` → `git push`. **Always pull before push.**
- **The only shared file = the Convex schema.** Freeze it H0; after that it rarely changes — if it must, ping the other person before editing.
- **Commit small + often** (every working slice). Don't sit on a 2-hour uncommitted change.
- If a Claude Code agent is told to build: point it at **this file**, tell it its folder (`/engine` or `/web`), and the schema (§8). It has full context.

## 12. THE VIDEO (3 min — this decides it)
- **0:00–0:20 — Cold open (the future):** founder tells their agent *"find me 20 leads."* Agent works, recommends a rival; **OrangeSlice never appears.** *"In the agent economy, if the agent can't see you, you don't exist."*
- **0:20–0:50 — Category arc:** SEO → GEO → **AAO**, kinetic typography, known companies as examples. *"We coined it: Agent Awareness Optimization."*
- **0:50–2:10 — The two terminals + dashboard (the proof):** Terminal A (agent ignores OS) → Aether's swarm spins up, diagnoses, rewrites OS's footprint v1→v2→v3 → Terminal B (agent **finds + calls OS**). **Gauge 0% → 71% on two models, competitor flat.** Flash the **real tool-call** for 2–3s.
- **2:10–3:00 — Vision close:** the swarm runs forever, per customer, no humans — *"infrastructure for GTM when the users are agents."*
- **Rules:** every flashy beat paired with a **real artifact** (real trace, real number). Cinematic carries attention; proof carries belief. Motif: **human-view vs agent-view (the hidden wavelength).** Animation **wraps** real footage — never replaces it.

## 13. DEFINITION OF DONE (judge-ready checklist)
- [ ] Real agent run produces a real tool choice (not scripted).
- [ ] Baseline usage rate **computed from real runs**, ~0–10%.
- [ ] Optimizer rewrites OS description; usage rate **climbs to ~70%** on **two models**; competitor **flat as control**.
- [ ] Measured on **held-out** phrasings the optimizer never saw.
- [ ] Terminal A: agent does NOT use OS. Terminal B: agent **finds + calls** OS, returns leads + timestamp.
- [ ] Dashboard live: gauge, diagnosis tags, change-log diffs, swarm.
- [ ] **No hardcoded numbers anywhere.** Tune descriptions; never touch the numbers.
- [ ] README explains the architecture; code matches every claim in the video.
- [ ] 3-min video exported + submitted; git repo pushed + public.

## 14. OPEN DECISIONS (resolve fast if they come up)
- [ ] Use the real `codex`/`claude` CLI for the terminals, or our own clean agent-CLI? → **default: our own CLI** (controllable, clean on camera). Upgrade to real CLI only if time.
- [ ] Exact competitor tool wording (pick a real rival, e.g. a generic "lead scraper").
- [ ] How many phrasings/runs fit the $50 budget for an honest number (start 5×10×2, scale down if needed).

## 15. NOT BUILDING (cut — pitch words only)
- Live web GEO / real crawling, real OS integration, MCP installs, distribution/registries, multi-job, the `s_DIY` meter, the production proxy, the cross-customer predictor, the "always-on swarm" infra. **All described in the pitch, none built.**

## 16. GLOSSARY
- **AAO / 2AO:** Agent Awareness Optimization — optimizing whether agents select + use a product to do a task.
- **Wind tunnel:** the harness that runs real agents over the job and measures candidacy → selection → execution.
- **Usage rate:** % of runs where the agent picks + calls OS for the task. The headline number.
- **Door / footprint:** OS's agent-facing text (tool description, docs, positioning) — the thing Aether rewrites.
- **Corpus:** the document set our controlled `web_search` tool returns; has a `weak` and an `optimized` version.
- **Candidacy / Selection / Execution:** the three funnel gates.
- **Controlled retrieval:** giving the agent a search tool over our corpus (reproducible) instead of the live web.

---
*Status: everything locked. Build now (§10). This file is the brain — keep it updated as the single source of truth.*

---

## 17. THE AETHER SWARM (the AI-native org roster)
The company = a swarm of agents that replaces a human SEO/GEO agency. **Two kinds of agents — never mix them up:**
- **Our employees** = the optimization swarm (below) — they do the work.
- **NOT ours** = the "judge" agents in the wind tunnel (GPT/Claude playing *Johnny's agent*). We **measure** them; they must stay clean/untouched.

**The swarm (each replaces a human agency role):**
- 🔭 **Scout (Task Mapper)** — the jobs an ICP hands an agent that the customer can do, + the phrasings to test. *Replaces: strategist.* → `config.ts`
- 🌬️ **Prober (Wind-Tunnel Operator)** — runs the judge-agents on the task many times, records what each picked/called. *Replaces: QA/testing analyst.* → `windtunnel.ts`
- 🩺 **Diagnostician (Labeler)** — reads each run's reasoning, tags **why the customer lost** (`desc_vague`, `i_can_do_this_myself`, `picked_competitor`, `not_found`). *Replaces: data analyst.* → labeler in `optimizer.ts`
- ✍️ **Optimizer (Copywriter)** — rewrites the customer's door/footprint (description v2→v3) to fix the top failure. *Replaces: SEO/GEO copywriter.* → `optimizer.ts`
- 🛡️ **Fact-Checker (Honesty Guard)** — verifies every new claim is **true** (no "always use me" injection, no fake "#1"). *Replaces: legal/brand review.* → guardrail H5
- 📊 **Scorer (Analyst)** — aggregates runs into the **usage rate**, computes lift, runs the train/test + competitor-control checks. *Replaces: metrics analyst.* → `scores`
- 🚀 **Publisher (Deployer)** — pushes the optimized footprint to the customer's real surfaces. *Replaces: deployment/ops.* → *(prod; in demo = swaps the corpus/description)*
- 👁️ **Monitor (Drift Watcher)** — re-runs forever as models update + rivals change, re-triggers the loop. *Replaces: ongoing account manager.* → *(the "always-on" part)*

**The loop:** Scout picks the job → Prober runs it → Diagnostician finds why we lost → Optimizer rewrites the door → Fact-Checker approves → Prober re-runs → Scorer proves the lift → Publisher ships it → Monitor watches for drift → repeat.

**Built for the 6-hour demo:** Prober, Diagnostician, Optimizer, Scorer (+ light Fact-Checker). **Pitch-only (described, not built):** Scout, Publisher, Monitor — the "runs forever, per customer, no humans" story.

---

## 18. THE MEDIUM + THE DUMMY ORANGESLICE (read this — kills the recurring confusion)

**The medium we optimize = OrangeSlice's public, agent-readable TEXT.** Not an MCP install. Not their backend. Just the words an agent *reads* while doing a task.

**Two optimizable surfaces (this is "the dummy OrangeSlice"):**
1. **Corpus docs** = OS's *web footprint* — what our controlled `web_search` returns (`engine/corpus/*.json`). → makes the agent **find + trust** OS.
2. **Call description** = how to invoke OS — the `description` injected on the `orangeslice_find_high_intent_buyers` function in `agent.ts`. → makes the agent **actually call** it.
- We rewrite **both** weak → optimized. We fully control both. That *is* the stand-in OrangeSlice.

**On "are we doing tool descriptions?"**
- ❌ NOT **MCP tool descriptions / MCP installs** — that framing is dropped.
- ✅ We DO still optimize a **call description** (surface #2) + the **web docs** (surface #1). Both are just "OS's public text." The word changed; the idea didn't.

**Why the corpus exists (the SEO workaround):**
- Real SEO/GEO takes **days** (crawl + index) and we **can't touch OS's live site**. A live-internet demo is impossible in our window.
- So the corpus is a **controlled stand-in for "the web's content about OS."** We swap it weak→optimized **instantly**, and the agent's choice flips **in seconds** — reproducible, on camera.
- **Legit, not cheating:** the agent's search/read/decide/call is **100% real**; we only control *what it retrieves* — which in production is the live web shaped by real SEO (done over days, customer delegates their footprint). We simulate the *input*, never the *outcome*.

**The wind-tunnel analogy (use in the pitch):** you don't fly the plane through a real storm — you control the airflow in a tunnel to test the wing. **Real plane (the agent), controlled air (the corpus).**

**On-stage honesty line:** *"We control the retrieval surface so it's reproducible on camera — in production it's the live web and the customer's real footprint, done over days. We're showing the mechanism, not editing OrangeSlice's live site."*

---

## 19. COMPETITIVE LANDSCAPE (who else is doing this)
Two real players are building in our space, on **different layers of the same stack.**

- **Morphiq (trymorphiq.com)** — a near-clone of our thesis, scoped to **developer tools + coding agents** (Cursor / Codex / Claude Code). Simulates agents on real repo tasks → optimizes docs, SDKs, CLIs, MCP schemas so the agent picks you. Live product + a public leaderboard (**Morphiq Bench**). **Same invocation layer as us; ahead of us in their lane.**
- **Kachi (kachi.ai)** — **AEO / AI-visibility for marketers.** Makes your website read + cited by LLMs and agentic browsers; ships a dashboard of AI-agent visits + citation gaps. Real traction (419K+ AI visits analyzed; Veeam, Magna, Neuron7). **This is the GEO layer — one below us.**

**The layer map (use in the pitch):**
`SEO (rank for humans) → GEO/AEO = Kachi (get read + cited) → AAO/2AO = Morphiq (devtools) + Aether (general-task) (get used).`
Kachi wins you a **citation**. Morphiq & Aether win you the **tool-call**.

**Our lane (unclaimed):** the invocation layer for **general-task / GTM agents** — not just coding agents (Morphiq), not just citation (Kachi).

**Our two defensible edges vs both:** the **DIY-arm (s_DIY)** measurement (the agent's biggest competitor is *itself*) + **causal rigor** (held-out test phrasings, a competitor held flat as control, two models). Neither competitor has claimed these.

**If a judge asks "who else is doing this?":** *"Morphiq owns devtool-invocation, Kachi owns get-cited. We own agent* usage *for the rest of the economy — with causal proof and the DIY-arm."* This is validation that the category is real, not a threat to our wedge.

*(Full competitor analysis PDF is kept internal — not committed here, since this repo is public. It's in the team's inboxes.)*
