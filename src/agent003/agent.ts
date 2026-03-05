import { createAgent} from "langchain";
import { loadMcpTools } from "./tools/mcpTools.js";
import { systemPrompt } from "./systemPrompt.js";

// MCP tools are initialised once at startup using the static dev context from .env.
// For per-request user context in a production multi-tenant deployment, replace this
// singleton with a factory that calls loadMcpTools() using config.configurable.
const { tools: mcpTools } = await loadMcpTools({
  tenantId: process.env.DEV_TENANT_ID,
  userPassport: process.env.DEV_USER_PASSPORT,
  authorization: process.env.DEV_AUTHORIZATION,
  language: process.env.DEV_LANGUAGE,
});

const tools = Object.values(mcpTools);

export const agent = createAgent({
  model: `openai:${process.env.OPENAI_MODEL ?? "gpt-4o-mini"}`,
  tools,
  systemPrompt
});
