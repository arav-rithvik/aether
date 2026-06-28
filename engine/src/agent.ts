import "./env.js"; // load engine/.env before SDK clients read their keys
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  loadCorpus, webSearch, callApiIntercept, type CorpusVersion,
} from "./tools.js";

// ── Public types (locked interface — do not change) ────────────────────────

export type AgentStep =
  | { kind: "tool_call"; tool: string; args: unknown }
  | { kind: "tool_result"; tool: string; result: unknown }
  | { kind: "final"; text: string };

export type RunResult = {
  model: string;
  chosenTool: string;        // provider of the FIRST successful task-fulfilling call_api: "orangeslice" | "competitor" | "DIY"
  calledTool: boolean;       // true if any successful provider call_api was made (404s don't count)
  returnedUsableData: boolean; // true only if the OrangeSlice call returned leads
  funnelStage: "candidacy" | "selection" | "execution";
  reasoning: string;         // short excerpt of the model's stated reasoning (for the runs log)
  trace: AgentStep[];        // ordered steps, for printing a clean terminal trace
};

// ── Tool definitions ───────────────────────────────────────────────────────
// The agent gets ONLY its natural "web + code" hands.
// It must discover OrangeSlice by searching, reading docs, then constructing a call_api call.
// OrangeSlice is NEVER handed to it — ambient discovery only.

