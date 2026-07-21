import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { InstallCommand } from "@/components/install-command";

/* Landing bottom CTA (docs/DESIGN.md §3.6): repeat the install command and
   the docs CTA for readers who scrolled the whole page. */
export function BottomCtaSection() {
  return (
    <section className="border-t border-slate-syntax">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl">Every hook you rewrite — one import away.</h2>
        <p className="mt-3 max-w-md text-gray-body">
          Typed, SSR-safe, zero dependencies. Import what you need and ship.
        </p>
        <InstallCommand className="mt-8" />
        <Link
          href="/docs"
          className="mt-6 flex min-h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-ground transition-opacity duration-200 hover:opacity-90"
        >
          Explore the docs
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
