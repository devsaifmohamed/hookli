import Link from "next/link";
import { ApiTable } from "@/components/api-table";
import { CodeBlock, HighlightedCode } from "@/components/code-block";
import { HookActionBar } from "@/components/hook-action-bar";
import { HookCard } from "@/components/hook-card";
import { HookDemo } from "@/components/hook-demo";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "@/components/icons";
import { DEMOS } from "@/components/demos";
import { OnThisPage, type TocItem } from "@/components/on-this-page";
import { getHookDoc, getHookSource, getPlaygroundSources, hookSourceUrl } from "@/lib/hook-catalog";
import { hookDocUrl, hookToMarkdown } from "@/lib/hook-markdown";
import {
  CATEGORY_LABELS,
  HOOKS,
  relatedHooks,
  type HookEntry,
} from "@/lib/hooks-registry";
import { linkifyWebApis } from "@/lib/web-apis";

/* Modern Mintlify-style Hook Page:
   - Breadcrumb navigation (Docs / Category / Hook)
   - Hero Header with Category badge and clear description
   - Unified Action Bar (Import snippet, Copy for AI, ChatGPT, Claude, MCP, Source)
   - Interactive Playground with Preview & Code tabs
   - API Reference (Signature, Parameters property list, Returns, Types)
   - Related Hooks
   - Modern Next/Previous navigation cards */
