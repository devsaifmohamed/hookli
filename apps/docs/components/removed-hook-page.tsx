import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { getHook } from "@/lib/hooks-registry";
import type { RemovedHook } from "@/lib/removed-hooks";

/* The page a removed hook's URL keeps serving: when it went, and what to use instead. */
export function RemovedHookPage({ hook }: { hook: RemovedHook }) {
  const replacement = hook.replacement ? getHook(hook.replacement) : undefined;

  return (
    <article className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-body">
        {hook.removedIn ? `Removed in v${hook.removedIn}` : "Removed (next release)"}
      </p>
      <h1 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{hook.name}</h1>
      <p className="mt-4 text-base leading-relaxed text-gray-body sm:text-lg">
        {hook.name} is no longer part of hookli.
        {hook.note ? ` ${hook.note}` : ""}
      </p>
      {replacement && (
        <Link
          href={`/docs/${replacement.slug}`}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-ground transition-opacity duration-200 hover:opacity-90"
        >
          Use {replacement.name} instead
          <ArrowRightIcon className="size-4 text-ground" />
        </Link>
      )}
    </article>
  );
}
