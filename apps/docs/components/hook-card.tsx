import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { CATEGORY_LABELS, type HookEntry } from "@/lib/hooks-registry";

/* Modern Mintlify-style card for hook discovery:
   - Elevated border with subtle purple hover glow
   - Smooth transform on hover
   - Category pill and arrow indicator */
export function HookCard({ hook }: { hook: HookEntry }) {
  return (
    <Link
      href={`/docs/${hook.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 transition-all duration-200 hover:border-accent/40 hover:bg-accent/[0.03] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-fg transition-colors duration-150 group-hover:text-accent">
            {hook.name}
          </span>
          <span className="rounded-full bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-medium text-gray-body/60 border border-white/[0.04]">
            {CATEGORY_LABELS[hook.category]}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-gray-body/90">
          {hook.description}
        </p>
      </div>

      <div className="mt-3.5 flex items-center gap-1 text-xs font-medium text-accent/80 opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:text-accent">
        <span>View hook</span>
        <ArrowRightIcon className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
