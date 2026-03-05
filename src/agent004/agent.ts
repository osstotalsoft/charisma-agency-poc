import { createDeepAgent, type DeepAgent } from "deepagents";
import { MemorySaver } from "@langchain/langgraph";
import { internetSearch } from "./tools/internet-search.js";

// System prompt to steer the agent to be an expert researcher
const researchInstructions = `You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

You have access to an internet search tool as your primary means of gathering information.

## \`internet_search\`

Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
`;

export const agent: DeepAgent = createDeepAgent({
  model: `openai:${process.env.OPENAI_MODEL ?? "gpt-4o-mini"}`,
  tools: [internetSearch],
  systemPrompt: researchInstructions,
  checkpointer: new MemorySaver()
});
