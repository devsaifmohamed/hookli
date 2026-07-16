import Link from "next/link";
import { Wordmark } from "./wordmark";
import { GITHUB_URL, NPM_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-syntax/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="hookli — home" className="w-fit rounded-md">
            <Wordmark size="sm" />
          </Link>
          <code className="w-fit rounded-md border border-slate-syntax/40 bg-ground-raised px-3 py-1.5 text-sm text-gray-body">
            npm i <span className="text-accent">hookli</span>
          </code>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
        >
          <a
            href={NPM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center rounded-md px-2 text-gray-body transition-colors duration-200 hover:text-fg"
          >
            npm
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center rounded-md px-2 text-gray-body transition-colors duration-200 hover:text-fg"
          >
            GitHub
          </a>
          <Link
            href="/support"
            className="flex min-h-11 items-center rounded-md px-2 text-gray-body transition-colors duration-200 hover:text-fg"
          >
            Support
          </Link>
          <span className="flex min-h-11 items-center px-2 text-gray-body">
            ISC License
          </span>
        </nav>
      </div>
    </footer>
  );
}
