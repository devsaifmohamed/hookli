import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { HookCard } from "@/components/hook-card";
import { InstallCommand } from "@/components/install-command";
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

      <h2 className="mt-12 text-2xl">Quick start</h2>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        <li className="surface flex flex-col rounded-xl p-5">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent ring-1 ring-inset ring-accent">1</span>
          <h3 className="mt-4 text-base font-semibold">Install</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-body">Add hookli to your React app.</p>
          <InstallCommand className="mt-3" />
        </li>
        <li className="surface flex flex-col rounded-xl p-5">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent ring-1 ring-inset ring-accent">2</span>
          <h3 className="mt-4 text-base font-semibold">Import</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-body">Pull in exactly the hook you need.</p>
          <code className="mt-3 block overflow-x-auto rounded-lg border border-slate-syntax bg-ground px-3 py-2 font-mono text-xs">
            <span className="text-accent">import</span> {"{ useToggle }"} <span className="text-accent">from</span> <span className="text-gray-body">&quot;hookli&quot;</span>
          </code>
        </li>
        <li className="surface flex flex-col rounded-xl p-5">
          <span className="flex size-7 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent ring-1 ring-inset ring-accent">3</span>
          <h3 className="mt-4 text-base font-semibold">Use it</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-body">Call it in a component — no providers, no config.</p>
        </li>
      </ol>

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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-body">
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
