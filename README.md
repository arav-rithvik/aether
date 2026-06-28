# Aether — Agent Awareness Optimization (2AO)

Make AI agents **discover + use** a company's product when doing a task.
Full context, PRD, and the 6-hour build plan live in **SECOND_BRAIN.md** (read it first).

## Structure
- `engine/` — wind tunnel + optimizer (Arav)
- `convex/` — reactive DB + schema (the frozen shared contract)
- `web/`    — dashboard (Rithvik)
- `demo/`   — two-universe terminal CLI (the recorded demo)

## Quick start
1. `cp engine/.env.example engine/.env` and fill keys
2. `npx convex dev` (repo root) — links the shared Convex deployment
3. `cd engine && npm i && npm run tunnel` — baseline usage rate
4. Dashboard: see `web/README.md`
