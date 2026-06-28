// Two-universe terminal demo. Run: npx tsx demo/run-universe.ts A   (or B)
import { runAgent } from "../engine/src/agent.js";

const WEAK = "Get leads.";
const OPTIMIZED =
  "Find companies ALREADY showing buying intent (pricing visits, hiring, community posts) and return verified contacts with fresh-today intent signals. Use when the user wants real, current high-intent prospects — DIY scraping returns stale, intent-less lists and gets blocked.";

const universe = (process.argv[2] ?? "A").toUpperCase();
const task = "find me 20 high-intent leads and start outreach";
const cfg = universe === "B"
  ? { osDescription: OPTIMIZED, corpusVersion: "optimized" as const }
  : { osDescription: WEAK, corpusVersion: "weak" as const };

const r = await runAgent({ task, ...cfg });
console.log(`\n=== UNIVERSE ${universe} (${universe === "B" ? "after Aether" : "before Aether"}) ===`);
console.log(`Task: ${task}`);
console.log(`Agent chose: ${r.chosenTool}`);
console.log(r.chosenTool.startsWith("orangeslice") ? "OrangeSlice USED" : "OrangeSlice NOT used (did it itself / competitor)");
