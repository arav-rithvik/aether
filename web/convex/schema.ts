import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// AETHER — the §8 schema as Convex tables. Matches lib/schema.ts exactly.
export default defineSchema({
  corpus: defineTable({
    version: v.string(), // "weak" | "optimized"
    docs: v.array(v.object({ title: v.string(), url: v.string(), body: v.string() })),
  }),
  descriptions: defineTable({
    version: v.number(),
    name: v.string(),
    description: v.string(),
    schema: v.string(),
    changeReason: v.string(),
  }),
  runs: defineTable({
    ts: v.number(),
    job: v.string(),
    phrasing: v.string(),
    split: v.string(), // "train" | "test"
    model: v.string(), // "gpt" | "claude"
    descriptionVersion: v.number(),
    toolsOnTable: v.array(v.string()),
    chosenTool: v.string(),
    calledTool: v.boolean(),
    returnedUsableData: v.boolean(),
    funnelStage: v.string(),
    failureTag: v.union(v.string(), v.null()),
    reasoningExcerpt: v.string(),
  }),
  scores: defineTable({
    descriptionVersion: v.number(),
    model: v.string(),
    job: v.string(),
    usageRate: v.number(),
    n: v.number(),
  }),
});
