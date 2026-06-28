"use client";
// ============================================================
// AETHER — reactive data layer.
// Today: reads the simulated wind tunnel (mockData).
// When Arav's Convex lands, each selector below becomes a
// `useQuery(api.*)` call returning the SAME shape. Components
// never change.
// ============================================================
import { createContext, useContext } from "react";
import { CORPUS, DESCRIPTIONS, PHRASINGS, TOTAL_VERSIONS, competitorRate, generate } from "./mockData";
import { FailureTag, isCompetitor, MODELS, ModelId, Run, Score } from "./schema";
import { getLive } from "./live";

// deterministic mock; used until live Convex data is set (then auto-swaps)
const MOCK: { runs: Run[]; scores: Score[] } = generate();
function ds(): { runs: Run[]; scores: Score[] } {
  return getLive() ?? MOCK;
}

export const TOTAL_RUNS = MOCK.runs.length;
export const SWARM_SIZE = 100; // the "100-agent swarm" (§9)

export function scoreOf(model: ModelId, version: number): Score {
  return (
    ds().scores.find((s) => s.model === model && s.descriptionVersion === version) ?? {
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
  return competitorRate(ds().runs, model, version);
}

export function runsFor(model: ModelId, version: number) {
  return ds().runs.filter((r) => r.model === model && r.descriptionVersion === version);
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

// the math behind one cell — every number the gauge shows, as raw counts
export function mathFor(model: ModelId, version: number) {
  const cell = runsFor(model, version);
  const n = cell.length;
  const used = cell.filter((r) => r.chosenTool === "orangeslice" && r.returnedUsableData).length;
  const candidacy = cell.filter((r) => r.failureTag !== "not_found").length;
  const selection = cell.filter((r) => r.chosenTool === "orangeslice").length; // recommended you
  const called = cell.filter((r) => r.calledTool).length; // tried to call your tool
  const execution = used; // call ran + returned usable data
  const competitor = cell.filter((r) => isCompetitor(r.chosenTool)).length;
  const diy = cell.filter((r) => r.chosenTool === "self").length;
  return { n, used, candidacy, selection, called, execution, competitor, diy, rate: n ? used / n : 0 };
}

// aggregate stats on the wind engine itself
export function engineStats() {
  const trainN = PHRASINGS.filter((p) => p.split === "train").length;
  const testN = PHRASINGS.filter((p) => p.split === "test").length;
  const totalRuns = ds().runs.length;
  const perCell = runsFor("gpt-4o", 1).filter((r) => r.phrasing === PHRASINGS[0].text).length;
  const taggerCalls = totalRuns; // one labeler call per run
  const optimizerCalls = TOTAL_VERSIONS - 1; // rewrites between versions
  return {
    phrasings: PHRASINGS.length,
    trainN,
    testN,
    perCell,
    models: MODELS.length,
    iterations: TOTAL_VERSIONS,
    totalRuns,
    taggerCalls,
    optimizerCalls,
    agentCalls: totalRuns + taggerCalls + optimizerCalls,
  };
}

// which version fixed each rejection reason, and how
export const TAG_FIX: Record<FailureTag, { version: number; fix: string }> = {
  not_found: {
    version: 2,
    fix: "Published an agent-discoverable API doc and named the exact job agents search for ('high-intent buyers').",
  },
  desc_vague: {
    version: 2,
    fix: "Added a callable endpoint + JSON schema so the agent can tell what it does and how to call it.",
  },
  i_can_do_this_myself: {
    version: 3,
    fix: "Reframed around the full outcome ('find + start outreach'), so doing it by hand looks slower.",
  },
  auth_friction: {
    version: 3,
    fix: "Surfaced the zero-setup API key and a copy-paste example so the call doesn't 401.",
  },
  picked_competitor: {
    version: 3,
    fix: "Sharpened positioning vs lead-scrapers: intent scoring + drafted outreach, not just a list.",
  },
};

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
