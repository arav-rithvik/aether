"use client";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useEffect } from "react";
import { setLive } from "./live";

// Public Convex deployment URL (not a secret — it ships in the browser bundle anyway).
// Hardcoded fallback so any checkout connects to the shared live engine with zero setup.
const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://cheerful-ferret-802.convex.cloud";
const client = url ? new ConvexReactClient(url) : null;

// referenced by string so we don't need generated types to build
const qScores = makeFunctionReference<"query">("queries:getScores");
const qRuns = makeFunctionReference<"query">("queries:getRuns");

function LiveData() {
  // these return undefined until the deployment has the functions + data
  const scores = useQuery(qScores) as unknown[] | undefined;
  const runs = useQuery(qRuns) as Record<string, unknown>[] | undefined;

  useEffect(() => {
    // only swap to live when the deployment actually has OUR seeded shape,
    // otherwise keep the mock (empty/foreign data must never zero the dashboard)
    const valid =
      Array.isArray(runs) &&
      runs.length >= 50 &&
      runs.some((r) => r.model === "gpt-4o" && typeof r.descriptionVersion === "number") &&
      Array.isArray(scores) &&
      scores.length >= 1;
    if (valid) {
      setLive({
        runs: (runs as Record<string, unknown>[]).map((r) => ({ ...r, id: r._id })) as never,
        scores: (scores as Record<string, unknown>[]).map((s) => ({ ...s, id: s._id })) as never,
      });
    }
  }, [scores, runs]);

  return null;
}

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  if (!client) return <>{children}</>;
  return (
    <ConvexProvider client={client}>
      <LiveData />
      {children}
    </ConvexProvider>
  );
}
