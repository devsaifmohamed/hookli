import Link from "next/link";
import { HookMark, Wordmark } from "@/components/wordmark";
import { InstallCommand } from "@/components/install-command";
import { ArrowRightIcon, GitHubIcon } from "@/components/icons";
import { FeaturesSection } from "@/components/features-section";
import { LiveProofSection } from "@/components/live-proof-section";
import { HooksIndexSection } from "@/components/hooks-index-section";
import { SupportSection } from "@/components/support-section";
import { BottomCtaSection } from "@/components/bottom-cta-section";
import { GITHUB_URL, TAGLINE } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <h1 className="flex flex-col items-center gap-8">
          <HookMark className="h-20 w-auto sm:h-24" />
          <Wordmark size="xl" />
        </h1>
        <p className="mt-6 max-w-md text-lg text-gray-body">{TAGLINE}</p>
        <InstallCommand className="mt-10" />
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/docs"
            className="flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-ground transition-opacity duration-200 hover:opacity-90"
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
      </section>
      <FeaturesSection />
      <LiveProofSection />
      <HooksIndexSection />
      <SupportSection />
      <BottomCtaSection />
    </main>
  );
}
