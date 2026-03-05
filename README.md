# Charisma Agency

A LangGraph agent with arithmetic tools (add, multiply, divide) built with LangChain and LangGraph.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your OpenAI API key:
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
