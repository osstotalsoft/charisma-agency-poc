# Charisma Agency

A LangGraph agent with arithmetic tools (add, multiply, divide) built with LangChain and LangGraph.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your OpenAI API key:
   ```env
   OPENAI_API_KEY=your-api-key
   OPENAI_MODEL=gpt-4o-mini  # optional, defaults to gpt-4o-mini
   ```

## Running

Start the LangGraph dev server:

```bash
npm start
```

The server will be available at `http://localhost:2024`.

## Agent Chat UI

You can interact with the agent using [Agent Chat UI](https://agentchat.vercel.app/?apiUrl=http://localhost:2024&assistantId=agent001).

## Agents

### agent001

A simple ReAct-style agent that performs arithmetic operations using the following tools:

- **add** — adds two numbers
- **multiply** — multiplies two numbers
- **divide** — divides two numbers

### agent002

A minimal weather agent built with `createAgent()` from LangChain. Uses a single `get_weather` tool that returns a static sunny forecast for any city.

### agent003

A Holiday Request Assistant that connects to HCM backend services via MCP (Model Context Protocol) over SSE. Helps users view and create holiday requests through a guided multi-step workflow.

Tools (loaded from MCP servers):

- **get_my_holiday_requests** — fetch the current user's holiday requests
- **get_reasons_left** — fetch available leave reason types
- **get_employees_for_func_tag** — fetch replacement employee candidates
- **create_holiday_request** — submit a new holiday request
- **get_holiday_request** — retrieve a request by workflow instance ID

Requires `HOLIDAY_REQUEST_MCP_URL` and `EMPLOYEE_PROFILE_MCP_URL` env vars pointing to the HCM MCP servers. For local development, set `DEV_TENANT_ID`, `DEV_USER_PASSPORT`, `DEV_AUTHORIZATION`, and `DEV_LANGUAGE` (copy from browser Network tab after HCM login).

### agent004

An expert research agent built with `createDeepAgent()` from the `deepagents` library. Conducts thorough research and writes polished reports using an internet search tool powered by Tavily.

Requires a `TAVILY_API_KEY` env var.
