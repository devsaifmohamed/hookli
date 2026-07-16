import Link from "next/link";
import { ApiTable } from "@/components/api-table";
import { CodeBlock, HighlightedCode } from "@/components/code-block";
import { HookCard } from "@/components/hook-card";
import { HookDemo } from "@/components/hook-demo";
import { ArrowRightIcon, ExternalLinkIcon } from "@/components/icons";
import { OnThisPage, type TocItem } from "@/components/on-this-page";
import { getHookDoc } from "@/lib/hook-docs";
import { getHookSource, hookSourceUrl } from "@/lib/hook-sources";
import { CATEGORY_LABELS, HOOKS, relatedHooks, type HookEntry } from "@/lib/hooks-registry";
import { GITHUB_URL } from "@/lib/site";
import { linkifyWebApis } from "@/lib/web-apis";

/* THE hook-page template (T16 usehooks-ts anatomy parity). Every page under
   app/docs/[slug] is this one component driven by the registry + HOOK_DOCS +
   hook-sources data — no per-hook layout exists. Adding a hook needs only a
   registry entry, a HOOK_DOCS entry and one demo component.

   Anatomy: category → title → linked one-liner → Demo → Usage (line-numbered,
   hook-call line highlighted) → API (signature, Parameters w/ default chips,
   Returns, type-alias tables) → Hook (vendored source) → pager. A right-rail
   On-This-Page TOC + support slot sits alongside from xl up. */

const headingClass = "scroll-mt-24 text-2xl";

export function HookPage({ hook }: { hook: HookEntry }) {
  const doc = getHookDoc(hook.slug);
  const source = getHookSource(hook.slug);

  const index = HOOKS.findIndex((entry) => entry.slug === hook.slug);
  const prev = index > 0 ? HOOKS[index - 1] : undefined;
  const next = index < HOOKS.length - 1 ? HOOKS[index + 1] : undefined;
  const related = relatedHooks(hook.slug);

  /* Highlight the line that actually calls the hook in the Usage snippet. */
  const usageLines = doc?.usage.trim().split("\n") ?? [];
  const callIndex = usageLines.findIndex((line) => line.includes(`${hook.name}(`));
  const highlightLine = callIndex >= 0 ? callIndex + 1 : undefined;

  const toc: TocItem[] = [
    ...(doc ? [{ id: "demo", label: "Demo" }] : []),
    ...(doc ? [{ id: "usage", label: "Usage" }] : []),
    { id: "api", label: "API" },
    ...(source ? [{ id: "hook", label: "Hook" }] : []),
  ];

  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-3xl flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-body">{CATEGORY_LABELS[hook.category]}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">{hook.name}</h1>
        <p className="mt-4 leading-relaxed text-gray-body">{linkifyWebApis(hook.description)}</p>

        {doc && (
          <>
            <h2 id="demo" className={`mt-10 ${headingClass}`}>
              Demo
            </h2>
            <HookDemo className="mt-4" preview={<doc.demo />} code={<HighlightedCode code={doc.usage} />} />

            <h2 id="usage" className={`mt-12 ${headingClass}`}>
              Usage
            </h2>
            <CodeBlock code={doc.usage} lang="tsx" title={`${hook.slug}.tsx`} lineNumbers highlightLine={highlightLine} className="mt-4" />
          </>
        )}

        <h2 id="api" className={`mt-12 ${headingClass}`}>
          API
        </h2>
        <CodeBlock code={hook.signature} lang="ts" title={`${hook.name}.d.ts`} className="mt-4" />

        {doc && (
          <>
            <h3 className="mt-8 scroll-mt-24 text-lg">Parameters</h3>
            {doc.parameters.length > 0 ? <ApiTable rows={doc.parameters} withDefault className="mt-4" /> : <p className="mt-4 text-sm text-gray-body">This hook takes no parameters.</p>}

            <h3 className="mt-8 scroll-mt-24 text-lg">Returns</h3>
            {doc.returns.length > 0 ? <ApiTable rows={doc.returns} className="mt-4" /> : <p className="mt-4 text-sm text-gray-body">This hook returns nothing.</p>}

            {doc.typeAliases?.map((alias) => (
              <div key={alias.name} className="mt-8">
                <h3 className="scroll-mt-24 font-mono text-lg text-fg">{alias.name}</h3>
                {alias.description && <p className="mt-2 text-sm text-gray-body">{alias.description}</p>}
                <ApiTable rows={alias.rows} className="mt-4" />
              </div>
            ))}
          </>
        )}

        {source && (
          <>
            <h2 id="hook" className={`mt-12 ${headingClass}`}>
              Hook
            </h2>
            <p className="mt-4 text-sm text-gray-body">The implementation, straight from hookli. Copy it, or install the package.</p>
            <CodeBlock code={source.source} lang="tsx" title={source.path} lineNumbers className="mt-4" />
            <p className="mt-4 text-sm">
              <a
                href={hookSourceUrl(source.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-accent underline-offset-4 hover:underline"
              >
                View source on GitHub
                <ExternalLinkIcon className="size-4" aria-hidden="true" />
              </a>
            </p>
          </>
        )}

        {!source && (
          <p className="mt-12 text-sm">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-accent underline-offset-4 hover:underline">
              View source on GitHub
              <ExternalLinkIcon className="size-4" aria-hidden="true" />
            </a>
          </p>
        )}

        {related.length > 0 && (
          <section aria-label="Related hooks" className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-body">Related hooks</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((entry) => (
                <HookCard key={entry.slug} hook={entry} />
              ))}
            </div>
          </section>
        )}

        <nav aria-label="Adjacent hooks" className="mt-12 flex items-center justify-between gap-4 border-t border-slate-syntax pt-6">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-gray-body transition-colors duration-200 hover:text-fg">
              <ArrowRightIcon className="size-4 rotate-180" aria-hidden="true" />
              {prev.name}
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-gray-body transition-colors duration-200 hover:text-fg">
              {next.name}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      </article>

      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-24 flex flex-col gap-8">
          <OnThisPage items={toc} />

          {/* Support slot — placeholder consistent with T12 (no real payment
              links; the real donation surface lives on /support). */}
          <div className="surface rounded-xl p-4">
            <p className="text-sm font-semibold text-fg">Support hookli</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-body">Free and open source. Star it or help it grow.</p>
            <Link href="/support" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-accent underline-offset-4 hover:underline">
              Ways to support
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
