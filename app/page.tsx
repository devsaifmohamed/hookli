import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { InstallCommand } from "@/components/InstallCommand";
import { ArrowRightIcon, GitHubIcon } from "@/components/Icons";
import { FeaturesSection } from "@/components/FeaturesSection";
import { LiveProofSection } from "@/components/LiveProofSection";
import { HooksIndexSection } from "@/components/HooksIndexSection";
import { SupportSection } from "@/components/SupportSection";
import { BottomCtaSection } from "@/components/BottomCtaSection";
import { GITHUB_URL, TAGLINE } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <h1 className="flex items-center">
          <Wordmark size="xl" />
          <span
            aria-hidden="true"
            className="animate-cursor-blink ml-1 inline-block h-[0.8em] w-[0.5ch] bg-accent sm:ml-2"
          />
        </h1>
        <p className="mt-6 max-w-md text-lg text-gray-body">{TAGLINE}</p>
        <InstallCommand className="mt-10" />
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 font-mono text-sm font-semibold text-ground transition-opacity duration-200 hover:opacity-90"
          >
            Explore the docs
            <ArrowRightIcon className="size-4" />
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-md px-5 font-mono text-sm text-gray-body transition-colors duration-200 hover:text-fg"
          >
            <GitHubIcon className="size-4" />
            Star on GitHub
          </a>
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
