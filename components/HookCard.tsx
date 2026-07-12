import Link from "next/link";
import type { HookEntry } from "@/lib/hooks-registry";

export function HookCard({ hook }: { hook: HookEntry }) {
  return (
    <Link
      href={`/docs/${hook.slug}`}
      className="group flex flex-col gap-1 rounded-xl border border-slate-syntax/40 bg-ground-raised p-4 transition-colors duration-200 hover:border-accent/60"
    >
      <span className="text-sm font-semibold transition-colors duration-200 group-hover:text-accent">
        {hook.name}
      </span>
      <span className="text-sm leading-relaxed text-gray-body">
        {hook.description}
      </span>
    </Link>
  );
}
