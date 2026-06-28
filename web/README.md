# Aether Dashboard (Rithvik)

Stack: Next.js + React + Tailwind + Framer Motion + Convex client.

## Setup
```
npx create-next-app@latest . --ts --tailwind --app --eslint --no-src-dir
npm i convex framer-motion
npx convex dev   # link the SAME Convex deployment the engine writes to
```

## Build (SECOND_BRAIN.md §9, §12)
- **Live USAGE GAUGE** — `useQuery` on `scores`; animate 0% -> ~70%.
- **DIAGNOSIS panel** — group `runs.failureTag`.
- **CHANGE-LOG diff** — `descriptions` v1 -> v2 -> v3 with `changeReason`.
- **100-AGENT SWARM** — Framer Motion viz over live `runs`.
- **TWO-TERMINAL panel** — replay `demo/` output side by side.

The Convex schema (`convex/schema.ts`) is the frozen contract. Read-only; the engine writes.
