import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./prompts/index.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "hookli",
      version: "1.6.6",
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
