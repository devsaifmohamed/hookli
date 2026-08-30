import { hookDocUrl, hookToMarkdown } from "@/lib/hook-markdown";
import { HOOKS } from "@/lib/hooks-registry";
import { GITHUB_URL, NPM_URL, SITE_URL, TAGLINE } from "@/lib/site";

/* Builders for the two llmstxt.org files (/llms.txt + /llms-full.txt), derived
   entirely from the registry so the hook list, count and descriptions can never
   drift. Kept out of the route handlers so the whole-library dump can also feed
   the "Copy all hooks for AI" affordance on the docs index — one builder, one
   source of truth. */

const SUMMARY = `hookli is a zero-dependency, fully-typed, SSR-safe React hooks library — ${HOOKS.length} hooks for state, effects, the DOM and data.`;

/* /llms.txt — the concise index (llmstxt.org format): H1, blockquote summary,
   install line, a link list of key pages, then every hook as a link + one-liner. */
export function buildLlmsIndex(): string {
  const keyPages = [
    `- [hookli home](${SITE_URL}): ${TAGLINE}`,
    `- [Documentation](${SITE_URL}/docs): Live docs for all ${HOOKS.length} hooks.`,
    `- [Full text for LLMs](${SITE_URL}/llms-full.txt): Every hook's signature, usage and source in one file.`,
    `- [npm](${NPM_URL}): The published package.`,
    `- [GitHub](${GITHUB_URL}): Source, issues and contributions.`,
  ].join("\n");

  const hooks = HOOKS.map(
    (hook) => `- [${hook.name}](${hookDocUrl(hook.slug)}): ${hook.description}`,
  ).join("\n");

  return [
    "# hookli",
    `> ${SUMMARY}`,
    "Install with `npm i hookli`. Every hook is typed, tree-shakeable and works with React Server Components.",
    "## Docs",
    keyPages,
    "## Hooks",
    hooks,
    "",
  ].join("\n\n");
}

/* /llms-full.txt — the full-context dump: the same header, then every hook
   rendered through the shared Markdown renderer, separated by rules. */
export function buildLlmsFull(): string {
  const header = [
    "# hookli — full documentation for LLMs",
    `> ${SUMMARY}`,
    "Install with `npm i hookli`. This file contains every hook's name, description, signature, parameters, returns, usage and source — the complete reference in one document.",
  ].join("\n\n");

  const body = HOOKS.map((hook) => hookToMarkdown(hook)).join("\n\n---\n\n");

  return `${header}\n\n---\n\n${body}\n`;
}
