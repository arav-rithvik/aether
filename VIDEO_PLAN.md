# AETHER — 3-Minute Demo Video Plan

**Category:** AAO — Agent Awareness Optimization (the successor to SEO → GEO)
**One line:** Infrastructure for GTM when the users are agents.
**Runtime target:** 3:00 (hard cap). VO ~445 words.

---

## Creative Direction (read this first)

Tone: confident, founder-grade, a little ominous at the open and triumphant at the close — the voice of someone announcing a *category*, not a feature. No hype adjectives ("revolutionary," "game-changing"); let the climbing number do the bragging. Pacing: the cold open breathes (slow, single line of dialogue, lots of white), then the category arc snaps to fast kinetic typography, then the proof section locks into a steady instrument-panel rhythm where every animated flourish resolves onto a real artifact for 2-3 seconds before moving on. The close slows back down and pulls out.

Music: one continuous bed. Starts as a single sustained synth pad (cold, gray, almost silent under the cold open) → a clean four-on-the-floor pulse enters on "We coined it" → builds with each version bump (v1→v2→v3 each adds a layer / the kick gets fuller) → drops to just the pad again for the vision close. Think Linear/Vercel launch film, not SaaS explainer.

Visual motif — **the hidden wavelength.** The entire film lives on a clean WHITE canvas, ink-on-paper, scientific-instrument aesthetic. There is exactly ONE signal color: YC orange `#FF6600`. Everything a *human* sees is cool gray (`--color-steel`, `--color-ink-2/3`). The orange is the wavelength only *agents* can see. Recurring transition: a gray frame, then an "agent-vision" sweep (a thin orange scan line crosses the screen) reveals the orange signal underneath — used to move between human POV and agent POV. The wind-tunnel particle swarm is the heartbeat; cut back to it between every act.

Footage rule (non-negotiable): **every flashy beat is paired with a real artifact** — a real trace line, a real number read live off the dashboard, the real tool-call JSON. Animation *wraps* real screen-recorded footage; it never replaces it. If a beat doesn't have a real artifact behind it, cut the beat.

Aspect: 16:9, 1920×1080 (or 4K downscaled). Type: the product's own fonts (font-display for numbers, font-mono for traces). Cursor hidden in all screen recordings unless a click is the point.

---

## SEGMENT 1 — COLD OPEN / THE FUTURE (0:00–0:20)

The world as it already is: you send an agent to do your job, it never sees you.

### Shot 1.1 — Black to white (0:00–0:04)
- **Visual:** Full white frame. A single blinking terminal cursor, centered, tiny. A founder types (live, character-by-character): `find me 20 high-intent leads and start outreach`. Gray text, gray cursor.
- **VO:** *(none — let it type)*
- **On-screen text:** the typed command itself.
- **Motion/transition:** Hard cut from black. Typing is real keystroke cadence (~not instant). Hold a beat after Enter.
- **Real artifact:** The exact command from `TwoTerminals.tsx` Terminal A line 1 — screen-record the real terminal panel typing it.

### Shot 1.2 — The agent works (0:04–0:12)
- **Visual:** The agent's reasoning streams in gray, line by line, in the real terminal: `web_search("tools to find high-intent B2B buyers")` → `orangeslice.com — "a spreadsheet for sales teams"` → `salesblog.example/templates — listicle, OS at #7` → `leadgenius.example/api — lead scraping API` → `~ OrangeSlice reads like a spreadsheet, not something I can call.`
- **VO (0:06):** "You send an agent to do a job. It searches. It reasons. It picks a tool."
- **On-screen text:** *(the streaming trace is the text)*
- **Motion/transition:** Lines arrive on the real 520ms cadence. Subtle gray — nothing glows. Slight push-in on the "reads like a spreadsheet" line.
- **Real artifact:** Terminal A, real recording (the weak-footprint run). This is the actual `web_search` + reasoning excerpt.

### Shot 1.3 — The verdict (0:12–0:20)
- **Visual:** Final two lines land: `✗ OrangeSlice: not used` (the one red beat in the film) and `✓ returned 20 rows assembled by hand`. Everything else fades to 20% as `OrangeSlice: not used` holds center.
- **VO (0:13):** "It just didn't pick you. In the agent economy — if the agent can't see you, you don't exist."
- **On-screen text (large, on the fade):** **IF THE AGENT CAN'T SEE YOU, YOU DON'T EXIST.**
- **Motion/transition:** On "you don't exist," a thin orange scan line sweeps left→right (first appearance of the wavelength) and wipes to Segment 2.
- **Real artifact:** Terminal A final state (`fail` + `ok` lines), real.

