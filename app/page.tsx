import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { ArrowRightIcon, GitHubIcon } from "@/components/Icons";
import { GITHUB_URL, TAGLINE } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h1>
        <Wordmark size="lg" />
      </h1>
      <p className="mt-6 max-w-md text-lg text-gray-body">{TAGLINE}</p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
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
    </main>
  );
}
