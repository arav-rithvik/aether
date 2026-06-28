import { query } from "./_generated/server";

// Read APIs the dashboard subscribes to. Same shapes as lib/schema.ts.
export const getScores = query({
  args: {},
  handler: async (ctx) => ctx.db.query("scores").collect(),
});

export const getRuns = query({
  args: {},
  handler: async (ctx) => ctx.db.query("runs").collect(),
});

export const getDescriptions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("descriptions").collect(),
});

export const getCorpus = query({
  args: {},
  handler: async (ctx) => ctx.db.query("corpus").collect(),
});
