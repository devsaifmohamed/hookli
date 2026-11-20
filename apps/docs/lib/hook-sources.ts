import { GENERATED_HOOK_SOURCES } from "@/lib/hook-sources.generated";
import { GITHUB_URL } from "@/lib/site";

/* Real implementation of every hook, for the "Source" section on each doc page,
   the per-hook AI markdown and the StackBlitz playground. The data is generated
   from packages/hookli/src by scripts/gen-hook-sources.mjs — never edit it by
   hand; CI fails when it drifts from the library. */

export type HookSource = {
  /* Repo-relative path, also the code-block filename. */
  path: string;
  source: string;
};

const REPO_BLOB = `${GITHUB_URL}/blob/main`;

export function getHookSource(slug: string): HookSource | undefined {
  const entry = GENERATED_HOOK_SOURCES[slug];
  return entry ? { path: entry.path, source: entry.source } : undefined;
}

/** The hook plus every sibling hook it imports, transitively (dependencies first). */
export function getHookSourceClosure(slugs: readonly string[]): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const visit = (slug: string) => {
    if (seen.has(slug) || !GENERATED_HOOK_SOURCES[slug]) return;
    seen.add(slug);
    for (const dep of GENERATED_HOOK_SOURCES[slug].deps) visit(dep);
    ordered.push(slug);
  };
  for (const slug of slugs) visit(slug);
  return ordered;
}

export function hookSourceUrl(path: string): string {
  return `${REPO_BLOB}/${path}`;
}
