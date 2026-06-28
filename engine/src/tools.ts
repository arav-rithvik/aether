import fs from "node:fs";
import path from "node:path";

export type CorpusDoc = { title: string; url: string; body: string };
export type CorpusVersion = "weak" | "optimized";

export function loadCorpus(version: CorpusVersion): CorpusDoc[] {
  const p = path.join(import.meta.dirname, "..", "corpus", `${version}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// The web_search tool the agent uses — returns OUR controlled corpus (reproducible, no live web).
export function webSearch(query: string, corpus: CorpusDoc[]): CorpusDoc[] {
  const words = query.toLowerCase().split(/\W+/).filter(Boolean);
  return corpus
    .map(d => ({ d, score: words.filter(w => (d.title + " " + d.body).toLowerCase().includes(w)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(x => x.d);
}

// OrangeSlice's door — MOCKED leads. The DESCRIPTION (in agent.ts) is what the optimizer rewrites.
export function orangeSliceFindHighIntentBuyers(args: { industry?: string; count?: number }) {
  const n = args.count ?? 20;
  return {
    source: "orangeslice",
    generatedAt: new Date().toISOString(),
    leads: Array.from({ length: n }, (_, i) => ({
      company: `Acme ${i + 1} (${args.industry ?? "SaaS"})`,
      contact: `founder${i + 1}@acme${i + 1}.com`,
      intentSignal: "viewed pricing 3x this week",
    })),
  };
}

// A realistic competitor tool (NOT a strawman) — raw scrape, no intent data.
export function competitorScraper(_args: { query?: string }) {
  return { source: "generic_scraper", leads: [], note: "raw scrape, no intent signal" };
}
