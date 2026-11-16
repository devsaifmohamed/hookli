import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CATALOG, formatHookMarkdown, getHookBySlugOrName } from "../catalog.js";

export function registerResources(server: McpServer): void {
  // 1. Full catalog resource
  server.resource(
    "catalog",
    "hookli://catalog",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(CATALOG, null, 2),
        },
      ],
    }),
  );

  // 2. Summary manifest resource
  server.resource(
    "manifest",
    "hookli://manifest",
    async (uri) => {
      const summary = CATALOG.map((h) => ({
        slug: h.slug,
        name: h.name,
        category: h.category,
        description: h.description,
        signature: h.signature,
        docsUrl: h.docsUrl,
      }));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ library: "hookli", version: "1.6.6", hooks: summary }, null, 2),
          },
        ],
      };
    },
  );

  // 3. Dynamic template for individual hook documentation
  server.resource(
    "hook-doc",
    new ResourceTemplate("hookli://hooks/{slug}", { list: undefined }),
    async (uri, { slug }) => {
      const hookSlug = Array.isArray(slug) ? slug[0] : slug;
      const hook = getHookBySlugOrName(hookSlug);
      if (!hook) {
        throw new Error(`Hook "${hookSlug}" not found`);
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: formatHookMarkdown(hook),
          },
        ],
      };
    },
  );
}
