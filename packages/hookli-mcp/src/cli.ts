#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CATALOG_META } from "./catalog.js";
import { createMcpServer } from "./server.js";

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `hookli MCP server v${CATALOG_META.mcpVersion} running on stdio (hookli ${CATALOG_META.libraryVersion}, ${CATALOG_META.hookCount} hooks)`,
  );
}

main().catch((error) => {
  console.error("Fatal error starting hookli MCP server:", error);
  process.exit(1);
});
