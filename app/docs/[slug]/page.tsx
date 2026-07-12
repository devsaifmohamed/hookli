import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiTable } from "@/components/ApiTable";
import { CodeBlock, HighlightedCode } from "@/components/CodeBlock";
import { HookDemo } from "@/components/HookDemo";
import { ArrowRightIcon } from "@/components/Icons";
import { getHookDoc } from "@/lib/hook-docs";
import { CATEGORY_LABELS, HOOKS, getHook } from "@/lib/hooks-registry";
import { GITHUB_URL } from "@/lib/site";

/* Hook-page template (docs/DESIGN.md §4): category → title → description →
   live demo (Preview/Code tabs) → usage → API tables → source link → pager.
   Hooks without a lib/hook-docs.ts entry yet (T7–T10) render the signature-only
   subset of the same layout. */

export function generateStaticParams() {
  return HOOKS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hook = getHook(slug);
  if (!hook) return {};
  return {
    title: hook.name,
    description: hook.description,
    openGraph: {
      title: hook.name,
      description: hook.description,
      url: `/docs/${slug}`,
    },
  };
}

export default async function HookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hook = getHook(slug);
  if (!hook) notFound();

  const doc = getHookDoc(slug);
  const index = HOOKS.findIndex((entry) => entry.slug === slug);
  const prev = index > 0 ? HOOKS[index - 1] : undefined;
  const next = index < HOOKS.length - 1 ? HOOKS[index + 1] : undefined;

  return (
    <article className="flex max-w-3xl flex-col">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-syntax">
        {CATEGORY_LABELS[hook.category]}
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl">{hook.name}</h1>
      <p className="mt-4 leading-relaxed text-gray-body">{hook.description}</p>

      {doc && (
        <>
          <HookDemo
            className="mt-8"
            preview={<doc.demo />}
            code={<HighlightedCode code={doc.usage} />}
          />

          <h2 className="mt-12 text-2xl">Usage</h2>
          <CodeBlock
            code={doc.usage}
            lang="tsx"
            title={`${hook.slug}.tsx`}
            className="mt-4"
          />
        </>
      )}

      <h2 className="mt-12 text-2xl">API</h2>
      <CodeBlock
        code={hook.signature}
        lang="ts"
        title={`${hook.name}.d.ts`}
        className="mt-4"
      />

      {doc && (
        <>
          <h3 className="mt-8 text-lg">Parameters</h3>
          {doc.parameters.length > 0 ? (
            <ApiTable rows={doc.parameters} withDefault className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-gray-body">
              This hook takes no parameters.
            </p>
          )}

          <h3 className="mt-8 text-lg">Returns</h3>
          {doc.returns.length > 0 ? (
            <ApiTable rows={doc.returns} className="mt-4" />
          ) : (
            <p className="mt-4 text-sm text-gray-body">
              This hook returns nothing.
            </p>
          )}
        </>
      )}

      <p className="mt-12 text-sm text-gray-body">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-md text-accent underline-offset-4 hover:underline"
        >
          View source on GitHub
        </a>
      </p>

      <nav
        aria-label="Adjacent hooks"
        className="mt-8 flex items-center justify-between gap-4 border-t border-slate-syntax/40 pt-6"
      >
        {prev ? (
          <Link
            href={`/docs/${prev.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-gray-body transition-colors duration-200 hover:text-fg"
          >
            <ArrowRightIcon className="size-4 rotate-180" aria-hidden="true" />
            {prev.name}
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-gray-body transition-colors duration-200 hover:text-fg"
          >
            {next.name}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </nav>
    </article>
  );
}
