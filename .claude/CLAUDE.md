# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start the LangGraph dev server (serves all agents at http://localhost:2024)
npm start
```

The `langgraph.json` file uses `.env.local` for environment variables (not `.env`). Copy `.env` to `.env.local` and fill in real values.

No build or test commands are configured — the dev server runs TypeScript directly via `tsx`.

## Architecture

This is a **LangGraph multi-agent POC** using TypeScript. All agents are registered in [langgraph.json](langgraph.json) and served by the LangGraph dev server. Each agent lives in `src/agentXXX/agent.ts` and exports a named `agent`.

### Agent Overview

| Agent | Purpose | Key Pattern |
|-------|---------|-------------|
| `agent001` | Arithmetic (add/multiply/divide) | Manual `StateGraph` with `MessagesState`, custom `llmCall`/`toolNode`/`shouldContinue` nodes |
| `agent002` | Weather lookup | `createAgent()` from `langchain` — minimal wrapper |
| `agent003` | HCM Holiday Requests | `createAgent()` + MCP tools via `MultiServerMCPClient` (SSE transport) |
| `agent004` | Internet research | `createDeepAgent()` from `deepagents` + Tavily search + `MemorySaver` checkpointer |
| `agent005` | File Management Assistant | `createDeepAgent()` from `deepagents` + `LocalShellBackend` (virtualMode) + `MemorySaver` checkpointer |

### Two Agent Construction Styles

**Low-level (agent001):** Manually builds a `StateGraph` with typed state (`StateSchema`/`MessagesValue`/`ReducedValue`), explicit nodes, and conditional edges. This is the canonical LangGraph pattern.

**High-level (agent002, agent003, agent004):** Uses `createAgent()` (langchain) or `createDeepAgent()` (deepagents) — pass `model`, `tools`, and `systemPrompt`, get a runnable agent back.

### MCP Integration (agent003)

`src/agent003/tools/mcpTools.ts` connects to external HCM backend services over SSE MCP transport. Required env vars: `HOLIDAY_REQUEST_MCP_URL`, `EMPLOYEE_PROFILE_MCP_URL`. User context (tenant, passport, auth, language) is forwarded as HTTP headers. Stubs are returned when MCP servers are unavailable so the graph can still start.

The `DEV_TENANT_ID`, `DEV_USER_PASSPORT`, `DEV_AUTHORIZATION`, `DEV_LANGUAGE` vars in `.env.local` supply the dev-time user context (copy from browser Network tab after HCM login).

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for all agents |
| `OPENAI_MODEL` | Model name (default: `gpt-4o-mini`) |
| `LANGSMITH_API_KEY` + `LANGCHAIN_TRACING_V2` | LangSmith tracing |
| `TAVILY_API_KEY` | Required for agent004 internet search |
| `HOLIDAY_REQUEST_MCP_URL` | agent003 holiday request MCP server |
| `EMPLOYEE_PROFILE_MCP_URL` | agent003 employee profile MCP server |
| `DEV_TENANT_ID`, `DEV_USER_PASSPORT`, `DEV_AUTHORIZATION`, `DEV_LANGUAGE` | agent003 dev user context |

### TypeScript Config

ES modules (`"type": "module"`), `NodeNext` module resolution. Imports within `src/` must use `.js` extensions (e.g., `import { x } from "./tools/mcpTools.js"`). Strict mode enabled.

### Agent Chat UI

Interact with any agent at `https://agentchat.vercel.app/?apiUrl=http://localhost:2024&assistantId=agentXXX`.
