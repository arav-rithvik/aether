import { query } from "./_generated/server";
import { v } from "convex/values";

export const getScores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scores").collect();
  },
});

export const getDescriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("descriptions")
      .order("asc")
      .collect();
  },
});

export const getRuns = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    return await ctx.db
      .query("runs")
      .order("desc")
      .take(limit);
  },
});

export const getLosingRuns = query({
  args: { descriptionVersion: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("runs")
      .withIndex("by_desc_model", (q) => q.eq("descriptionVersion", args.descriptionVersion))
      .collect();
    // Filter train-split losses client-side (chosenTool and split not in index)
    return rows.filter(
      (r) => r.split === "train" && r.chosenTool !== "orangeslice" && r.chosenTool !== "ERROR"
    );
  },
});

export const getCorpus = query({
  args: { version: v.optional(v.union(v.literal("weak"), v.literal("optimized"))) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("corpus").collect();
    if (args.version === undefined) return all;
    return all.filter((row) => row.version === args.version);
  },
});
