import Link from "next/link";
import type { HookEntry } from "@/lib/hooks-registry";

export function HookCard({ hook }: { hook: HookEntry }) {
  return (
    <Link
      href={`/docs/${hook.slug}`}
      className="surface surface-lift group flex flex-col gap-1 rounded-xl p-4"
    >
      <span className="text-sm font-semibold transition-colors duration-200 group-hover:text-accent-hover">
        {hook.name}
      </span>
      <span className="text-sm leading-relaxed text-gray-body">
        {hook.description}
      </span>
    </Link>
  );
}
