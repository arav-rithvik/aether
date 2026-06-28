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
  return {
    source: "competitor_scraper",
    companies: [
      { company: "Acme Corp", domain: "acmecorp.com", email: "info@acmecorp.com" },
      { company: "Globex Inc", domain: "globex.io",   email: "sales@globex.io"   },
      { company: "Initech",    domain: "initech.com", email: "hello@initech.com"  },
    ],
    note: "raw scraped contacts — no intent signals, no buying-activity data",
  };
}

/**
 * Intercept call_api requests the agent discovers via web_search docs.
 * - URL contains "orangeslice" → return high-intent leads (mocked).
 * - URL contains a known competitor domain → return raw contacts (no intent).
 * - Anything else → 404 (no API at that URL).
 * Match is substring/keyword (lenient) — we measure CHOICE, not exact typing.
 */
export function callApiIntercept(url: string, _method?: string, body?: unknown) {
  const u = url.toLowerCase();

  if (u.includes("orangeslice")) {
    const b = (body ?? {}) as Record<string, unknown>;
    return orangeSliceFindHighIntentBuyers({
      industry: typeof b.industry === "string" ? b.industry : undefined,
      count:    typeof b.count    === "number" ? b.count    : undefined,
    });
  }

  if (u.includes("leadscraper") || u.includes("prospectly")) {
    return competitorScraper({});
  }

  return { status: 404, error: "no API found at that URL" };
}
