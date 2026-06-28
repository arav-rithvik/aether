"use client";
// ============================================================
// AETHER — reactive data layer.
// Today: reads the simulated wind tunnel (mockData).
// When Arav's Convex lands, each selector below becomes a
// `useQuery(api.*)` call returning the SAME shape. Components
// never change.
// ============================================================
import { createContext, useContext } from "react";
import { CORPUS, DESCRIPTIONS, TOTAL_VERSIONS, competitorRate, generate } from "./mockData";
import { FailureTag, ModelId, Run, Score } from "./schema";

// generated once per load (deterministic) — stands in for the Convex tables
const DATA: { runs: Run[]; scores: Score[] } = generate();

export const TOTAL_RUNS = DATA.runs.length;
export const SWARM_SIZE = 100; // the "100-agent swarm" (§9)

export function scoreOf(model: ModelId, version: number): Score {
  return (
    DATA.scores.find((s) => s.model === model && s.descriptionVersion === version) ?? {
      id: "x",
      descriptionVersion: version,
      model,
      job: "",
      usageRate: 0,
      n: 0,
    }
  );
}

export function compRate(model: ModelId, version: number) {
  return competitorRate(DATA.runs, model, version);
}

export function runsFor(model: ModelId, version: number) {
  return DATA.runs.filter((r) => r.model === model && r.descriptionVersion === version);
}

export function failureBreakdown(model: ModelId, version: number): Record<FailureTag, number> {
  const out: Record<FailureTag, number> = {
    not_found: 0,
    desc_vague: 0,
    i_can_do_this_myself: 0,
    picked_competitor: 0,
    auth_friction: 0,
  };
  for (const r of runsFor(model, version)) if (r.failureTag) out[r.failureTag]++;
  return out;
}

export function funnelFor(model: ModelId, version: number) {
  const cell = runsFor(model, version);
  const n = cell.length || 1;
  // candidacy = OS appeared (anything not tagged not_found)
  const candidacy = cell.filter((r) => r.failureTag !== "not_found").length;
  // selection = agent chose OS
  const selection = cell.filter((r) => r.chosenTool === "orangeslice").length;
  // execution = call ran and returned usable data
  const execution = cell.filter((r) => r.returnedUsableData).length;
  return {
    candidacy: candidacy / n,
    selection: selection / n,
    execution: execution / n,
    n: cell.length,
  };
}

// ---------- the studio (shared UI state) ----------
type ModelSel = ModelId;

interface Studio {
  version: number;
  setVersion: (v: number) => void;
  model: ModelSel;
  setModel: (m: ModelSel) => void;
  playing: boolean;
  play: () => void;
  reset: () => void;
  feed: Run[]; // live-streaming runs for the selected cell
}

export const Ctx = createContext<Studio | null>(null);

export function useAether(): Studio {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAether must be used inside <AetherProvider>");
  return v;
}

export { CORPUS, DESCRIPTIONS, TOTAL_VERSIONS };