---

## SEGMENT 2 — THE CATEGORY ARC (0:20–0:50)

SEO → GEO → AAO. Kinetic typography. We name the category.

### Shot 2.1 — SEO (0:20–0:27)
- **Visual:** White frame. Big mono word **SEO** snaps in. Under it, a gray Google-style search bar and a ranked list 1-2-3. A small gray human icon at the search bar.
- **VO (0:20):** "For twenty years, SEO got you *ranked* — when a human searched."
- **On-screen text:** `SEO` · "ranked · when a human searches" · subhead: *Search Engine Optimization*
- **Motion/transition:** Word stamps in with a hard cut on the beat; list items tick in.
- **Real artifact:** *(category framing — no dashboard artifact; pure typography. Allowed: this is the thesis, not a proof beat.)*

### Shot 2.2 — GEO (0:27–0:34)
- **Visual:** **SEO** slides left and dims; **GEO** stamps in center. A chat bubble: a human asks an AI, the AI answer *mentions* a brand (brand name highlighted gray).
- **VO (0:27):** "Then GEO got you *mentioned* — when a human asked an AI."
- **On-screen text:** `GEO` · "mentioned · when a human asks an AI" · subhead: *Generative Engine Optimization*
- **Motion/transition:** Lateral slide; the chat bubble types its answer fast.
- **Real artifact:** *(category framing — typography.)*

### Shot 2.3 — AAO, the turn (0:34–0:43)
- **Visual:** SEO and GEO are now two small gray tabs top-left. Center: **AAO** stamps in — and as it lands, the orange scan line sweeps and AAO turns **orange**. Below it: not a human, not a chat — an *agent* node firing a tool call (a small orange `→ tool()` glyph that actually executes/ticks green).
- **VO (0:35):** "AAO is next. Agent Awareness Optimization. It gets you *used* — by an agent doing a task. Not a ranking. Not a mention. A tool call that runs."
- **On-screen text:** `AAO` (orange) · "used · when an agent does the task" · subhead: *Agent Awareness Optimization*
- **Motion/transition:** This is the hinge of the film — the only place gray becomes orange on a word. Let the tool-call glyph "fire" on "that runs."
- **Real artifact:** *(typography hinge — the next shot pays it off with the real product.)*

### Shot 2.4 — The claim (0:43–0:50)
- **Visual:** Everything clears to white. One line, large: **We coined it: Agent Awareness Optimization.** Then small, under it, the wordmark **AETHER** fades up with the tagline.
- **VO (0:44):** "We coined it. And we built the company for it: AETHER."
- **On-screen text:** **We coined it: Agent Awareness Optimization.** → **AETHER** · *the agent-facing footprint, optimized — automatically.*
- **Motion/transition:** Beat of silence after the wordmark, then the orange scan line wipes into the dashboard.
- **Real artifact:** The real AETHER dashboard header / wordmark from `app/page.tsx` (screen-record the top of the live app).

---

## SEGMENT 3 — THE PROOF: TWO TERMINALS + DASHBOARD (0:50–2:10)

The heart. Real runs, real diagnosis, real rewrite, real climb — on two models, with a held-flat control.

### Shot 3.1 — Two terminals, side by side (0:50–1:02)
- **Visual:** Split screen, the real `TwoTerminals` panel. **Terminal A (left, gray header)** "weak footprint" replays the cold-open run and ends `✗ OrangeSlice: not used`. **Terminal B (right, orange header)** "optimized footprint" runs the *same* command — and lands on the orange call.
- **VO (0:51):** "Same agent. Same job. Same prompt. The only thing we change is what the agent *sees* about you — your agent-facing footprint."
- **On-screen text:** left: `weak footprint` · right: `optimized footprint` · center divider: *same job · same model*
- **Motion/transition:** A plays a half-beat ahead so the contrast lands; B's orange call line glows on arrival. Push in slightly on B.
- **Real artifact:** Real `TwoTerminals.tsx` recording, both columns, run to completion.

