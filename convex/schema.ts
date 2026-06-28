import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// THE FROZEN CONTRACT (SECOND_BRAIN.md §8). Engine writes; dashboard reads.
export default defineSchema({
  corpus: defineTable({
    version: v.union(v.literal("weak"), v.literal("optimized")),
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
    split: v.union(v.literal("train"), v.literal("test")),
    model: v.string(),
    descriptionVersion: v.number(),
    toolsOnTable: v.array(v.string()),
    chosenTool: v.string(),
    calledTool: v.boolean(),
    returnedUsableData: v.boolean(),
    funnelStage: v.union(v.literal("candidacy"), v.literal("selection"), v.literal("execution")),
    failureTag: v.union(v.string(), v.null()),
    reasoningExcerpt: v.string(),
  }).index("by_desc_model", ["descriptionVersion", "model"]),
  scores: defineTable({
    descriptionVersion: v.number(),
    model: v.string(),
    job: v.string(),
    usageRate: v.number(),
    n: v.number(),
  }).index("by_desc_model", ["descriptionVersion", "model"]),
});
