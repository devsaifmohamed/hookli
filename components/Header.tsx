import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { GitHubIcon } from "./Icons";
import { GITHUB_URL } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-syntax/40 bg-ground/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="hookli — home"
          className="flex min-h-11 items-center rounded-md"
        >
          <Wordmark size="sm" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link
            href="/docs"
            className="flex min-h-11 items-center rounded-md px-3 font-mono text-sm text-gray-body transition-colors duration-200 hover:text-fg"
          >
            Docs
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="hookli on GitHub"
            className="flex size-11 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:text-fg"
          >
            <GitHubIcon className="size-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