export function HookPage({ hook }: { hook: HookEntry }) {
  const doc = getHookDoc(hook.slug);
  const source = getHookSource(hook.slug);
  const Demo = DEMOS[hook.slug];

  const index = HOOKS.findIndex((entry) => entry.slug === hook.slug);
  const prev = index > 0 ? HOOKS[index - 1] : undefined;
  const next = index < HOOKS.length - 1 ? HOOKS[index + 1] : undefined;
  const related = relatedHooks(hook.slug);

  const toc: TocItem[] = [
    ...(doc ? [{ id: "usage", label: "Usage & Demo" }] : []),
    { id: "api", label: "API Reference" },
    ...(doc?.parameters.length ? [{ id: "parameters", label: "Parameters" }] : []),
    ...(doc?.returns.length ? [{ id: "returns", label: "Returns" }] : []),
    ...(related.length > 0 ? [{ id: "related", label: "Related Hooks" }] : []),
  ];

  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-3xl flex-1">
        {/* Breadcrumb Trail */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-between text-xs text-gray-body/60"
        >
          <ol className="flex items-center gap-1.5 min-w-0">
            <li>
              <Link
                href="/docs"
                className="transition-colors hover:text-white"
              >
                Docs
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="size-3 text-gray-body/40" />
            </li>
            <li>
              <span className="text-gray-body/80 font-medium">
                {CATEGORY_LABELS[hook.category]}
              </span>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="size-3 text-gray-body/40" />
            </li>
            <li className="truncate">
              <span className="font-mono text-accent font-medium">
                {hook.name}
              </span>
            </li>
          </ol>

          <div className="flex items-center gap-3 font-mono text-[11px] text-gray-body/60">
            {source && (
              <a
                href={hookSourceUrl(source.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-body/70 hover:text-white transition-colors"
                title="View implementation on GitHub"
              >
                <span>GitHub</span>
                <ExternalLinkIcon className="size-2.5 opacity-60" />
              </a>
            )}
            <span className="hidden sm:inline-block rounded-full bg-white/[0.04] px-2 py-0.5 border border-white/[0.04]">
              Zero deps
            </span>
            <span className="hidden sm:inline-block rounded-full bg-white/[0.04] px-2 py-0.5 border border-white/[0.04]">
              SSR-safe
            </span>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="mt-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent border border-accent/25">
              {CATEGORY_LABELS[hook.category]}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {hook.name}
          </h1>

          <p className="mt-3 text-base sm:text-lg leading-relaxed text-gray-body">
            {linkifyWebApis(hook.description)}
          </p>
          {doc?.details.split("\n\n").map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-relaxed text-gray-body">
              {linkifyWebApis(paragraph)}
            </p>
          ))}
        </header>

        {/* Action Row — ultra-clean (Copy Import + Copy for AI) */}
        <HookActionBar hook={hook} markdown={hookToMarkdown(hook)} docUrl={hookDocUrl(hook.slug)} />

        {/* Interactive Demo & Usage */}
        {doc && Demo && (
          <section id="usage" aria-label="Usage and interactive demo" className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="scroll-mt-24 text-xl sm:text-2xl font-semibold text-fg">
                Usage & Playground
              </h2>
            </div>
            <HookDemo
              className="mt-4"
              preview={<Demo />}
              code={<HighlightedCode code={doc.usage} />}
              hook={hook}
              usage={doc.usage}
              sources={getPlaygroundSources(hook.slug)}
            />
            {doc.examples?.map((example) => (
              <div key={example.title} className="mt-8">
                <h3 className="text-base font-semibold text-fg">{example.title}</h3>
                {example.description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-body">{example.description}</p>
                )}
                <CodeBlock code={example.code.trim()} lang="tsx" className="mt-3" />
              </div>
            ))}
          </section>
        )}

        {/* API Reference */}
        <section id="api" aria-label="API Reference" className="mt-14">
          <h2 className="scroll-mt-24 text-xl sm:text-2xl font-semibold text-fg">
            API Reference
          </h2>

          {/* Signature */}
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-body/70">
              Signature
            </h3>
            <CodeBlock
              code={hook.signature}
              lang="ts"
              title={`${hook.name}.d.ts`}
              className="mt-3"
            />
          </div>

          {/* Parameters */}
          {doc && (
            <div id="parameters" className="mt-8">
              <h3 className="scroll-mt-24 text-xs font-semibold uppercase tracking-wider text-gray-body/70">
                Parameters
              </h3>
              {doc.parameters.length > 0 ? (
                <ApiTable
                  rows={doc.parameters}
                  withDefault
                  className="mt-3"
                />
              ) : (
                <p className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-sm text-gray-body/70">
                  This hook takes no parameters.
                </p>
              )}
            </div>
          )}

          {/* Returns */}
          {doc && (
            <div id="returns" className="mt-8">
              <h3 className="scroll-mt-24 text-xs font-semibold uppercase tracking-wider text-gray-body/70">
                Returns
              </h3>
              {doc.returns.length > 0 ? (
                <ApiTable rows={doc.returns} className="mt-3" />
              ) : (
                <p className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 text-sm text-gray-body/70">
                  This hook returns nothing.
                </p>
              )}
            </div>
          )}

          {/* Type Aliases */}
          {doc?.typeAliases && doc.typeAliases.length > 0 && (
            <div className="mt-10 space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-body/70">
                Type Definitions
              </h3>
              {doc.typeAliases.map((alias) => (
                <div
                  key={alias.name}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5"
                >
                  <h4 className="font-mono text-sm font-semibold text-accent">
                    {alias.name}
                  </h4>
                  {alias.description && (
                    <p className="mt-1.5 text-xs sm:text-sm text-gray-body">
                      {alias.description}
                    </p>
                  )}
                  <ApiTable rows={alias.rows} className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Hooks */}
        {related.length > 0 && (
          <section id="related" aria-label="Related hooks" className="mt-14">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-body/70">
              Related Hooks
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((entry) => (
                <HookCard key={entry.slug} hook={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Adjacent Hooks Navigation */}
        <nav
          aria-label="Adjacent hooks"
          className="mt-14 grid gap-4 border-t border-white/[0.06] pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="group flex flex-col items-start rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 transition-all duration-200 hover:border-accent/40 hover:bg-accent/[0.03] hover:-translate-y-0.5 shadow-sm"
            >
              <span className="flex items-center gap-1.5 text-xs text-gray-body/60 group-hover:text-accent transition-colors">
                <ArrowRightIcon className="size-3.5 rotate-180" />
                <span>Previous hook</span>
              </span>
              <span className="mt-1.5 font-mono text-sm font-semibold text-fg group-hover:text-white">
                {prev.name}
              </span>
              <span className="mt-1 line-clamp-1 text-xs text-gray-body/70">
                {prev.description}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/docs/${next.slug}`}
              className="group flex flex-col items-end rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 text-right transition-all duration-200 hover:border-accent/40 hover:bg-accent/[0.03] hover:-translate-y-0.5 shadow-sm"
            >
              <span className="flex items-center gap-1.5 text-xs text-gray-body/60 group-hover:text-accent transition-colors">
                <span>Next hook</span>
                <ArrowRightIcon className="size-3.5" />
              </span>
              <span className="mt-1.5 font-mono text-sm font-semibold text-fg group-hover:text-white">
                {next.name}
              </span>
              <span className="mt-1 line-clamp-1 text-xs text-gray-body/70">
                {next.description}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>

      {/* Right Sidebar — Table of Contents */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-20">
          <OnThisPage items={toc} />
        </div>
      </aside>
    </div>
  );
}
