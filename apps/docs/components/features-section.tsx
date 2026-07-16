import { FeatureCard } from "@/components/feature-card";
import { SectionHeading } from "@/components/section-heading";
import { BlocksIcon, BracesIcon, FeatherIcon, LeafIcon, PackageIcon, ServerIcon } from "@/components/icons";
import { HOOKS } from "@/lib/hooks-registry";

const FEATURES = [
  {
    icon: <FeatherIcon className="size-6" />,
    title: "Zero dependencies",
    body: "The only thing you install is the hooks. No runtime deps, no transitive surprises, nothing to audit twice.",
  },
  {
    icon: <BracesIcon className="size-6" />,
    title: "TypeScript-first",
    body: "Written in TypeScript, shipped with full definitions. Generics and inference just work — no @types hunt.",
  },
  {
    icon: <ServerIcon className="size-6" />,
    title: "SSR-safe",
    body: "Browser APIs are guarded behind effects, so Next.js and friends prerender without a single window crash.",
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
    body: "State, storage, DOM, and data — the hooks you rewrite in every project, done once and typed.",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Why hookli"
        title="The hooks you keep rewriting"
        subtitle="Small enough to read in an afternoon, solid enough to ship everywhere."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
