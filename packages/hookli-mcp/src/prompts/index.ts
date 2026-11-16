import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatHookMarkdown, getHookBySlugOrName } from "../catalog.js";

export function registerPrompts(server: McpServer): void {
  // 1. implement-hook prompt
  server.prompt(
    "implement-hook",
    "Template for implementing a component with a hookli hook",
    {
      hookName: z.string().describe("The name of the hook (e.g. 'useDebounce', 'useLocalStorage')"),
      useCase: z.string().optional().describe("What you are trying to build with this hook"),
    },
    ({ hookName, useCase }) => {
      const hook = getHookBySlugOrName(hookName);
      const hookDoc = hook ? formatHookMarkdown(hook) : `(Hook ${hookName} not found in catalog)`;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `I am implementing a React feature using the \`hookli\` library (zero-dependency, SSR-safe, typed).`,
                useCase ? `My specific goal is: ${useCase}` : "",
                "",
                `Here is the official documentation and API for \`${hookName}\`:`,
                "---",
                hookDoc,
                "---",
                "",
                `Please write a complete, idiomatic, and SSR-safe React TypeScript component that demonstrates how to use this hook cleanly.`,
              ]
                .filter(Boolean)
                .join("\n"),
            },
          },
        ],
      };
    },
  );

  // 2. migrate-to-hookli prompt
  server.prompt(
    "migrate-to-hookli",
    "Template for migrating existing component code to use hookli",
    {
      sourceLibrary: z.enum(["react-use", "usehooks-ts", "custom"]).describe("The origin of the existing hooks"),
      currentCode: z.string().describe("The existing component code you want to migrate"),
    },
    ({ sourceLibrary, currentCode }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `I want to migrate this React component from \`${sourceLibrary}\` to \`hookli\`.`,
                `hookli features 66 typed, zero-runtime-dependency, SSR-safe React hooks.`,
                "",
                `Current component code:`,
                "```tsx",
                currentCode,
                "```",
                "",
                `Please:`,
                `1. Identify which hooks from \`${sourceLibrary}\` or custom implementations can be replaced by \`hookli\` hooks.`,
                `2. Rewrite the component using \`import { ... } from "hookli"\`.`,
                `3. Note any subtle API differences (e.g. argument order, return types, SSR guards) and explain the changes.`,
              ].join("\n"),
            },
          },
        ],
      };
    },
  );
}
