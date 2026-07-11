import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist. The hooks all do.",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-syntax">
        404 — page not found
      </p>
      <h1 className="mt-4 text-4xl sm:text-5xl">
        <span className="text-slate-syntax">use(</span>
        <span className="text-accent">notFound</span>
        <span className="text-slate-syntax">)</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-gray-body">
        Nothing renders at this URL. The hooks all exist, though — and every
        one runs live in the docs.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/docs"
          className="flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 font-mono text-sm font-semibold text-ground transition-opacity duration-200 hover:opacity-90"
        >
          Browse the docs
          <ArrowRightIcon className="size-4" />
        </Link>
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-md px-5 font-mono text-sm text-gray-body transition-colors duration-200 hover:text-fg"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
