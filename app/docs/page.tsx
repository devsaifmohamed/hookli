import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { HookCard } from "@/components/HookCard";
import { InstallCommand } from "@/components/InstallCommand";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  HOOKS,
  hooksByCategory,
} from "@/lib/hooks-registry";
import { TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Docs",
  description: `${TAGLINE} Documentation for all ${HOOKS.length} hooks.`,
  openGraph: {
    title: "Docs",
    description: `${TAGLINE} Documentation for all ${HOOKS.length} hooks.`,
    url: "/docs",
  },
};

const QUICK_EXAMPLE = `
import { useToggle } from "hookli";

function Details() {
  const [open, toggle] = useToggle(false);

  return (
    <section>
      <button onClick={toggle}>{open ? "Hide" : "Show"} details</button>
      {open && <p>Rendered only while open.</p>}
    </section>
  );
}
`;

export default function DocsIndexPage() {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl sm:text-4xl">Documentation</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-gray-body">
        hookli is {HOOKS.length} React hooks for the state, DOM, and data
        chores every app repeats — typed end to end, SSR-safe, and free of
        dependencies. Every hook on this site runs live on its page, so you
        can try it before you install it.
      </p>

      <h2 className="mt-12 text-2xl">Install</h2>
      <InstallCommand className="mt-4 w-fit" />

      <h2 className="mt-12 text-2xl">Quick example</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-gray-body">
        Import a hook and use it — no providers, no setup.
      </p>
      <CodeBlock
        code={QUICK_EXAMPLE}
        title="details.tsx"
        className="mt-4 max-w-2xl"
      />

      <h2 className="mt-12 text-2xl">Hooks</h2>
      {CATEGORY_ORDER.map((category) => (
        <section key={category} className="mt-8" aria-label={CATEGORY_LABELS[category]}>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-syntax">
            {CATEGORY_LABELS[category]}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {hooksByCategory(category).map((hook) => (
              <HookCard key={hook.slug} hook={hook} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
