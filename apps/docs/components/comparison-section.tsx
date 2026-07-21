import { CheckIcon, XIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";

type ComparisonRow = {
  feature: string;
  hookli: string;
  others: string;
  hookliWins: boolean;
};

const ROWS: ComparisonRow[] = [
  {
    feature: "Runtime dependencies",
    hookli: "Zero — React is the only peer",
    others: "Often lodash, debounce helpers, or other utility packages",
    hookliWins: true,
  },
  {
    feature: "SSR safety",
    hookli: "Required by convention — every hook guards browser APIs",
    others: "Varies hook by hook; easy to break Next.js prerender",
    hookliWins: true,
  },
  {
    feature: "Documentation",
    hookli: "Live demos import the published npm package",
    others: "Often README-only, or docs that drift from the code",
    hookliWins: true,
  },
  {
    feature: "Hook list accuracy",
    hookli: "Manifest drives README, docs, and hook count",
    others: "Hand-maintained lists that fall out of sync",
    hookliWins: true,
  },
  {
    feature: "Test coverage",
    hookli: "Every hook has a colocated vitest test",
    others: "Inconsistent — some hooks tested, many aren't",
    hookliWins: true,
  },
  {
    feature: "Bundle cost",
    hookli: "Tree-shakable — import one hook, ship one hook",
    others: "Shared util layers can pull in more than you use",
    hookliWins: true,
  },
];

function StatusIcon({ wins }: { wins: boolean }) {
  return wins ? (
    <CheckIcon className="size-4 shrink-0 text-accent" />
  ) : (
    <XIcon className="size-4 shrink-0 text-gray-body/60" />
  );
}

export function ComparisonSection() {
  return (
    <section className="border-y border-slate-syntax bg-ground-raised/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Why hookli"
          title="The hooks you keep rewriting — done once"
          subtitle={
            <>
              Closest peers like{" "}
              <a
                href="https://usehooks-ts.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent transition-colors hover:text-accent-hover"
              >
                usehooks-ts
              </a>{" "}
              cover similar ground. hookli pushes harder on zero deps, SSR safety, and docs that
              never drift from the package you install.
            </>
          }
        />

        <div className="mt-12 overflow-hidden rounded-xl border border-slate-syntax">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr] border-b border-slate-syntax bg-ground-raised sm:grid">
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-body">
              What you get
            </div>
            <div className="border-l border-divider px-5 py-4 text-xs font-semibold uppercase tracking-wider text-accent">
              hookli
            </div>
            <div className="border-l border-divider px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-body">
              Many hook libraries
            </div>
          </div>

          <ul className="divide-y divide-divider">
            {ROWS.map((row) => (
              <li key={row.feature} className="grid sm:grid-cols-[1.2fr_1fr_1fr]">
                <div className="border-b border-divider px-5 py-4 sm:border-b-0">
                  <p className="text-sm font-medium text-fg">{row.feature}</p>
                </div>
                <div className="flex gap-3 border-b border-divider bg-accent/5 px-5 py-4 sm:border-b-0 sm:border-l sm:border-divider">
                  <StatusIcon wins={row.hookliWins} />
                  <p className="text-sm leading-relaxed text-gray-body">
                    <span className="mr-2 font-medium text-accent sm:hidden">hookli:</span>
                    {row.hookli}
                  </p>
                </div>
                <div className="flex gap-3 px-5 py-4 sm:border-l sm:border-divider">
                  <StatusIcon wins={false} />
                  <p className="text-sm leading-relaxed text-gray-body">
                    <span className="mr-2 font-medium text-gray-body sm:hidden">Others:</span>
                    {row.others}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-gray-body">
          Not trying to be TanStack Query or a kitchen-sink toolkit — just the typed, SSR-safe hooks
          you copy-paste in every project, packaged so you never copy-paste them again.
        </p>
      </div>
    </section>
  );
}
