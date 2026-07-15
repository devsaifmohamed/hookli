import Link from "next/link";
import { HookMark, Wordmark } from "./wordmark";
import { GitHubIcon } from "./icons";
import { SearchPalette } from "./search-palette";
import { GITHUB_URL } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-syntax/40 bg-ground/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: logo + primary nav */}
        <nav aria-label="Main" className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="hookli — home"
            className="flex min-h-11 items-center gap-2 rounded-md"
          >
            <HookMark className="h-5 w-auto" />
            <Wordmark size="sm" />
          </Link>
          <Link
            href="/docs"
            className="flex min-h-11 items-center text-sm text-gray-body transition-colors duration-200 hover:text-fg"
          >
            Docs
          </Link>
        </nav>

        {/* Right: search + GitHub */}
        <div className="flex items-center gap-1">
          <SearchPalette />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="hookli on GitHub"
            className="flex size-11 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:text-fg"
          >
            <GitHubIcon className="size-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
