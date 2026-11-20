import Link from "next/link";
import { HookMark, Wordmark } from "./wordmark";
import { GitHubIcon } from "./icons";
import { SearchPalette } from "./search-palette";
import { GITHUB_URL, HOOKLI_VERSION } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ground/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: logo + primary nav */}
        <nav aria-label="Main" className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            aria-label="hookli — home"
            className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90"
          >
            <HookMark className="h-5 w-auto" />
            <Wordmark size="sm" />
            <span className="hidden sm:inline-flex rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent border border-accent/25">
              v{HOOKLI_VERSION}
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/docs"
              className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs sm:text-sm font-medium text-gray-body transition-colors duration-150 hover:bg-white/[0.05] hover:text-fg"
            >
              Docs
            </Link>
            <Link
              href="/docs/mcp"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs sm:text-sm font-medium text-fg transition-colors duration-150 hover:bg-accent/10 hover:text-accent"
            >
              <span className="font-semibold">MCP Server</span>
              <span className="nav-new-chip relative rounded-full bg-accent/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-accent border border-accent/30">
                ⚡ NEW
              </span>
            </Link>
            <Link
              href="/support"
              className="hidden md:inline-flex h-8 items-center rounded-lg px-2.5 text-xs sm:text-sm font-medium text-gray-body transition-colors duration-150 hover:bg-white/[0.05] hover:text-fg"
            >
              Support
            </Link>
          </div>
        </nav>

        {/* Right: search + GitHub */}
        <div className="flex items-center gap-2">
          <SearchPalette />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="hookli on GitHub"
            className="flex size-9 items-center justify-center rounded-lg text-gray-body transition-colors duration-150 hover:bg-white/[0.05] hover:text-fg"
          >
            <GitHubIcon className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
