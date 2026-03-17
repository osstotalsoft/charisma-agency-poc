import { createDeepAgent, type DeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import { internetSearch } from "./tools/internet-search.js";
import { loadMcpTools } from "./tools/mcpTools.js";
import { systemPrompt } from "./systemPrompt.js";

// MCP tools are initialised once at startup using the static dev context from .env.
const { tools: mcpTools } = await loadMcpTools({
  tenantId: process.env.DEV_TENANT_ID,
  userPassport: process.env.DEV_USER_PASSPORT,
  authorization: process.env.DEV_AUTHORIZATION,
  language: process.env.DEV_LANGUAGE,
});

export const agent: DeepAgent = createDeepAgent({
  model: `openai:${process.env.OPENAI_MODEL ?? "gpt-4o-mini"}`,
  tools: [internetSearch, ...Object.values(mcpTools)],
  systemPrompt,
  checkpointer: new MemorySaver(),
});
