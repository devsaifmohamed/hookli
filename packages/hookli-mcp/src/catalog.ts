import library from "../../hookli/generated/catalog.json";
import pkg from "../package.json";
import { rankHooks } from "./search.js";
import type { ApiRow, HookCatalogItem, HookCategory } from "./types.js";

/* The library build writes ../../hookli/generated/catalog.json from the hooks' own code
   and TSDoc; tsup bundles it, so the published server carries no copy of its own. */
type LibraryRow = { name: string; type: string; defaultValue?: string | null; description: string };
type LibraryHook = (typeof library.hooks)[number];

const row = ({ name, type, defaultValue, description }: LibraryRow): ApiRow => ({ name, type, defaultValue: defaultValue ?? null, description });

function toItem(hook: LibraryHook): HookCatalogItem {
  return {
    slug: hook.slug,
    name: hook.name,
    description: hook.summary,
    category: hook.category as HookCategory,
    signature: hook.signature,
    parameters: hook.parameters.map(row),
    returns: hook.returns.map(({ name, type, description }) => ({ name, type, description })),
    typeAliases: hook.typeAliases.map((alias) => ({ name: alias.name, description: alias.description || null, rows: alias.rows.map(row) })),
    usage: hook.usage,
    examples: hook.examples.map((e) => ({ title: e.title, description: e.description || null, code: e.code })),
    source: hook.source.trim(),
    sourcePath: hook.sourcePath,
    docsUrl: `https://hookli.vercel.app/docs/${hook.slug}`,
    keywords: hook.keywords,
  };
}

export const CATALOG: HookCatalogItem[] = library.hooks.map(toItem);

/** The category ids, in the library's catalog/categories.json order. */
export const CATEGORY_IDS = library.categories.map((c) => c.id) as [HookCategory, ...HookCategory[]];

/** Which hookli release the bundled catalog describes, and this server's own version. */
export const CATALOG_META: { libraryVersion: string; mcpVersion: string; hookCount: number } = {
  libraryVersion: library.libraryVersion,
  mcpVersion: pkg.version,
  hookCount: CATALOG.length,
};

const key = (identifier: string) => identifier.trim().toLowerCase().replace(/^use-?/, "use").replace(/-/g, "");

/** Finds a hook by name or slug (`useDebounce`, `use-debounce`), including a deprecated alias (`useDefault`). */
export function getHookBySlugOrName(identifier: string): HookCatalogItem | undefined {
  const wanted = key(identifier);
  const index = library.hooks.findIndex((h) => key(h.slug) === wanted || h.aliases.some((a) => key(a.slug) === wanted));
  return index >= 0 ? CATALOG[index] : undefined;
}

export type RemovedHook = { slug: string; name: string; removedIn: string | null; replacement: string | null; note: string };

/** A hook listed in catalog/removed-hooks.json, by name or slug. */
export function getRemovedHook(identifier: string, removed: RemovedHook[] = library.removed as RemovedHook[]): RemovedHook | undefined {
  const wanted = key(identifier);
  return removed.find((h) => key(h.slug) === wanted || key(h.name) === wanted);
}

/** The answer for a removed hook: when it went and what to use instead. */
export function removedAnswer(hook: RemovedHook): string {
  const when = hook.removedIn ? `in v${hook.removedIn}` : "in the next release";
  const instead = hook.replacement ? ` Use \`${getHookBySlugOrName(hook.replacement)?.name ?? hook.replacement}\` instead.` : "";
  return `\`${hook.name}\` was removed from hookli ${when}.${instead}${hook.note ? ` ${hook.note}` : ""}`;
}

export function getAllHooks(): HookCatalogItem[] {
  return CATALOG;
}

export function getHooksByCategory(category: HookCategory): HookCatalogItem[] {
  return CATALOG.filter((h) => h.category.toLowerCase() === category.toLowerCase());
}

export function searchHooks(
  query: string,
  options?: {
    category?: HookCategory;
    limit?: number;
  },
): Array<{ hook: HookCatalogItem; score: number }> {
  return rankHooks(CATALOG, query, options);
}

export function formatHookMarkdown(hook: HookCatalogItem): string {
  const sections: string[] = [
    `# ${hook.name}`,
    `> ${hook.description}`,
    [
      `- Category: \`${hook.category}\``,
      `- Package: \`hookli\` (\`npm i hookli\`)`,
      `- Docs: [${hook.docsUrl}](${hook.docsUrl})`,
    ].join("\n"),
    `## Signature\n\n\`\`\`ts\n${hook.signature}\n\`\`\``,
  ];

  if (hook.parameters.length > 0) {
    const params = hook.parameters
      .map((p) => {
        const def = p.defaultValue ? ` (default: \`${p.defaultValue}\`)` : "";
        return `- \`${p.name}\`: \`${p.type}\`${def} — ${p.description}`;
      })
      .join("\n");
    sections.push(`## Parameters\n\n${params}`);
  }

  if (hook.returns.length > 0) {
    const returns = hook.returns
      .map((r) => `- \`${r.name}\`: \`${r.type}\` — ${r.description}`)
      .join("\n");
    sections.push(`## Returns\n\n${returns}`);
  }

  if (hook.typeAliases.length > 0) {
    const types = hook.typeAliases
      .map((ta) => {
        const desc = ta.description ? `${ta.description}\n\n` : "";
        const rows = ta.rows
          .map((row) => {
            const def = row.defaultValue ? ` (default: \`${row.defaultValue}\`)` : "";
            return `- \`${row.name}\`: \`${row.type}\`${def} — ${row.description}`;
          })
          .join("\n");
        return `### ${ta.name}\n\n${desc}${rows}`;
      })
      .join("\n\n");
    sections.push(`## Types\n\n${types}`);
  }

  if (hook.usage) {
    sections.push(`## Usage\n\n\`\`\`tsx\n${hook.usage}\n\`\`\``);
  }

  for (const example of hook.examples ?? []) {
    const desc = example.description ? `${example.description}\n\n` : "";
    sections.push(`### ${example.title}\n\n${desc}\`\`\`tsx\n${example.code}\n\`\`\``);
  }

  if (hook.source) {
    sections.push(`## Source Implementation\n\n\`\`\`ts\n${hook.source}\n\`\`\``);
  }

  return sections.join("\n\n");
}
