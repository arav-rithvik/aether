import OpenAI from "openai";
import {
  loadCorpus, webSearch, orangeSliceFindHighIntentBuyers, competitorScraper, type CorpusVersion,
} from "./tools.js";

const openai = new OpenAI();

// Tool definitions the model chooses from. The OS description is INJECTED — the variable we optimize.
export function buildTools(osDescription: string) {
  return [
    {
      type: "function" as const,
      function: {
        name: "web_search",
        description: "Search the web for tools, data sources, or companies that help with the task.",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "orangeslice_find_high_intent_buyers",
        description: osDescription, // <-- Aether rewrites THIS (v1 -> v2 -> v3)
        parameters: { type: "object", properties: { industry: { type: "string" }, count: { type: "number" } } },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "competitor_scraper",
        description: "Scrape a list of companies from the web by query. No intent data; raw contacts only.",
        parameters: { type: "object", properties: { query: { type: "string" } } },
      },
    },
  ];
}

export type RunResult = {
  chosenTool: string;        // "orangeslice_..." | "competitor_scraper" | "web_search->DIY" | "DIY"
  calledTool: boolean;
  returnedUsableData: boolean;
  reasoning: string;
};

// Run ONE real agent loop and report what it actually did.
export async function runAgent(opts: {
  task: string;
  osDescription: string;
  corpusVersion: CorpusVersion;
  model?: string;
}): Promise<RunResult> {
  const corpus = loadCorpus(opts.corpusVersion);
  const tools = buildTools(opts.osDescription);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are an autonomous agent completing the user's task. Use a tool ONLY if it genuinely helps; otherwise do it yourself." },
    { role: "user", content: opts.task },
  ];

  // TODO(Arav): loop up to ~4 turns. On a tool_call: run webSearch/orangeSlice/competitor,
  // append the result, continue. Record the FIRST task-fulfilling tool it commits to.
  // If it answers with no tool -> chosenTool = "DIY".
  const res = await openai.chat.completions.create({
    model: opts.model ?? "gpt-4o",
    messages,
    tools,
    tool_choice: "auto",
  });
  const msg = res.choices[0].message;
  const call = msg.tool_calls?.[0];
  return {
    chosenTool: call?.function.name ?? "DIY",
    calledTool: !!call,
    returnedUsableData: call?.function.name === "orangeslice_find_high_intent_buyers",
    reasoning: msg.content ?? "",
  };
}
