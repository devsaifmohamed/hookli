#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("hookli MCP server v1.6.6 running on stdio (66 hooks registered)");
}

main().catch((error) => {
  console.error("Fatal error starting hookli MCP server:", error);
  process.exit(1);
});
