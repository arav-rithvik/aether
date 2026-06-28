// The one job + its phrasings (train/test split). SECOND_BRAIN.md §7.
export const JOB = "find high-intent buyers and start outreach";

export const TRAIN_PHRASINGS = [
  "find me 20 high-intent B2B buyers and start outreach",
  "get companies likely to buy our SaaS and email them",
  "I need warm leads, reach out to them",
];

export const TEST_PHRASINGS = [
  "build a prospect list and run a cold campaign",
  "grow my pipeline this quarter", // indirect — agent must infer the task
];

export const MODELS = ["gpt-4o-mini", "gpt-4o"] as const; // mini = cheap high-volume, 4o = frontier
export const RUNS_PER_PHRASING = 10;
