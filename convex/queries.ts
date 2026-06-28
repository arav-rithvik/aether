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

export const getCorpus = query({
  args: { version: v.optional(v.union(v.literal("weak"), v.literal("optimized"))) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("corpus").collect();
    if (args.version === undefined) return all;
    return all.filter((row) => row.version === args.version);
  },
});
