import { FeatureCard } from "@/components/feature-card";
import { SectionHeading } from "@/components/section-heading";
import { BlocksIcon, BracesIcon, FeatherIcon, LeafIcon, PackageIcon, ServerIcon } from "@/components/icons";
import { HOOKS } from "@/lib/hooks-registry";

const FEATURES = [
  {
    icon: <FeatherIcon className="size-6" />,
    title: "Zero dependencies",
    body: "No lodash, no debounce utils, no transitive surprises — React is the only thing you install besides the hooks.",
  },
  {
    icon: <BracesIcon className="size-6" />,
    title: "TypeScript-first",
    body: "Written in TypeScript, shipped with full definitions. Generics and inference just work — no @types hunt.",
  },
  {
    icon: <ServerIcon className="size-6" />,
    title: "SSR-safe",
    body: "Browser APIs stay behind effects by convention — Next.js and Remix prerender without a single window crash.",
  },
  {
    icon: <LeafIcon className="size-6" />,
    title: "Tree-shakable",
    body: "Import one hook, ship one hook. Bundlers drop everything you don't use.",
  },
  {
    icon: <PackageIcon className="size-6" />,
    title: "ESM + CJS",
    body: "Dual builds out of the box — modern bundlers, legacy tooling, and everything in between.",
  },
  {
    icon: <BlocksIcon className="size-6" />,
    title: `${HOOKS.length} hooks & counting`,
    body: "State, storage, DOM, and light data fetching — the daily-driver set, not a kitchen-sink toolkit.",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Why hookli"
        title="Built for the hooks you copy-paste every project"
        subtitle="Small enough to read in an afternoon. Solid enough to ship in production."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
