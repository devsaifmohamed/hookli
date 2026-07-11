import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/CodeBlock";
import { CATEGORY_LABELS, HOOKS, getHook } from "@/lib/hooks-registry";
import { GITHUB_URL } from "@/lib/site";

/* Scaffold for the hook-page template (docs/DESIGN.md §4). T6 adds the
   HookDemo frame, usage section, and API tables on top of this route. */

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
  return { title: hook.name, description: hook.description };
}

export default async function HookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hook = getHook(slug);
  if (!hook) notFound();

  return (
    <article className="flex max-w-3xl flex-col">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-syntax">
        {CATEGORY_LABELS[hook.category]}
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl">{hook.name}</h1>
      <p className="mt-4 leading-relaxed text-gray-body">{hook.description}</p>

      <h2 className="mt-12 text-2xl">Signature</h2>
      <CodeBlock
        code={hook.signature}
        lang="ts"
        title={`${hook.name}.d.ts`}
        className="mt-4"
      />

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
    </article>
  );
}
