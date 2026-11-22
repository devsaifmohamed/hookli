import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { HookCard } from "@/components/hook-card";
import {
  ArrowRightIcon,
  DatabaseIcon,
  GlobeIcon,
  SlidersIcon,
  SparklesIcon,
  ZapIcon,
} from "@/components/icons";
import { InstallCommand } from "@/components/install-command";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  HOOKS,
  hooksByCategory,
  type HookCategory,
} from "@/lib/hooks-registry";
import { TAGLINE } from "@/lib/site";
import { HOOKLI_VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: "Docs — hookli",
  description: `${TAGLINE} Complete documentation and live interactive demos for all ${HOOKS.length} hooks.`,
  openGraph: {
    title: "Docs — hookli",
    description: `${TAGLINE} Complete documentation and live interactive demos for all ${HOOKS.length} hooks.`,
    url: "/docs",
  },
};

/* Docs-only UI per category. Title and description come from the library's
   catalog/categories.json; a featured name that isn't a hook fails the build. */
const CATEGORY_META: Record<
  HookCategory,
  {
    icon: React.ComponentType<{ className?: string }>;
    featured: string[];
  }
> = {
  state: {
    icon: SlidersIcon,
    featured: ["useToggle", "useCounter", "useForm", "useStep"],
  },
  dom: {
    icon: GlobeIcon,
    featured: ["useClickOutside", "useEventListener", "useIntersectionObserver"],
  },
  effects: {
    icon: ZapIcon,
    featured: ["useDebounce", "useInterval", "useTimeout", "useThrottle"],
  },
  data: {
    icon: DatabaseIcon,
    featured: ["useMutation", "useFetch"],
  },
};

const QUICK_EXAMPLE = `import { useToggle } from "hookli";

function Details() {
  const [open, toggle] = useToggle(false);

  return (
    <section>
      <button onClick={toggle}>{open ? "Hide" : "Show"} details</button>
      {open && <p>Rendered only while open.</p>}
    </section>
  );
}`;

/* Modern Mintlify-style Documentation Index:
   - Clean hero header with quick stats
   - Luminous AI & MCP banner
   - Visual category cards with icon, count, and featured hook tags
   - 3-step quick start guide
   - Complete categorized hook directory */
