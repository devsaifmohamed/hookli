import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  formatHookMarkdown,
  getAllHooks,
  getHookBySlugOrName,
  getHooksByCategory,
  searchHooks,
} from "../catalog.js";
import type { HookCategory } from "../types.js";

const CategoryEnum = z.enum(["state", "effects", "dom", "data"]);

export function registerTools(server: McpServer): void {
  // 1. list_hooks
  server.tool(
    "list_hooks",
    "List all available hooks in hookli, optionally filtered by category or search term.",
    {
      category: CategoryEnum.optional().describe("Filter hooks by category: state, effects, dom, or data"),
      query: z.string().optional().describe("Optional substring filter matching hook name or description"),
    },
    async ({ category, query }) => {
      let hooks = category ? getHooksByCategory(category as HookCategory) : getAllHooks();

      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        hooks = hooks.filter(
          (h) => h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q),
        );
      }

      const summary = hooks.map((h) => ({
        name: h.name,
        slug: h.slug,
        category: h.category,
        description: h.description,
        signature: h.signature,
        docsUrl: h.docsUrl,
      }));

      const text = [
        `# hookli Hooks (${hooks.length} found)`,
        category ? `Filtered by category: **${category}**` : "",
        query ? `Filtered by query: **${query}**` : "",
        "",
        ...summary.map(
          (h) => `- **\`${h.name}\`** (\`${h.category}\`): ${h.description}\n  Signature: \`${h.signature}\``,
        ),
      ]
        .filter(Boolean)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    },
  );

  // 2. get_hook
  server.tool(
    "get_hook",
    "Get full documentation, TypeScript signature, parameter types, return values, and usage examples for a specific hook.",
    {
      name: z.string().describe("The name or slug of the hook (e.g. 'useDebounce', 'use-debounce', 'useLocalStorage')"),
    },
    async ({ name }) => {
      const hook = getHookBySlugOrName(name);
      if (!hook) {
        const suggestions = searchHooks(name, { limit: 3 });
        const didYouMean = suggestions.length
          ? `\n\nDid you mean:\n${suggestions.map((s) => `- \`${s.hook.name}\`: ${s.hook.description}`).join("\n")}`
          : "";
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Hook "${name}" not found in hookli catalog.${didYouMean}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: formatHookMarkdown(hook),
          },
        ],
      };
    },
  );

  // 3. search_hooks
  server.tool(
    "search_hooks",
    "Search hookli hooks by use-case description, intent, or keyword (e.g. 'persist state across reloads', 'listen to clicks outside dropdown', 'throttle api call').",
    {
      query: z.string().describe("Natural language query or keywords describing what you want to achieve"),
      category: CategoryEnum.optional().describe("Optional category constraint"),
      limit: z.number().int().min(1).max(20).optional().default(5).describe("Max number of matches to return"),
    },
    async ({ query, category, limit }) => {
      const results = searchHooks(query, {
        category: category as HookCategory | undefined,
        limit,
      });

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No hookli hooks matched your query "${query}". Try broader terms like "events", "timer", "storage", or "scroll".`,
            },
          ],
        };
      }

      const formatted = results
        .map(({ hook, score }, index) => {
          return [
            `### ${index + 1}. \`${hook.name}\` (Relevance: ${score})`,
            `> ${hook.description}`,
            `- **Category:** \`${hook.category}\``,
            `- **Signature:** \`${hook.signature}\``,
            `- **Docs:** [${hook.docsUrl}](${hook.docsUrl})`,
            `- **Common use-cases:** ${hook.useCases.slice(0, 6).join(", ")}`,
            hook.usage ? `\n\`\`\`tsx\n${hook.usage}\n\`\`\`` : "",
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n---\n\n");

      return {
        content: [
          {
            type: "text",
            text: `# Search Results for "${query}"\n\n${formatted}`,
          },
        ],
      };
    },
  );

  // 4. get_hook_source
  server.tool(
    "get_hook_source",
    "Retrieve the exact zero-dependency TypeScript implementation of a hook to inspect how it works, see SSR guards, or adapt it.",
    {
      name: z.string().describe("The name or slug of the hook (e.g. 'useAsync', 'useIntersectionObserver')"),
    },
    async ({ name }) => {
      const hook = getHookBySlugOrName(name);
      if (!hook) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Hook "${name}" not found.`,
            },
          ],
        };
      }

      const text = [
        `# Source for \`${hook.name}\``,
        `File: \`${hook.sourcePath}\``,
        `SSR-Safe: Yes (all browser globals are guarded)`,
        `Runtime Dependencies: 0 (Pure React + TypeScript)`,
        "",
        "```typescript",
        hook.source,
        "```",
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    },
  );

  // 5. suggest_hooks_for_task
  server.tool(
    "suggest_hooks_for_task",
    "Analyze a developer's feature requirements and recommend how to compose multiple hookli hooks to build it.",
    {
      taskDescription: z
        .string()
        .describe("Description of the UI component or feature you are building (e.g. 'A modal dialog with keyboard ESC escape, click-outside closing, and body scroll lock')"),
    },
    async ({ taskDescription }) => {
      const searchTerms = taskDescription
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);

      const scoredMatches = searchHooks(taskDescription, { limit: 6 });

      if (scoredMatches.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `Could not identify matching hookli hooks for: "${taskDescription}".`,
            },
          ],
        };
      }

      const recommendations = scoredMatches.map(({ hook }) => ({
        name: hook.name,
        category: hook.category,
        description: hook.description,
        signature: hook.signature,
        docsUrl: hook.docsUrl,
      }));

      const text = [
        `# Hook Recommendations for: "${taskDescription}"`,
        "",
        "Here are the hookli hooks that best fit this task:",
        "",
        ...recommendations.map(
          (rec, i) =>
            `### ${i + 1}. \`${rec.name}\` (${rec.category})\n- **Role:** ${rec.description}\n- **API:** \`${rec.signature}\`\n- **Docs:** ${rec.docsUrl}`,
        ),
        "",
        "## Suggested Composition Pattern",
        "```tsx",
        `import { ${recommendations.map((r) => r.name).join(", ")} } from "hookli";`,
        "",
        "export function MyFeatureComponent() {",
        ...recommendations.map(
          (r) => `  // Use ${r.name}: ${r.description}\n  // const ... = ${r.name}(...);`,
        ),
        "",
        "  return (",
        "    <div>",
        "      {/* Feature UI elements wired with hook handlers */}",
        "    </div>",
        "  );",
        "}",
        "```",
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    },
  );
}