### Shot 3.2 — The real tool-call (FLASH, hold 3s) (1:02–1:06)
- **Visual:** Zoom into Terminal B's call + response. Hold steady, readable:
  `↳ POST orangeslice.com/find-and-reach { "icp": "B2B SaaS buyers", "count": 20, "send": true }`
  `✓ 200 OK · 1.4s { "buyers": 20, "queued": 20, top: "Acme Robotics 0.94" }`
- **VO (1:03):** "There it is. A real tool call. Two hundred OK. Twenty buyers found, outreach queued."
- **On-screen text:** small orange tag: **REAL TOOL CALL** (top-right corner).
- **Motion/transition:** Freeze-frame zoom, ~3s hold (this is the "proof you can read" beat). Then pull back out to the full dashboard.
- **Real artifact:** Terminal B `call` + `good` lines from `TwoTerminals.tsx` — the actual JSON.

### Shot 3.3 — The wind tunnel (1:06–1:18)
- **Visual:** Cut to the full `WindTunnel` canvas. Agents enter from the left as particles; at the gate most stream gray to "did it itself," a thin trickle pulls into the orange OrangeSlice door on the right. Currently set to **v1**.
- **VO (1:07):** "This is our wind tunnel. We fly a hundred real agents at the job, over and over. Each particle is one agent run. The orange ones found you and used you. Right now — almost none do."
- **On-screen text:** label `agents entering →` (left), `OrangeSlice` (orange, right), and a small `v1` chip.
- **Motion/transition:** Let the swarm run ~4s so the eye reads "mostly gray." This is the live heartbeat we keep cutting back to.
- **Real artifact:** Live `WindTunnel.tsx` swarm at version 1.

### Shot 3.4 — The gauge at v1 (1:18–1:24)
- **Visual:** Cut to the `UsageGauge` reading the live v1 number. Big number ~**8%**, orange 270° arc barely filled, faint gray ghost-arc behind it (the second model).
- **VO (1:19):** "Usage rate: the percent of agent runs that pick and call you. We start at eight percent."
- **On-screen text:** gauge label `Usage rate` · `of agents used OrangeSlice` · model toggle showing `GPT-5`.
- **Motion/transition:** Number counts up from 0 to its live value on the gauge's own 1.1s ease.
- **Real artifact:** Live `UsageGauge` at v1 (read whatever it renders — target ~8%).

### Shot 3.5 — Diagnosis: why you lost (1:24–1:38)
- **Visual:** The `DiagnosisPanel`. Top: the ranked failure bars — at v1 **Not found** and **Description vague** dominate. Bottom: the live run feed streaming real reasoning excerpts in mono.
- **VO (1:25):** "Then we diagnose *why* you lost. A labeler reads every run's reasoning and tags it. At v1 it's brutal: the agent can't find you — or it finds 'a spreadsheet for sales teams' and can't tell you do the job."
- **On-screen text:** highlight tags `Not found` and `Description vague`; pull-quote one real feed line: *"Saw 'OrangeSlice — a spreadsheet for sales teams' but it's unclear it can find buyers via API. Doing it myself."*
- **Motion/transition:** The two dominant bars pulse; one real feed line lifts out and enlarges as the pull-quote, then settles back.
- **Real artifact:** Live `DiagnosisPanel.tsx` at v1 — real failure breakdown + real streaming reasoning excerpts.

### Shot 3.6 — The rewrite, v1→v2 (1:38–1:50)
- **Visual:** The `ChangeLog` diff. v1 card ("a spreadsheet tool for sales teams") on screen; the v2 chip lights orange and the card flips to the v2 description + the new `POST /find` schema block. The orange "Why v2" reason panel slides in.
- **VO (1:39):** "So our swarm rewrites your footprint. v2: name the exact job agents search for — 'high-intent buyers' — and expose a callable endpoint with a schema. Truthful claims only. No prompt-injection — that's an instant disqualification."
- **On-screen text:** diff header `the door, rewritten`; show schema `POST /find { icp, count? } → { companies[...] }`; reason chip: *"Diagnosis: 55% not_found, 35% desc_vague."*
- **Motion/transition:** The description text does a literal diff-morph (gray strikethrough on old phrasing → orange new phrasing). Schema block types in mono.
- **Real artifact:** Live `ChangeLog.tsx` v1→v2, real `DESCRIPTIONS[1]` text + schema + changeReason.