export default function DocsIndexPage() {
  return (
    <div className="flex flex-col space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-semibold text-accent border border-accent/25">
            <SparklesIcon className="size-3" />
            v{HOOKLI_VERSION}
          </span>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs text-gray-body/70 border border-white/[0.04]">
            {HOOKS.length} typed hooks
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Documentation
        </h1>
        <p className="mt-3 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-body">
          hookli is {HOOKS.length} typed, zero-dependency, SSR-safe React hooks for
          the state, DOM, and data chores every modern React app repeats. Every
          hook runs live in an interactive sandbox.
        </p>
      </div>

      {/* AI Agent Hero Section — Premier High-Visibility Banner */}
      <section
        aria-label="AI Agent Integration"
        className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.10] via-accent/[0.04] to-transparent p-6 sm:p-8 shadow-xl shadow-accent/[0.06]"
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-accent/[0.06] blur-3xl"
        />

        <div className="relative flex flex-col gap-6">
          {/* Top row: badge + status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 font-mono text-xs font-bold text-accent border border-accent/30">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              AI Agent Ready
            </span>
            <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] text-gray-body/70 border border-white/[0.06]">
              Model Context Protocol
            </span>
          </div>

          {/* Headline & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-fg">
              Your AI Agent Already Knows hookli
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-body">
              Connect <strong className="text-fg">Cursor</strong>,{" "}
              <strong className="text-fg">Claude Code (CLI)</strong>, or{" "}
              <strong className="text-fg">Windsurf</strong> directly to hookli&apos;s native MCP
              server. AI queries verified TypeScript AST signatures — zero hallucinations,
              zero copy-paste.
            </p>
          </div>

          {/* Supported IDE Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: "Cursor", badge: "Recommended" },
              { name: "Claude Code", badge: "CLI" },
              { name: "Claude Desktop" },
              { name: "Windsurf" },
            ].map((ide) => (
              <span
                key={ide.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-body"
              >
                <span>{ide.name}</span>
                {ide.badge && (
                  <span className="rounded-full bg-accent/15 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-accent">
                    {ide.badge}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/docs/mcp"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-ground shadow-md shadow-accent/25 transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <SparklesIcon className="size-4 text-ground" />
              <span>Setup MCP Server</span>
              <ArrowRightIcon className="size-3.5 text-ground" />
            </Link>

            {/* 1-click run command */}
            <div className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-3.5 pr-1.5 font-mono text-xs text-gray-body">
              <span className="select-none text-accent font-semibold">$</span>
              <code className="text-fg font-medium">npx -y hookli-mcp</code>
              <CopyButton text="npx -y hookli-mcp" label="Copy MCP command" />
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <a
                href="/llms-full.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 font-mono text-xs text-gray-body transition-colors hover:border-accent/40 hover:bg-white/[0.06] hover:text-white"
              >
                llms-full.txt
              </a>

              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 font-mono text-xs text-gray-body transition-colors hover:border-accent/40 hover:bg-white/[0.06] hover:text-white"
              >
                llms.txt
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer Grid */}
      <section aria-label="Explore categories">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-body/70">
          Explore by Category
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CATEGORY_ORDER.map((category) => {
            const meta = CATEGORY_META[category];
            const info = CATEGORIES.find((c) => c.id === category)!;
            const hooks = hooksByCategory(category);
            const Icon = meta.icon;

            return (
              <div
                key={category}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6 transition-all duration-200 hover:border-accent/40 hover:bg-white/[0.025]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
                        <Icon className="size-4" />
                      </span>
                      <h3 className="font-semibold text-base text-fg">
                        {info.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-gray-body/60 border border-white/[0.04]">
                      {hooks.length} hooks
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-body">
                    {info.description}
                  </p>
                </div>

                {/* Featured Hook Tags */}
                <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.04]">
                  <span className="text-[11px] text-gray-body/50 font-mono">Popular:</span>
                  {meta.featured.map((name) => {
                    const hook = hooks.find((h) => h.name === name);
                    if (!hook) throw new Error(`docs index: featured "${name}" is not a ${category} hook`);
                    return (
                      <Link
                        key={hook.slug}
                        href={`/docs/${hook.slug}`}
                        className="rounded-md bg-white/[0.03] px-2 py-0.5 font-mono text-xs text-gray-body/80 transition-colors hover:bg-accent/15 hover:text-accent border border-white/[0.04]"
                      >
                        {hook.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Step Quick Start */}
      <section aria-label="Quick Start">
        <h2 className="text-xl sm:text-2xl font-semibold text-fg">
          Quick Start
        </h2>
        <p className="mt-1 text-sm text-gray-body">
          Zero configuration, zero providers. Install and call directly in your components.
        </p>

        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          <li className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <div>
              <span className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent border border-accent/25">
                1
              </span>
              <h3 className="mt-3 text-sm font-semibold text-fg">Install</h3>
              <p className="mt-1 text-xs text-gray-body leading-relaxed">
                Add hookli to your project with your preferred package manager.
              </p>
            </div>
            <InstallCommand className="mt-4" />
          </li>

          <li className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <div>
              <span className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent border border-accent/25">
                2
              </span>
              <h3 className="mt-3 text-sm font-semibold text-fg">Import</h3>
              <p className="mt-1 text-xs text-gray-body leading-relaxed">
                Import exactly the hook you need — tree-shakeable ESM and CJS.
              </p>
            </div>
            <code className="mt-4 flex h-10 items-center overflow-x-auto rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 font-mono text-xs text-gray-body">
              <span className="text-accent font-medium">import</span>
              <span className="text-fg font-medium mx-1.5">&#123; useToggle &#125;</span>
              <span className="text-accent font-medium">from</span>
              <span className="text-gray-body/90 ml-1.5">&apos;hookli&apos;;</span>
            </code>
          </li>

          <li className="flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <div>
              <span className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent border border-accent/25">
                3
              </span>
              <h3 className="mt-3 text-sm font-semibold text-fg">Use Anywhere</h3>
              <p className="mt-1 text-xs text-gray-body leading-relaxed">
                Call it inside any React component. Fully SSR-safe for Next.js, Remix, and Vite.
              </p>
            </div>
            <div className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] px-3.5 font-mono text-xs text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Zero client hydration mismatches</span>
            </div>
          </li>
        </ol>
      </section>

      {/* Code Example */}
      <section aria-label="Quick example">
        <h2 className="text-xl sm:text-2xl font-semibold text-fg">
          Component Example
        </h2>
        <p className="mt-1 text-sm text-gray-body">
          Import a hook and use it immediately — no React Context wrappers required.
        </p>
        <CodeBlock
          code={QUICK_EXAMPLE}
          title="details.tsx"
          className="mt-4 max-w-3xl"
        />
      </section>

      {/* Full Hook Directory */}
      <section aria-label="All hooks directory" className="space-y-10">
        <div className="border-t border-white/[0.06] pt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-fg">
            All {HOOKS.length} Hooks
          </h2>
          <p className="mt-1 text-sm text-gray-body">
            Browse hooks by functional domain or search directly with ⌘K.
          </p>
        </div>

        {CATEGORY_ORDER.map((category) => {
          const hooks = hooksByCategory(category);
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;

          return (
            <section key={category} aria-label={CATEGORY_LABELS[category]}>
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
                  {CATEGORY_LABELS[category]}
                </h3>
                <span className="rounded-full bg-white/[0.04] px-2 py-0.2 font-mono text-[11px] text-gray-body/60 border border-white/[0.04]">
                  {hooks.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {hooks.map((hook) => (
                  <HookCard key={hook.slug} hook={hook} />
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}
