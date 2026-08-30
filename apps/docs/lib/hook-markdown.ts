import type { ApiRow } from "@/components/api-table";
import { getHookDoc } from "@/lib/hook-docs";
import { getHookSource } from "@/lib/hook-sources";
import { CATEGORY_LABELS, type HookEntry } from "@/lib/hooks-registry";
import { SITE_URL } from "@/lib/site";

/* THE single hook → Markdown renderer. Everything AI-facing goes through here:
   the per-hook /docs/[slug]/llms.txt route, the whole-library llms-full.txt,
   and the "Copy for AI" button all render a hook with THIS function — there is
   exactly one Markdown renderer in the codebase. Data is pulled from the same
   registry + hook-docs + hook-sources helpers the human pages use, so the
   Markdown can never drift from what the site shows. */

/* The canonical docs URL for a hook — the same link the Markdown advertises. */
export function hookDocUrl(slug: string): string {
  return `${SITE_URL}/docs/${slug}`;
}

/* Parameters / Returns / type-alias rows → a Markdown bullet list. Mirrors the
   ApiTable columns (name · type · default · description) in a form an LLM reads
   cleanly. */
function rowsToMarkdown(rows: readonly ApiRow[]): string {
  return rows
    .map((row) => {
      const def = row.defaultValue ? ` (default: \`${row.defaultValue}\`)` : "";
      return `- \`${row.name}\`: \`${row.type}\`${def} — ${row.description}`;
    })
    .join("\n");
}

export function hookToMarkdown(hook: HookEntry): string {
  const doc = getHookDoc(hook.slug);
  const source = getHookSource(hook.slug);

  const sections: string[] = [
    `# ${hook.name}`,
    `> ${hook.description}`,
    [
      `- Category: ${CATEGORY_LABELS[hook.category]}`,
      `- Package: \`hookli\` (install with \`npm i hookli\`)`,
      `- Docs: ${hookDocUrl(hook.slug)}`,
    ].join("\n"),
    `## Signature\n\n\`\`\`ts\n${hook.signature}\n\`\`\``,
  ];

  if (doc && doc.parameters.length > 0) {
    sections.push(`## Parameters\n\n${rowsToMarkdown(doc.parameters)}`);
  }

  if (doc && doc.returns.length > 0) {
    sections.push(`## Returns\n\n${rowsToMarkdown(doc.returns)}`);
  }

  if (doc?.typeAliases?.length) {
    const aliases = doc.typeAliases
      .map((alias) => {
        const description = alias.description ? `${alias.description}\n\n` : "";
        return `### ${alias.name}\n\n${description}${rowsToMarkdown(alias.rows)}`;
      })
      .join("\n\n");
    sections.push(`## Types\n\n${aliases}`);
  }

  if (doc?.usage) {
    sections.push(`## Usage\n\n\`\`\`tsx\n${doc.usage.trim()}\n\`\`\``);
  }

  if (source) {
    sections.push(
      `## Source\n\n\`${source.path}\`\n\n\`\`\`ts\n${source.source.trim()}\n\`\`\``,
    );
  }

  return sections.join("\n\n");
}
