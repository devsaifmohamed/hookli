import catalogData from "./data/catalog.json";
import type { HookCatalogItem, HookCategory } from "./types.js";

export const CATALOG: HookCatalogItem[] = catalogData as HookCatalogItem[];

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
  const q = query.trim().toLowerCase();
  const limit = options?.limit ?? 10;
  const terms = q.split(/\s+/).filter(Boolean);

  const results: Array<{ hook: HookCatalogItem; score: number }> = [];

  for (const hook of CATALOG) {
    if (options?.category && hook.category.toLowerCase() !== options.category.toLowerCase()) {
      continue;
    }

    let score = 0;
    const nameLower = hook.name.toLowerCase();
    const descLower = hook.description.toLowerCase();
    const slugLower = hook.slug.toLowerCase();

    // Exact name match gets highest score
    if (nameLower === q || slugLower === q) {
      score += 100;
    } else if (nameLower.includes(q)) {
      score += 50;
    }

    for (const term of terms) {
      if (nameLower.includes(term)) score += 20;
      if (slugLower.includes(term)) score += 15;
      if (descLower.includes(term)) score += 10;
      if (hook.category.toLowerCase().includes(term)) score += 5;
      if (hook.useCases.some((uc) => uc.toLowerCase().includes(term))) score += 15;
    }

    if (score > 0) {
      results.push({ hook, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
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
