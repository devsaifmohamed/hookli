import type { Metadata } from "next";
import {
  ArrowRightIcon,
  GitHubIcon,
  GitPullRequestIcon,
  HeartIcon,
  StarIcon,
} from "@/components/Icons";
import { GITHUB_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Support hookli — star the repo, contribute a hook, or sponsor the project (coming soon).",
};

const CONTRIBUTE_WAYS = [
  {
    title: "Report a bug",
    body: "Found a hook misbehaving? A minimal repro in an issue is the most valuable thing you can send.",
    label: "Open an issue",
    href: `${GITHUB_URL}/issues`,
  },
  {
    title: "Improve the docs",
    body: "Typos, unclear copy, a demo that could prove more — small docs PRs are the friendliest way in.",
    label: "Browse pull requests",
    href: `${GITHUB_URL}/pulls`,
  },
  {
    title: "Add a hook",
    body: "Propose the hook you keep rewriting in every project. Open an issue first so we can agree on the API before you build.",
    label: "Start a proposal",
    href: `${GITHUB_URL}/issues`,
  },
];

export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-3xl sm:text-4xl">Support hookli</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-gray-body">
        hookli is free, open source, and ISC-licensed — built and maintained in
        the open. If it saved you from rewriting another debounce hook, here
        are three ways to give back.
      </p>

      <section
        id="star"
        aria-labelledby="star-heading"
        className="mt-12 scroll-mt-20 rounded-xl border border-slate-syntax/40 bg-ground-raised p-6 sm:p-8"
      >
        <span className="text-accent">
          <StarIcon className="size-6" />
        </span>
        <h2 id="star-heading" className="mt-4 text-xl">
          Star the repo
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-body">
          Free, takes two seconds, and genuinely matters: stars are how the
          next contributor finds the project.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex min-h-11 w-fit items-center gap-2 rounded-md bg-accent px-5 font-mono text-sm font-semibold text-ground transition-opacity duration-200 hover:opacity-90"
        >
          <GitHubIcon className="size-4" />
          Star on GitHub
        </a>
      </section>

      <section
        id="contribute"
        aria-labelledby="contribute-heading"
        className="mt-8 scroll-mt-20 rounded-xl border border-slate-syntax/40 bg-ground-raised p-6 sm:p-8"
      >
        <span className="text-accent">
          <GitPullRequestIcon className="size-6" />
        </span>
        <h2 id="contribute-heading" className="mt-4 text-xl">
          Contribute
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-body">
          Every hook ships typed, SSR-safe, and dependency-free — contributions
          are held to the same bar, and reviewed quickly.
        </p>
        <ul className="mt-6 flex flex-col gap-5">
          {CONTRIBUTE_WAYS.map((way) => (
            <li key={way.title}>
              <h3 className="font-mono text-base font-semibold">{way.title}</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-body">
                {way.body}
              </p>
              <a
                href={way.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex min-h-11 w-fit items-center gap-2 font-mono text-sm text-accent transition-opacity duration-200 hover:opacity-80"
              >
                {way.label}
                <ArrowRightIcon className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="sponsor"
        aria-labelledby="sponsor-heading"
        className="mt-8 scroll-mt-20 rounded-xl border border-slate-syntax/40 bg-ground-raised p-6 sm:p-8"
      >
        <span className="text-accent">
          <HeartIcon className="size-6" />
        </span>
        <h2 id="sponsor-heading" className="mt-4 text-xl">
          Sponsor
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-body">
          Sponsorships aren&apos;t set up yet. When they are, the links below
          go live — until then they lead nowhere, on purpose.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {/* TODO: replace '#' with the real GitHub Sponsors URL once the account exists. */}
          <a
            href="#"
            aria-disabled="true"
            className="flex min-h-11 items-center gap-2 rounded-md border border-slate-syntax/40 px-5 font-mono text-sm text-gray-body"
          >
            GitHub Sponsors
            <span className="rounded-full border border-slate-syntax/40 px-2 py-0.5 text-xs">
              coming soon
            </span>
          </a>
          {/* TODO: replace '#' with the real Ko-fi URL once the account exists. */}
          <a
            href="#"
            aria-disabled="true"
            className="flex min-h-11 items-center gap-2 rounded-md border border-slate-syntax/40 px-5 font-mono text-sm text-gray-body"
          >
            Ko-fi
            <span className="rounded-full border border-slate-syntax/40 px-2 py-0.5 text-xs">
              coming soon
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}
