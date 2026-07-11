import { HookCard } from "@/components/HookCard";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  HOOKS,
  hooksByCategory,
} from "@/lib/hooks-registry";

/* Landing hooks-index strip (docs/DESIGN.md §3.4): every hook as a compact
   linked card, grouped by category — same HookCard as the /docs index. */
export function HooksIndexSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-2xl">All {HOOKS.length} hooks</h2>
      <p className="mx-auto mt-3 max-w-md text-center text-gray-body">
        Each one documented with a live demo — try it before you install it.
      </p>
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="mt-10">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-syntax">
            {CATEGORY_LABELS[category]}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hooksByCategory(category).map((hook) => (
              <HookCard key={hook.slug} hook={hook} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
