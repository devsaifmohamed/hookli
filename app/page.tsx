import Link from "next/link";
import { HookMark, Wordmark } from "@/components/wordmark";
import { InstallCommand } from "@/components/install-command";
import { ArrowRightIcon, GitHubIcon } from "@/components/icons";
import { FeaturesSection } from "@/components/features-section";
import { LiveProofSection } from "@/components/live-proof-section";
import { HooksIndexSection } from "@/components/hooks-index-section";
import { SupportSection } from "@/components/support-section";
import { BottomCtaSection } from "@/components/bottom-cta-section";
import { HOOKS } from "@/lib/hooks-registry";
import { GITHUB_URL, TAGLINE } from "@/lib/site";

const HERO_FACTS = [
  `${HOOKS.length} typed hooks`,
  "Zero dependencies",
  "SSR-safe",
  "ESM + CJS",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-slate-syntax/40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-grid" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-glow" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="reveal inline-flex items-center gap-2 rounded-full border border-slate-syntax/40 bg-ground-raised/60 px-3 py-1 text-xs font-medium text-gray-body backdrop-blur">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            Zero-dependency React hooks
          </p>
          <h1 className="reveal reveal-d1 mt-8 flex flex-col items-center gap-6">
            <HookMark className="h-16 w-auto sm:h-20" />
            <Wordmark size="xl" />
          </h1>
          <p className="reveal reveal-d2 mt-6 w-full max-w-md text-lg text-gray-body">{TAGLINE}</p>
          <InstallCommand className="reveal reveal-d3 mt-9" />
          <div className="reveal reveal-d3 mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/docs"
              className="flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-ground shadow-lg shadow-accent/20 transition-[opacity,box-shadow] duration-200 ease-out hover:opacity-90 hover:shadow-accent/30"
            >
              Explore the docs
              <ArrowRightIcon className="size-4" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 rounded-md px-5 text-sm text-gray-body transition-colors duration-200 hover:text-fg"
            >
              <GitHubIcon className="size-4" />
              Star on GitHub
            </a>
          </div>
          <ul className="reveal reveal-d4 mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-syntax">
            {HERO_FACTS.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1 rounded-full bg-slate-syntax" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FeaturesSection />
      <LiveProofSection />
      <HooksIndexSection />
      <SupportSection />
      <BottomCtaSection />
    </main>
  );
}
