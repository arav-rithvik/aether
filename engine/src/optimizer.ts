// Reads failure tags from recent runs, rewrites OS's description, re-runs. SECOND_BRAIN.md §3.
// TODO(Arav):
//  1) pull recent `runs` where chosenTool != orangeslice
//  2) LLM-label WHY: desc_vague / i_can_do_this_myself / picked_competitor / not_found
//  3) ask an LLM to rewrite the description to fix the top failure (TRUTHFUL claims only — no "always use me")
//  4) write descriptions v+1 (with changeReason), re-run windtunnel, write new scores
console.log("optimizer: TODO — implement the rewrite loop (SECOND_BRAIN.md §3).");
