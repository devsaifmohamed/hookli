import "server-only";
import catalog from "../../../packages/hookli/generated/catalog.json";
import type { ApiRow } from "@/components/api-table";
import { GITHUB_URL } from "@/lib/site";

/* Every fact about a hook, read from the library's catalog: the library build writes
   packages/hookli/generated/catalog.json from each hook's own code and TSDoc. The catalog
   holds every hook's source (~300 KB), so it is read on the server only; client code
   keeps the slim `hookli/manifest` (lib/hooks-registry.ts). */

type CatalogHook = (typeof catalog.hooks)[number];
type CatalogRow = { name: string; type: string; defaultValue?: string | null; description: string };

export type TypeAlias = { name: string; description?: string; rows: readonly ApiRow[] };

export type HookExample = { title: string; description?: string; code: string };

/** A hook page's reference content: usage, examples and API tables. */
export type HookDoc = {
  details: string;
  usage: string;
  examples: readonly HookExample[];
  parameters: readonly ApiRow[];
  returns: readonly ApiRow[];
  typeAliases: readonly TypeAlias[];
};

export type HookSource = {
  /** Repo-relative path, also the code-block filename. */
  path: string;
  source: string;
};

/** TSDoc `{@link useX}` reads as `useX` on the page. */
const prose = (text: string) => text.replace(/\{@link\s+([^}\s]+)\s*\}/g, "$1");

const row = ({ name, type, defaultValue, description }: CatalogRow): ApiRow => ({ name, type, defaultValue: defaultValue ?? undefined, description: prose(description) });

const hooks = new Map<string, CatalogHook>(catalog.hooks.map((hook) => [hook.slug, hook]));
const slugOfName = new Map<string, string>(catalog.hooks.map((hook) => [hook.name, hook.slug]));

export function getHookDoc(slug: string): HookDoc | undefined {
  const hook = hooks.get(slug);
  if (!hook) return undefined;
  return {
    details: prose(hook.details),
    usage: hook.usage,
    examples: hook.examples.map((e) => ({ title: e.title, description: e.description || undefined, code: e.code })),
    parameters: hook.parameters.map(row),
    returns: hook.returns.map(row),
    typeAliases: hook.typeAliases.map((a) => ({ name: a.name, description: a.description ? prose(a.description) : undefined, rows: a.rows.map(row) })),
  };
}

export function getHookSource(slug: string): HookSource | undefined {
  const hook = hooks.get(slug);
  return hook ? { path: hook.sourcePath, source: hook.source } : undefined;
}

/** The hooks a playground needs: this hook, those its usage imports, and every sibling they import (dependencies first). */
export function getPlaygroundSources(slug: string): Array<HookSource & { slug: string }> {
  const ordered: Array<HookSource & { slug: string }> = [];
  const seen = new Set<string>();
  const visit = (current: string) => {
    const hook = hooks.get(current);
    if (seen.has(current) || !hook) return;
    seen.add(current);
    for (const dep of hook.deps) visit(dep);
    ordered.push({ slug: current, path: hook.sourcePath, source: hook.source });
  };
  const usage = hooks.get(slug)?.usage ?? "";
  for (const target of [slug, ...importedHooks(usage).flatMap((name) => slugOfName.get(name) ?? [])]) visit(target);
  return ordered;
}

/** Hook names a usage snippet imports from "hookli". */
function importedHooks(code: string): string[] {
  const names: string[] = [];
  for (const m of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']hookli["']/g)) {
    for (const part of m[1].split(",")) {
      const name = part.replace(/^\s*type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (/^use[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

export function hookSourceUrl(path: string): string {
  return `${GITHUB_URL}/blob/main/${path}`;
}