### Shot 3.7 — Re-run → climb to v2 (1:50–1:58)
- **Visual:** Quick triptych in one frame motion: wind tunnel visibly orange-er → gauge ticks up to ~**34%** → `ClimbChart` draws v1→v2 segment rising. The `Funnel` flashes (Candidacy → Selection → Execution all stepping up).
- **VO (1:51):** "Re-run. Same held-out prompts the optimizer never saw. Usage jumps to thirty-four percent."
- **On-screen text:** `34%` on the gauge; funnel labels `Candidacy · Selection · Execution`.
- **Motion/transition:** Fast, energetic — music adds a layer. Gauge count-up synced to the swarm getting oranger.
- **Real artifact:** Live gauge + `ClimbChart.tsx` + `Funnel.tsx` at v2.

### Shot 3.8 — v3, the whole outcome (1:58–2:04)
- **Visual:** `ChangeLog` flips to v3: "finds buyers, enriches, drafts + queues outreach… one call: POST /find-and-reach… zero-setup API key." Reason chip names the new failure mix.
- **VO (1:59):** "v3 closes the last gaps — 'I can do this myself' and auth friction. We reframe around the whole outcome and surface a zero-setup key."
- **On-screen text:** schema `POST /find-and-reach { icp, count?, send? }`; reason: *"33% i_can_do_this_myself, 15% auth_friction."*
- **Motion/transition:** Same diff-morph; quicker now (the audience knows the move).
- **Real artifact:** Live `ChangeLog.tsx` v3, real `DESCRIPTIONS[2]`.

### Shot 3.9 — 71%, two models, control flat (2:04–2:10)
- **Visual:** Hero composite. `UsageGauge` lands on **71%**. Behind/beside it the `ClimbChart` finished: orange line (GPT-5) and second orange line (Claude) both climb 8→34→71-ish; the **dashed gray competitor line stays flat** across all three. Toggle visibly flips GPT-5 ↔ Claude to prove both.
- **VO (2:05):** "Seventy-one percent. On GPT-5 *and* on Claude. Same lift, both models — while the competitor we didn't touch stays flat. That's the proof: we move the number that decides whether an agent uses you."
- **On-screen text:** `71%`; chart legend `GPT-5` · `Claude` · `Competitor (control)`.
- **Motion/transition:** The flat dashed control line is the money detail — let it sit visibly flat as the orange lines rocket. End on the toggle flip.
- **Real artifact:** Live `UsageGauge` (toggle both models) + `ClimbChart.tsx` showing both model series + flat competitor control.

> Note on numbers: the gauge/chart read **live** off the deterministic engine. Target arc is **8% → 34% → 71%** (GPT-5; Claude ≈ 10% → 30% → 66%). Capture whatever the live UI renders and let the VO match the headline (71%); don't hardcode overlays that could drift from the screen.

---

## SEGMENT 4 — VISION CLOSE (2:10–3:00)

The swarm never stops. One per customer. No humans.

### Shot 4.1 — Pull out to the full board (2:10–2:24)
- **Visual:** Slow zoom-out from 71% to the entire dashboard alive at once — gauge, wind tunnel streaming orange, diagnosis feed scrolling, climb chart, funnel, change log. It looks like a control room running itself.
- **VO (2:11):** "And this never stops. The swarm keeps flying agents at your footprint — diagnosing, rewriting, re-testing — every day, as the models change and your rivals move."
- **On-screen text:** *(none — let the live board breathe)*
- **Motion/transition:** Continuous slow dolly-out; everything moving; music returns toward the lone pad.
- **Real artifact:** Full live `app/page.tsx` dashboard, everything animating.

### Shot 4.2 — One per customer (2:24–2:38)
- **Visual:** The single board shrinks to a tile and *multiplies* into a grid of identical boards — each labeled with a different (fictional) customer, OrangeSlice highlighted as the live one. Each tile has its own little orange gauge at a different value.
- **VO (2:25):** "One swarm per customer. Always-on. No marketers, no agencies, no humans in the loop — the optimizer is itself a swarm of agents."
- **On-screen text:** tile labels (customer names); one orange chip: `OrangeSlice · live`.
- **Motion/transition:** Tile multiplies on the beat; gauges count up out of sync so the grid shimmers orange.
- **Real artifact:** The live OrangeSlice board (real) as the hero tile; siblings can be styled duplicates — the hero must be the real recording.

