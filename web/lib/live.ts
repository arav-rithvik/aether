// Tiny external store: holds live Convex data when available; selectors fall
// back to the mock until it is set. Lets the (non-hook) selectors stay simple.
import { Run, Score } from "./schema";

export type LiveDataset = { runs: Run[]; scores: Score[] } | null;

let LIVE: LiveDataset = null;
const subs = new Set<() => void>();

export function setLive(d: LiveDataset) {
  LIVE = d;
  subs.forEach((f) => f());
}
export function getLive(): LiveDataset {
  return LIVE;
}
export function subscribeLive(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}
