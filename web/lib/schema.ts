// ============================================================
// AETHER — the §8 Convex schema, as TypeScript.
// This is the FROZEN CONTRACT (Master Doc §8). Arav writes the
// real Convex tables to match; the dashboard reads exactly these
// shapes. When Convex lands, lib/useAether.ts swaps mock → useQuery
// with no component changes.
// ============================================================

export type ModelId = "gpt-4o" | "gpt-4o-mini";
export type Split = "train" | "test";
export type FunnelStage = "candidacy" | "selection" | "execution";
export type CorpusVersion = "weak" | "optimized";

// Why each run did NOT end in OrangeSlice being used. null = OS was used.
export type FailureTag =
  | "not_found" // agent never surfaced OS (candidacy gate)
  | "desc_vague" // found OS but couldn't tell it does the job
  | "i_can_do_this_myself" // agent judged it could DIY
  | "picked_competitor" // chose a rival tool
  | "auth_friction"; // chose OS but the call failed / setup blocked it

export const FAILURE_TAGS: FailureTag[] = [
  "not_found",
  "desc_vague",
  "i_can_do_this_myself",
  "picked_competitor",
  "auth_friction",
];

export const FAILURE_LABEL: Record<FailureTag, string> = {
  not_found: "Not found",
  desc_vague: "Description vague",
  i_can_do_this_myself: "Did it itself",
  picked_competitor: "Picked competitor",
  auth_friction: "Auth friction",
};

// the three candidate tools the agent has on the table each run
// "orangeslice" | "self" | a competitor id
export type ToolId = string;

// the named rivals an agent might reach for instead of you
export const COMPETITORS: { id: string; name: string }[] = [
  { id: "clay", name: "Clay" },
  { id: "apollo", name: "Apollo" },
  { id: "zoominfo", name: "ZoomInfo" },
  { id: "leadgenius", name: "LeadGenius" },
];
const COMP_MAP: Record<string, string> = Object.fromEntries(COMPETITORS.map((c) => [c.id, c.name]));

export function isCompetitor(id: string) {
  return id in COMP_MAP;
}
export function toolLabel(id: string) {
  if (id === "orangeslice") return "OrangeSlice";
  if (id === "self") return "Did it itself";
  return COMP_MAP[id] ?? id;
}

// ---- §8 tables ----

export interface CorpusDoc {
  title: string;
  url: string;
  body: string;
}
export interface Corpus {
  id: string;
  version: CorpusVersion;
  docs: CorpusDoc[];
}

export interface Description {
  id: string;
  version: number; // 1, 2, 3...
  name: string;
  description: string;
  schema: string;
  changeReason: string;
}

export interface Run {
  id: string;
  ts: number;
  job: string;
  phrasing: string;
  split: Split;
  model: ModelId;
  descriptionVersion: number;
  toolsOnTable: string[];
  chosenTool: ToolId;
  calledTool: boolean;
  returnedUsableData: boolean;
  funnelStage: FunnelStage;
  failureTag: FailureTag | null;
  reasoningExcerpt: string;
}

export interface Score {
  id: string;
  descriptionVersion: number;
  model: ModelId;
  job: string;
  usageRate: number; // 0..1 — fraction of runs where the agent picked + called OS
  n: number;
}

export const MODELS: { id: ModelId; label: string; vendor: string; soon?: boolean }[] = [
  { id: "gpt-4o", label: "GPT-4o", vendor: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o-mini", vendor: "OpenAI" },
];

export const JOB = "find high-intent buyers and start outreach";
