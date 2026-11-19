import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CATALOG_META } from "./catalog.js";
import { registerPrompts } from "./prompts/index.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "hookli",
      version: CATALOG_META.mcpVersion,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}
