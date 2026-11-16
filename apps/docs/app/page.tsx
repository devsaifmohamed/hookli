import Link from "next/link";
import { HookMark, Wordmark } from "@/components/wordmark";
import { DualInstallWidget } from "@/components/dual-install-widget";
import { HeroAgentPreview } from "@/components/hero-agent-preview";
import { ArrowRightIcon, GitHubIcon } from "@/components/icons";
import { ComparisonSection } from "@/components/comparison-section";
import { FeaturesSection } from "@/components/features-section";
import { LiveProofSection } from "@/components/live-proof-section";
import { AiSection } from "@/components/ai-section";
import { HooksIndexSection } from "@/components/hooks-index-section";
import { SupportSection } from "@/components/support-section";
import { BottomCtaSection } from "@/components/bottom-cta-section";
import { HOOKS } from "@/lib/hooks-registry";
import { GITHUB_URL, TAGLINE, TAGLINE_SHORT } from "@/lib/site";

const HERO_FACTS = [
  `${HOOKS.length} typed hooks`,
  "Zero dependencies",
  "SSR-safe",
  "ESM + CJS",
  "MCP-native",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-slate-syntax">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-grid" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-glow" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <Link
            href="/docs/mcp"
            className="reveal group mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/[0.12] px-4 py-1.5 text-xs font-semibold text-accent transition-all duration-300 hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(97,218,251,0.2)] hover:scale-[1.02]"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span>NEW — MCP Server for AI Agents</span>
            <ArrowRightIcon className="size-3 text-accent transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <p className="reveal reveal-d1 inline-flex items-center gap-2 rounded-full border border-slate-syntax bg-ground-raised/60 px-3 py-1 text-xs font-medium text-gray-body backdrop-blur">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {TAGLINE_SHORT}
          </p>
          <h1 className="reveal reveal-d1 mt-8 flex flex-col items-center gap-6">
            <HookMark className="h-16 w-auto sm:h-20" />
            <Wordmark size="xl" />
          </h1>
          <p className="reveal reveal-d2 mt-6 w-full max-w-md text-lg text-gray-body">{TAGLINE}</p>
          <DualInstallWidget className="reveal reveal-d3 mt-9" />
          <div className="reveal reveal-d3 mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/docs"
              className="flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-ground shadow-lg shadow-accent/20 transition-[opacity,box-shadow] duration-200 ease-out hover:opacity-90 hover:shadow-accent/30"
            >
              Explore the docs
              <ArrowRightIcon className="size-4 text-ground" />
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

          {/* Live Agent IDE Simulation Card */}
          <HeroAgentPreview className="reveal reveal-d4 mt-12 w-full max-w-2xl" />
          <ul className="reveal reveal-d4 mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-body">
            {HERO_FACTS.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1 rounded-full bg-gray-body/40" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FeaturesSection />
      <ComparisonSection />
      <LiveProofSection />
      <AiSection />
      <HooksIndexSection />
      <SupportSection />
      <BottomCtaSection />
    </main>
  );
}
