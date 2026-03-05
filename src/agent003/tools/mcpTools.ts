import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import type { Connection } from "@langchain/mcp-adapters";
import type { StructuredToolInterface } from "@langchain/core/tools";

export interface UserContext {
  tenantId?: string;
  userPassport?: string; // raw JSON string
  authorization?: string;
  language?: string;
}

export interface HolidayRequestTools {
  get_my_holiday_requests: StructuredToolInterface;
  get_reasons_left: StructuredToolInterface;
  create_holiday_request: StructuredToolInterface;
  get_holiday_request: StructuredToolInterface;
  get_employees_for_func_tag: StructuredToolInterface;
}

export interface McpToolsResult {
  tools: HolidayRequestTools;
  /** Call when the agent server shuts down. */
  cleanup: () => Promise<void>;
}

const REQUIRED_TOOLS = [
  "get_my_holiday_requests",
  "get_reasons_left",
  "create_holiday_request",
  "get_holiday_request",
  "get_employees_for_func_tag",
] as const;

// Loads only the hcm-holiday-request and hcm-employee-profile MCP servers.
// No hcm-workflow server — this agent has no need for tenant/workflow config tools.
export async function loadMcpTools(
  userContext: UserContext
): Promise<McpToolsResult> {
  const { tenantId, userPassport, authorization, language } = userContext;

  const headers: Record<string, string> = {};
  if (tenantId) headers["Tenant-Id"] = tenantId;

  if (userPassport) {
    try {
      const passport = JSON.parse(userPassport) as Record<string, unknown>;
      const userId = passport["UserId"] ?? passport["userId"];
      if (userId) headers["User-Id"] = String(userId);
    } catch {
      /* non-critical */
    }
    // Escape non-ASCII (Romanian diacritics) as \uXXXX — HTTP headers must be Latin-1.
    headers["User-Passport"] = userPassport.replace(
      /[\u0080-\uFFFF]/g,
      (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`
    );
  }

  if (authorization) headers["Authorization"] = authorization;
  if (language) headers["Accept-Language"] = language;

  const serverConfigs: Record<string, Connection> = {};

  const holidayUrl = process.env.HOLIDAY_REQUEST_MCP_URL;
  if (holidayUrl) {
    serverConfigs["hcm-holiday-request"] = {
      transport: "sse",
      url: `${holidayUrl}/sse`,
      headers,
    };
  }

  const employeeUrl = process.env.EMPLOYEE_PROFILE_MCP_URL;
  if (employeeUrl) {
    serverConfigs["hcm-employee-profile"] = {
      transport: "sse",
      url: `${employeeUrl}/sse`,
      headers,
    };
  }

  if (Object.keys(serverConfigs).length === 0) {
    console.warn(
      "No MCP server URLs configured for holiday-request-agent — skipping MCP tool loading"
    );
    return {
      tools: makeEmptyTools(),
      cleanup: async () => {},
    };
  }

  try {
    const client = new MultiServerMCPClient(serverConfigs);
    const allTools = await client.getTools();

    const toolMap = Object.fromEntries(
      allTools
        .filter((t) => (REQUIRED_TOOLS as readonly string[]).includes(t.name))
        .map((t) => [t.name, t])
    ) as Partial<Record<(typeof REQUIRED_TOOLS)[number], StructuredToolInterface>>;

    const missing = REQUIRED_TOOLS.filter((name) => !toolMap[name]);
    if (missing.length > 0) {
      console.warn(
        `holiday-request-agent: missing expected MCP tools: ${missing.join(", ")}`
      );
    }

    console.info(
      `holiday-request-agent MCP tools loaded: ${Object.keys(toolMap).join(", ")}`
    );

    return {
      tools: toolMap as HolidayRequestTools,
      cleanup: () => client.close(),
    };
  } catch (err) {
    console.warn(
      "holiday-request-agent: failed to load MCP tools — agent will run without them:",
      err
    );
    return { tools: makeEmptyTools(), cleanup: async () => {} };
  }
}

function makeEmptyTools(): HolidayRequestTools {
  // Stub tools that return an error message — allows the graph to start even without MCP
  const stub = (name: string): StructuredToolInterface =>
    ({
      name,
      description: `Stub: ${name} — MCP server not available`,
      schema: { type: "object", properties: {} },
      invoke: async () => `Error: MCP tool ${name} is not available`,
    }) as unknown as StructuredToolInterface;

  return {
    get_my_holiday_requests: stub("get_my_holiday_requests"),
    get_reasons_left: stub("get_reasons_left"),
    create_holiday_request: stub("create_holiday_request"),
    get_holiday_request: stub("get_holiday_request"),
    get_employees_for_func_tag: stub("get_employees_for_func_tag"),
  };
}
