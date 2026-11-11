import Link from "next/link";
import { ApiTable } from "@/components/api-table";
import { CodeBlock, HighlightedCode } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { HookAiActions } from "@/components/hook-ai-actions";
import { HookCard } from "@/components/hook-card";
import { HookDemo } from "@/components/hook-demo";
import { ArrowRightIcon, ExternalLinkIcon } from "@/components/icons";
import { OnThisPage, type TocItem } from "@/components/on-this-page";
import { getHookDoc } from "@/lib/hook-docs";
import { hookSourceUrl, getHookSource } from "@/lib/hook-sources";
import { CATEGORY_LABELS, HOOKS, relatedHooks, type HookEntry } from "@/lib/hooks-registry";
import { linkifyWebApis } from "@/lib/web-apis";

/* Hook page template.
   Anatomy: category → title → description → import snippet →
   Demo → API (signature + params + returns + type aliases) →
   Related hooks → prev/next pager.
   Right sidebar: On This Page TOC only. */

const headingClass = "scroll-mt-24 text-2xl";

export function HookPage({ hook }: { hook: HookEntry }) {
  const doc = getHookDoc(hook.slug);
  const source = getHookSource(hook.slug);

  const index = HOOKS.findIndex((entry) => entry.slug === hook.slug);
  const prev = index > 0 ? HOOKS[index - 1] : undefined;
  const next = index < HOOKS.length - 1 ? HOOKS[index + 1] : undefined;
  const related = relatedHooks(hook.slug);

  const importSnippet = `import { ${hook.name} } from 'hookli'`;

  const toc: TocItem[] = [
    ...(doc ? [{ id: "demo", label: "Demo" }] : []),
    { id: "api", label: "API" },
    ...(related.length > 0 ? [{ id: "related", label: "Related" }] : []),
  ];

  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-3xl flex-1">

        {/* Header */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-body">{CATEGORY_LABELS[hook.category]}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{hook.name}</h1>
          <p className="mt-4 leading-relaxed text-gray-body">{linkifyWebApis(hook.description)}</p>
        </header>

        {/* Quick import copy */}
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-gray-outline bg-ground px-4 py-2.5">
          <code className="flex-1 font-mono text-sm text-gray-body">{importSnippet}</code>
          <CopyButton text={importSnippet} label={`Copy import for ${hook.name}`} />
        </div>

        {/* AI actions */}
        <HookAiActions hook={hook} />

        {/* Demo */}
        {doc && (
          <>
            <h2 id="demo" className={`mt-10 ${headingClass}`}>
              Demo
            </h2>
            <HookDemo className="mt-4" preview={<doc.demo />} code={<HighlightedCode code={doc.usage} />} />
          </>
        )}

        {/* API */}
        <h2 id="api" className={`mt-12 ${headingClass}`}>
          API
        </h2>
        <CodeBlock code={hook.signature} lang="ts" title={`${hook.name}.d.ts`} className="mt-4" />

        {doc && (
          <>
            <h3 className="mt-8 scroll-mt-24 text-lg">Parameters</h3>
            {doc.parameters.length > 0 ? (
              <ApiTable rows={doc.parameters} withDefault className="mt-4" />
            ) : (
              <p className="mt-4 text-sm text-gray-body">This hook takes no parameters.</p>
            )}

            <h3 className="mt-8 scroll-mt-24 text-lg">Returns</h3>
            {doc.returns.length > 0 ? (
              <ApiTable rows={doc.returns} className="mt-4" />
            ) : (
              <p className="mt-4 text-sm text-gray-body">This hook returns nothing.</p>
            )}

            {doc.typeAliases?.map((alias) => (
              <div key={alias.name} className="mt-8">
                <h3 className="scroll-mt-24 font-mono text-lg text-fg">{alias.name}</h3>
                {alias.description && <p className="mt-2 text-sm text-gray-body">{alias.description}</p>}
                <ApiTable rows={alias.rows} className="mt-4" />
              </div>
            ))}
          </>
        )}

        {/* GitHub source link */}
        <p className="mt-10 text-sm">
          <a
            href={source ? hookSourceUrl(source.path) : `https://github.com/devsaifmohamed/hookli`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-accent underline-offset-4 hover:underline"
          >
            View source on GitHub
            <ExternalLinkIcon className="size-4" aria-hidden="true" />
          </a>
        </p>

        {/* Related hooks */}
        {related.length > 0 && (
          <section id="related" aria-label="Related hooks" className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-body">Related hooks</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((entry) => (
                <HookCard key={entry.slug} hook={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Prev / Next pager */}
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

      {/* Right sidebar — TOC only */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-24">
          <OnThisPage items={toc} />
        </div>
      </aside>
    </div>
  );
}