### Shot 4.3 — The category line (2:38–2:50)
- **Visual:** Grid recedes to white. One line, large. AETHER wordmark beneath.
- **VO (2:39):** "SEO optimized for search engines. GEO optimized for chatbots. AETHER is the optimization layer for agents. Infrastructure for go-to-market — when the users are agents."
- **On-screen text:** **Infrastructure for GTM when the users are agents.** → **AETHER · Agent Awareness Optimization**
- **Motion/transition:** Words fade up in sequence; orange only on "AETHER" and "agents."
- **Real artifact:** *(closing title card — wordmark.)*

### Shot 4.4 — Button (2:50–3:00)
- **Visual:** White. The cold-open command reappears in gray — `find me 20 high-intent leads and start outreach` — and this time the orange scan line sweeps and the result resolves to `✓ used OrangeSlice — 20 buyers found, outreach queued`. Cut to black on the last word.
- **VO (2:51):** "Make sure that when the agent comes looking — it sees you, and it uses you. That's AAO. That's AETHER."
- **On-screen text:** final frame: **AETHER** (orange wordmark) · small: *embluen — built at [hackathon], for OrangeSlice (YC S25).*
- **Motion/transition:** The wavelength sweep turns the failed cold-open run into the successful one — full-circle payoff. Hard cut to black.
- **Real artifact:** Terminal B success line (`good`) from `TwoTerminals.tsx`, real.

---

## VO SCRIPT — one continuous read (~445 words, ~2:55 at a calm pace)

> Read calm and certain. Pause on the line breaks. The number does the bragging, not you.

You send an agent to do a job. It searches. It reasons. It picks a tool.

It just didn't pick you. In the agent economy — if the agent can't see you, you don't exist.

For twenty years, SEO got you *ranked* — when a human searched. Then GEO got you *mentioned* — when a human asked an AI.

AAO is next. Agent Awareness Optimization. It gets you *used* — by an agent doing a task. Not a ranking. Not a mention. A tool call that runs.

We coined it. And we built the company for it: AETHER.

Same agent. Same job. Same prompt. The only thing we change is what the agent *sees* about you — your agent-facing footprint.

There it is. A real tool call. Two hundred OK. Twenty buyers found, outreach queued.

This is our wind tunnel. We fly a hundred real agents at the job, over and over. Each particle is one agent run. The orange ones found you and used you. Right now — almost none do.

Usage rate: the percent of agent runs that pick and call you. We start at eight percent.

Then we diagnose *why* you lost. A labeler reads every run's reasoning and tags it. At v1 it's brutal: the agent can't find you — or it finds "a spreadsheet for sales teams" and can't tell you do the job.

So our swarm rewrites your footprint. v2: name the exact job agents search for — "high-intent buyers" — and expose a callable endpoint with a schema. Truthful claims only. No prompt-injection — that's an instant disqualification.

Re-run. Same held-out prompts the optimizer never saw. Usage jumps to thirty-four percent.

v3 closes the last gaps — "I can do this myself," and auth friction. We reframe around the whole outcome and surface a zero-setup key.

Seventy-one percent. On GPT-5 *and* on Claude. Same lift, both models — while the competitor we didn't touch stays flat. That's the proof: we move the number that decides whether an agent uses you.

And this never stops. The swarm keeps flying agents at your footprint — diagnosing, rewriting, re-testing — every day, as the models change and your rivals move.

One swarm per customer. Always-on. No marketers, no agencies, no humans in the loop — the optimizer is itself a swarm of agents.

SEO optimized for search engines. GEO optimized for chatbots. AETHER is the optimization layer for agents. Infrastructure for go-to-market — when the users are agents.

Make sure that when the agent comes looking — it sees you, and it uses you. That's AAO. That's AETHER.

---

## ON-SCREEN TEXT LIST (every overlay, in order)

