"use client";
import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useEffect } from "react";
import { setLive } from "./live";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = url ? new ConvexReactClient(url) : null;

// referenced by string so we don't need generated types to build
const qScores = makeFunctionReference<"query">("queries:getScores");
const qRuns = makeFunctionReference<"query">("queries:getRuns");

function LiveData() {
  // these return undefined until the deployment has the functions + data
  const scores = useQuery(qScores) as unknown[] | undefined;
  const runs = useQuery(qRuns) as Record<string, unknown>[] | undefined;

  useEffect(() => {
    if (scores && runs && runs.length) {
      setLive({
        runs: runs.map((r) => ({ ...r, id: r._id })) as never,
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
