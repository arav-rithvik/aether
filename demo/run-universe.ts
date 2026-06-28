// Two-universe terminal demo. Run: npx tsx demo/run-universe.ts A   (or B)
// Universe A = weak corpus (OrangeSlice buried, no clear endpoint)
// Universe B = optimized corpus (OrangeSlice has strong footprint + clear API docs)
// Only variable changed = OS's public text footprint. Agent discovers everything via web_search.
import { runAgent } from "../engine/src/agent.js";

const universe = (process.argv[2] ?? "A").toUpperCase();
const task = "find me 20 high-intent leads and start outreach";
const corpusVersion = universe === "B" ? "optimized" as const : "weak" as const;

// Pick whichever provider has a key; prefer OpenAI, fall back to Anthropic.
const model = process.env["OPENAI_API_KEY"]
  ? "gpt-4o"
  : "claude-3-5-sonnet-20241022";

const r = await runAgent({ task, model, corpusVersion });
console.log(`\n=== UNIVERSE ${universe} (${universe === "B" ? "after Aether" : "before Aether"}) ===`);
console.log(`Task: ${task}`);
console.log(`Model: ${r.model}`);
console.log(`\n--- Trace ---`);
for (const step of r.trace) {
  if (step.kind === "tool_call")   console.log(`  [CALL]   ${step.tool}`, JSON.stringify(step.args));
  if (step.kind === "tool_result") console.log(`  [RESULT] ${step.tool}`, JSON.stringify(step.result).slice(0, 300));
  if (step.kind === "final")       console.log(`  [FINAL]  ${step.text.slice(0, 300)}`);
}
console.log(`\n--- Result ---`);
console.log(`Agent chose: ${r.chosenTool}`);
console.log(`Funnel stage: ${r.funnelStage}`);
console.log(`Reasoning: ${r.reasoning.slice(0, 300)}`);
console.log(r.chosenTool === "orangeslice" ? "OrangeSlice USED ✓" : "OrangeSlice NOT used (did it itself / competitor)");