export function buildTools() {
  return [
    {
      type: "function" as const,
      function: {
        name: "web_search",
        description: "Search the web for documentation, tools, APIs, or services that can help with the task.",
        parameters: {
          type: "object" as const,
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
    },
    {
      type: "function" as const,
      function: {
        name: "call_api",
        description: "Call any web API endpoint you discovered in search results or documentation. Provide the full URL and any required parameters.",
        parameters: {
          type: "object" as const,
          properties: {
            url:    { type: "string",  description: "Full API endpoint URL (e.g. https://api.example.com/v1/search)" },
            method: { type: "string",  description: "HTTP method: GET or POST. Defaults to GET." },
            body:   { type: "object",  description: "JSON request body for POST requests." },
          },
          required: ["url"],
        },
      },
    },
  ];
}

// ── Internal helpers ───────────────────────────────────────────────────────

const MAX_TURNS = 6; // raised from 5 — discovery needs: search → read → decide → call
const SYSTEM_PROMPT =
  "You are an autonomous agent with web search and the ability to call web APIs you discover. " +
  "Complete the user's task. Use a tool only if it genuinely helps; otherwise answer directly.";

type Corpus = ReturnType<typeof loadCorpus>;
type Tools  = ReturnType<typeof buildTools>;

/** Execute a tool by name and return the JSON result. */
function dispatch(name: string, args: unknown, corpus: Corpus): unknown {
  const a = (args ?? {}) as Record<string, unknown>;
  switch (name) {
    case "web_search":
      return webSearch(String(a.query ?? ""), corpus);
    case "call_api":
      return callApiIntercept(
        String(a.url ?? ""),
        a.method as string | undefined,
        a.body,
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/** Did any web_search result mention OrangeSlice? (Determines candidacy gate.) */
function osInDocs(result: unknown): boolean {
  return JSON.stringify(result).toLowerCase().includes("orangeslice");
}

/** Did OrangeSlice return any usable leads? (Determines execution gate.) */
function leadsUsable(result: unknown): boolean {
  const r = result as { leads?: unknown[] };
  return Array.isArray(r.leads) && r.leads.length > 0;
}

/** Is this a 404 response from the intercept? */
function is404(result: unknown): boolean {
  return typeof result === "object" && result !== null &&
    (result as { status?: number }).status === 404;
}

/**
 * Update chosenTool/calledTool/returnedUsable based on a call_api result.
 * Returns updated values; only changes chosenTool/calledTool on the FIRST successful call.
 */
function classifyCallApi(
  url: string,
  result: unknown,
  prev: { chosenTool: string; calledTool: boolean; returnedUsable: boolean },
) {
  const u = url.toLowerCase();
  const failed = is404(result);
  let { chosenTool, calledTool, returnedUsable } = prev;

  if (!failed && !calledTool) {
    calledTool = true;
    if      (u.includes("orangeslice"))                          chosenTool = "orangeslice";
    else if (u.includes("leadscraper") || u.includes("prospectly")) chosenTool = "competitor";
    // else: successful call to an unknown provider — stays "DIY"
  }

  // returnedUsable: true if OrangeSlice call succeeded AND had leads (checked every time)
  if (!failed && u.includes("orangeslice") && leadsUsable(result)) {
    returnedUsable = true;
  }

  return { chosenTool, calledTool, returnedUsable };
}

type LoopResult = {
  chosenTool: string;
  calledTool: boolean;
  returnedUsableData: boolean;
  osSeenInSearch: boolean;
  reasoning: string;
  trace: AgentStep[];
};

// ── OpenAI multi-turn loop ─────────────────────────────────────────────────
// Wire format:
//   assistant → tool_calls[].function.{name, arguments: string}
//   user feed → role:"tool", tool_call_id, content: string

async function loopOpenAI(
  task: string, tools: Tools, corpus: Corpus, model: string,
): Promise<LoopResult> {
  const client = new OpenAI();
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: task },
  ];

  const trace: AgentStep[] = [];
  let chosenTool     = "DIY";
  let calledTool     = false;
  let returnedUsable = false;
  let osSeenInSearch = false;
  let reasoning      = "";

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await client.chat.completions.create({
      model,
      messages,
      tools,
      tool_choice: "auto",
    });

    const msg = res.choices[0].message;
    if (msg.content) reasoning = reasoning || msg.content.slice(0, 400);

    if (!msg.tool_calls?.length) {
      // Model answered without calling a tool — we're done
      trace.push({ kind: "final", text: msg.content ?? "" });
      reasoning = reasoning || (msg.content ?? "").slice(0, 400);
      break;
    }

    // Append the full assistant message (tool_calls included) so the model
    // can see its own calls in subsequent turns
    messages.push(msg);

    for (const call of msg.tool_calls) {
      const name = call.function.name;
      const args = JSON.parse(call.function.arguments || "{}") as unknown;
      const a    = (args ?? {}) as Record<string, unknown>;

      trace.push({ kind: "tool_call", tool: name, args });

      const result = dispatch(name, args, corpus);

      // Track whether OrangeSlice ever appeared in search results
      if (name === "web_search" && osInDocs(result)) osSeenInSearch = true;

      // Classify call_api outcomes
      if (name === "call_api") {
        const updated = classifyCallApi(String(a.url ?? ""), result, { chosenTool, calledTool, returnedUsable });
        chosenTool     = updated.chosenTool;
        calledTool     = updated.calledTool;
        returnedUsable = updated.returnedUsable;
      }

      trace.push({ kind: "tool_result", tool: name, result });

      // Feed the result back as a tool message so the next turn sees it
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  return {
    chosenTool, calledTool,
    returnedUsableData: returnedUsable,
    osSeenInSearch, reasoning, trace,
  };
}

// ── Anthropic multi-turn loop ──────────────────────────────────────────────
// Wire format:
//   assistant → content[].{type:"tool_use", id, name, input: object}
//   user feed → content[].{type:"tool_result", tool_use_id, content: string}
//   stop_reason: "tool_use" | "end_turn"

/** Convert OpenAI-style tool defs to the Anthropic SDK shape. */
function toAnthropicTools(tools: Tools): Anthropic.Tool[] {
  return tools.map(t => ({
    name:         t.function.name,
    description:  t.function.description,
    input_schema: t.function.parameters as Anthropic.Tool["input_schema"],
  }));
}

async function loopAnthropic(
  task: string, tools: Tools, corpus: Corpus, model: string,
): Promise<LoopResult> {
  const client         = new Anthropic();
  const anthropicTools = toAnthropicTools(tools);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];

  const trace: AgentStep[] = [];
  let chosenTool     = "DIY";
  let calledTool     = false;
  let returnedUsable = false;
  let osSeenInSearch = false;
  let reasoning      = "";

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await client.messages.create({
      model,
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages,
      tools: anthropicTools,
    });

    // Collect any text reasoning the model emitted
    const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
    const text       = textBlocks.map(b => b.text).join("\n").trim();
    if (text) reasoning = reasoning || text.slice(0, 400);

    // Append the assistant turn so the model sees its own output next turn.
    messages.push({
      role:    "assistant",
      content: res.content as unknown as Anthropic.MessageParam["content"],
    });

    if (res.stop_reason === "end_turn" || res.stop_reason !== "tool_use") {
      // No more tool calls; model is done
      trace.push({ kind: "final", text });
      break;
    }

    // Process every tool_use block in this turn
    const toolUses    = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const use of toolUses) {
      const name = use.name;
      const args = use.input as Record<string, unknown>;

      trace.push({ kind: "tool_call", tool: name, args });

      const result = dispatch(name, args, corpus);

      // Track whether OrangeSlice ever appeared in search results
      if (name === "web_search" && osInDocs(result)) osSeenInSearch = true;

      // Classify call_api outcomes
      if (name === "call_api") {
        const updated = classifyCallApi(String(args.url ?? ""), result, { chosenTool, calledTool, returnedUsable });
        chosenTool     = updated.chosenTool;
        calledTool     = updated.calledTool;
        returnedUsable = updated.returnedUsable;
      }

      trace.push({ kind: "tool_result", tool: name, result });

      // Anthropic requires all tool results in a single user message
      toolResults.push({
        type:        "tool_result",
        tool_use_id: use.id,
        content:     JSON.stringify(result),
      });
    }

    // Feed all results back in one user turn
    messages.push({ role: "user", content: toolResults });
  }

  return {
    chosenTool, calledTool,
    returnedUsableData: returnedUsable,
    osSeenInSearch, reasoning, trace,
  };
}

// ── Public entrypoint ──────────────────────────────────────────────────────

/**
 * Run a real multi-turn agentic loop and report what the model actually did.
 *
 * model: "gpt-*" → OpenAI SDK   |   "claude-*" → Anthropic SDK
 * Defaults to "gpt-4o" if omitted.
 *
 * osDescription: REMOVED — the agent now discovers OrangeSlice via web_search
 * (ambient discovery). This parameter is kept optional for backward-compat but
 * is no longer injected into any tool definition.
 */
export async function runAgent(opts: {
  task:           string;
  corpusVersion:  CorpusVersion;
  model?:         string;   // optional for backward-compat
  osDescription?: string;   // no longer used; kept for backward-compat
}): Promise<RunResult> {
  const model  = opts.model ?? "gpt-4o";
  const corpus = loadCorpus(opts.corpusVersion);
  const tools  = buildTools();

  // Route to the correct SDK loop based on model name prefix
  const loop   = model.startsWith("claude") ? loopAnthropic : loopOpenAI;
  const inner  = await loop(opts.task, tools, corpus, model);

  // Funnel stage = FURTHEST gate reached in this run (§3 of SECOND_BRAIN.md)
  const funnelStage: RunResult["funnelStage"] =
    inner.returnedUsableData ? "execution"
    : inner.osSeenInSearch   ? "selection"
    :                          "candidacy";

  return {
    model,
    chosenTool:         inner.chosenTool,
    calledTool:         inner.calledTool,
    returnedUsableData: inner.returnedUsableData,
    funnelStage,
    reasoning:          inner.reasoning,
    trace:              inner.trace,
  };
}
