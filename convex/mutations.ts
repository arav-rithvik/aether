import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertRun = mutation({
  args: {
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
    funnelStage: v.union(
      v.literal("candidacy"),
      v.literal("selection"),
      v.literal("execution")
    ),
    failureTag: v.union(v.string(), v.null()),
    reasoningExcerpt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", args);
  },
});

export const upsertScore = mutation({
  args: {
    descriptionVersion: v.number(),
    model: v.string(),
    job: v.string(),
    usageRate: v.number(),
    n: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scores")
      .withIndex("by_desc_model", (q) =>
        q
          .eq("descriptionVersion", args.descriptionVersion)
          .eq("model", args.model)
      )
      .filter((q) => q.eq(q.field("job"), args.job))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        usageRate: args.usageRate,
        n: args.n,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("scores", args);
    }
  },
});

export const insertDescription = mutation({
  args: {
    version: v.number(),
    name: v.string(),
    description: v.string(),
    schema: v.string(),
    changeReason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("descriptions", args);
  },
});

export const setRunFailureTag = mutation({
  args: {
    id:         v.id("runs"),
    failureTag: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { failureTag: args.failureTag });
  },
});

export const setCorpus = mutation({
  args: {
    version: v.union(v.literal("weak"), v.literal("optimized")),
    docs: v.array(
      v.object({ title: v.string(), url: v.string(), body: v.string() })
    ),
  },
  handler: async (ctx, args) => {
    // Delete all existing rows for this version
    const existing = await ctx.db
      .query("corpus")
      .filter((q) => q.eq(q.field("version"), args.version))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    return await ctx.db.insert("corpus", { version: args.version, docs: args.docs });
  },
});
