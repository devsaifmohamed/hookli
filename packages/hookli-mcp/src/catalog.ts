import catalogData from "./data/catalog.json";
import metaData from "./data/meta.json";
import { rankHooks } from "./search.js";
import type { HookCatalogItem, HookCategory } from "./types.js";

export const CATALOG: HookCatalogItem[] = catalogData as HookCatalogItem[];

/** Generated with the catalog: which hookli release it describes. */
export const CATALOG_META: { libraryVersion: string; mcpVersion: string; hookCount: number } = metaData;

export function getAllHooks(): HookCatalogItem[] {
  return CATALOG;
}

export function getHookBySlugOrName(identifier: string): HookCatalogItem | undefined {
  const norm = identifier.trim().toLowerCase().replace(/^use-?/, "use");
  return CATALOG.find((hook) => {
    const slugMatch = hook.slug.toLowerCase() === identifier.trim().toLowerCase();
    const nameMatch = hook.name.toLowerCase() === identifier.trim().toLowerCase();
    const normMatch = hook.name.toLowerCase() === norm;
    return slugMatch || nameMatch || normMatch;
  });
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

  if (hook.source) {
    sections.push(`## Source Implementation\n\n\`\`\`ts\n${hook.source}\n\`\`\``);
  }

  return sections.join("\n\n");
}