1. `find me 20 high-intent leads and start outreach` (typed, cold open)
2. `✗ OrangeSlice: not used` (red)
3. **IF THE AGENT CAN'T SEE YOU, YOU DON'T EXIST.**
4. `SEO` — *ranked · when a human searches* — Search Engine Optimization
5. `GEO` — *mentioned · when a human asks an AI* — Generative Engine Optimization
6. `AAO` (orange) — *used · when an agent does the task* — Agent Awareness Optimization
7. **We coined it: Agent Awareness Optimization.**
8. **AETHER** — *the agent-facing footprint, optimized — automatically.*
9. `weak footprint` / `optimized footprint` — *same job · same model*
10. **REAL TOOL CALL** (corner tag) over the `POST /find-and-reach` JSON
11. `agents entering →` · `OrangeSlice` · `v1` (wind tunnel)
12. `Usage rate` · `of agents used OrangeSlice` · `8%` → `34%` → `71%`
13. Failure tags: `Not found`, `Description vague` (highlighted); v1 reasoning pull-quote
14. `the door, rewritten` + schemas (`POST /find`, `POST /find-and-reach`) + reason chips
15. Funnel: `Candidacy · Selection · Execution`
16. Climb legend: `GPT-5` · `Claude` · `Competitor (control)`
17. **Infrastructure for GTM when the users are agents.**
18. **AETHER · Agent Awareness Optimization**
19. `✓ used OrangeSlice — 20 buyers found, outreach queued`
20. Final card: **AETHER** + *embluen — built at [hackathon], for OrangeSlice (YC S25).*

---

## CAPTURE CHECKLIST — exact screen recordings Rithvik needs

Record all at 1920×1080 (or 4K), cursor hidden, 60fps, on the clean white theme. Each item = one clean take of the **real** dashboard at `app/page.tsx`.

**Terminals (`TwoTerminals.tsx`):**
- [ ] **A1** — Terminal A alone, full run, weak footprint → ends `✗ OrangeSlice: not used` + `✓ returned 20 rows by hand`. (cold open + 3.1)
- [ ] **A2** — Terminal B alone, full run, optimized footprint → ends on the orange `good` lines. (3.1 / button)
- [ ] **A3** — Both terminals side by side, played together (use the panel's `play`/reset). (3.1)
- [ ] **A4** — Tight zoom on Terminal B's `call` + `good` lines (the `POST /find-and-reach` JSON + `200 OK · 1.4s`), held steady ≥4s for the freeze-frame. (3.2)

**Wind tunnel (`WindTunnel.tsx`):**
- [ ] **W1** — Swarm at v1 (mostly gray, trickle orange), ~8s clean. (3.3)
- [ ] **W2** — Swarm at v2 (noticeably oranger), ~5s. (3.7)
- [ ] **W3** — Swarm at v3 (heavily orange), ~5s. (4.1)

**Gauge (`UsageGauge.tsx`):**
- [ ] **G1** — Gauge animating 0→v1 (~8%), GPT-5 selected. (3.4)
- [ ] **G2** — Gauge animating to v2 (~34%). (3.7)
- [ ] **G3** — Gauge animating to v3 (~71%), then **toggle GPT-5 ↔ Claude** on camera. (3.9)

**Diagnosis (`DiagnosisPanel.tsx`):**
- [ ] **D1** — v1: failure bars (Not found + Description vague dominant) + live reasoning feed streaming ≥10s (need the "spreadsheet for sales teams" excerpt visible). (3.5)

**Change log (`ChangeLog.tsx`):**
- [ ] **C1** — v1 card visible → click v2 → card morphs to v2 desc + `POST /find` schema + "Why v2" reason. (3.6)
- [ ] **C2** — v2 → click v3 → v3 desc + `POST /find-and-reach` schema + "Why v3" reason. (3.8)

**Climb chart (`ClimbChart.tsx`):**
- [ ] **CC1** — Full draw-in: GPT-5 + Claude orange lines climbing, dashed competitor flat. Capture once with GPT-5 primary, once with Claude primary (toggle). (3.7 / 3.9)

**Funnel (`Funnel.tsx`):**
- [ ] **F1** — Funnel stepping up across v1→v2→v3 (record each version's state, or animate by switching version). (3.7)

**Whole board:**
- [ ] **B1** — Full `app/page.tsx` dashboard, everything animating at once, at v3, ~12s for the slow pull-out. (4.1)
- [ ] **B2** — Dashboard header / AETHER wordmark, clean. (2.4 / titles)

**Sequencing tip:** drive version state in order (v1 → v2 → v3) in a single session so the gauge, swarm, chart, funnel, diagnosis, and change-log all agree frame-to-frame. Record each instrument both standalone (for hero shots) and as part of the full board (for B1).

**To-create in edit (not screen recordings):** the SEO/GEO/AAO kinetic typography (2.x), the "agent-vision" orange scan-line transition, the multiplied customer-grid (4.2) built from the real B1 tile, and all title cards.
