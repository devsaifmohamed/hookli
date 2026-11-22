import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HookPage } from "@/components/hook-page";
import { RemovedHookPage } from "@/components/removed-hook-page";
import { HOOKS, getHook } from "@/lib/hooks-registry";
import { REMOVED_HOOKS, getRemovedHook } from "@/lib/removed-hooks";

/* Thin route wrapper — all layout lives in the single data-driven HookPage
   template (T16). This file owns only routing concerns (params, static params,
   metadata). Adding a hook needs no changes here; a removed hook keeps its URL
   with a "Removed" page. */

export function generateStaticParams() {
  return [...HOOKS, ...REMOVED_HOOKS].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hook = getHook(slug);
  const removed = hook ? undefined : getRemovedHook(slug);
  if (removed) return { title: `${removed.name} (removed)`, robots: { index: false } };
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

export default async function HookRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hook = getHook(slug);
  const removed = hook ? undefined : getRemovedHook(slug);
  if (removed) return <RemovedHookPage hook={removed} />;
  if (!hook) notFound();

  return <HookPage hook={hook} />;
}
