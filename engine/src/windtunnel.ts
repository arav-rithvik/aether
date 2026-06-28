import { TRAIN_PHRASINGS, TEST_PHRASINGS, RUNS_PER_PHRASING } from "./config.js";
import { runAgent } from "./agent.js";

// Weak baseline OS description (Universe A) — vague, loses to DIY.
const WEAK_DESC = "Get leads.";

async function main() {
  const phrasings = [...TRAIN_PHRASINGS, ...TEST_PHRASINGS];
  let osChosen = 0, total = 0;
  for (const phrasing of phrasings) {
    for (let i = 0; i < RUNS_PER_PHRASING; i++) {
      const r = await runAgent({ task: phrasing, osDescription: WEAK_DESC, corpusVersion: "weak" });
      total++;
      if (r.chosenTool.startsWith("orangeslice")) osChosen++;
      console.log(`[${phrasing}] -> ${r.chosenTool}`);
      // TODO(Arav): write a `runs` row to Convex (convex/schema.ts) + failure tag.
    }
  }
  console.log(`\nBaseline OrangeSlice usage rate: ${((osChosen / total) * 100).toFixed(1)}% (n=${total})`);
  // TODO(Arav): upsert a `scores` row so the dashboard gauge updates live.
}

main();
