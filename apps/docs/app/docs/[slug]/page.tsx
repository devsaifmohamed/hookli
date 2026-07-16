import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HookPage } from "@/components/hook-page";
import { HOOKS, getHook } from "@/lib/hooks-registry";

/* Thin route wrapper — all layout lives in the single data-driven HookPage
   template (T16). This file owns only routing concerns (params, static params,
   metadata). Adding a hook needs no changes here. */

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

export default async function HookRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hook = getHook(slug);
  if (!hook) notFound();

  return <HookPage hook={hook} />;
}
