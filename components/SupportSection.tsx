import Link from "next/link";
import {
  ArrowRightIcon,
  GitPullRequestIcon,
  HeartIcon,
  StarIcon,
} from "@/components/Icons";
import { GITHUB_URL } from "@/lib/site";

const CARDS = [
  {
    icon: <StarIcon className="size-6" />,
    title: "Star it",
    body: "The fastest way to help — stars bring the contributors that keep hookli moving.",
    label: "Star on GitHub",
    href: GITHUB_URL,
    external: true,
  },
  {
    icon: <GitPullRequestIcon className="size-6" />,
    title: "Contribute",
    body: "Report a bug, sharpen the docs, or add the hook you keep rewriting anyway.",
    label: "How to contribute",
    href: "/support#contribute",
    external: false,
  },
  {
    icon: <HeartIcon className="size-6" />,
    title: "Sponsor",
    body: "Sponsorships are coming soon. For now, a star and a bug report go a long way.",
    label: "Support hookli",
    href: "/support#sponsor",
    external: false,
  },
];

export function SupportSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <h2 className="text-center text-2xl">Support hookli</h2>
      <p className="mx-auto mt-3 max-w-md text-center text-gray-body">
        hookli is free and ISC-licensed. It runs on stars, issues, and pull
        requests.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => {
          const inner = (
            <>
              <span className="text-accent">{card.icon}</span>
              <h3 className="mt-4 font-mono text-lg font-semibold">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-body">
                {card.body}
              </p>
              <span className="mt-4 flex min-h-11 items-center gap-2 font-mono text-sm text-accent">
                {card.label}
                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </>
          );
          const className =
            "group flex flex-col rounded-xl border border-slate-syntax/40 bg-ground-raised p-6 transition-colors duration-200 hover:border-slate-syntax";
          return card.external ? (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <Link key={card.title} href={card.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
