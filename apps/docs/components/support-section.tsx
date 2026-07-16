import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { ArrowRightIcon, GitHubSponsorsIcon, GitPullRequestIcon, StarIcon } from "@/components/icons";
import { GITHUB_URL, SPONSOR_URL } from "@/lib/site";

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
    icon: <GitHubSponsorsIcon className="size-6" />,
    title: "Sponsor",
    body: "Back ongoing maintenance and new hooks through GitHub Sponsors — any amount helps.",
    label: "Become a sponsor",
    href: SPONSOR_URL,
    external: true,
  },
];

export function SupportSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Get involved"
        title="Support hookli"
        subtitle="hookli is free and ISC-licensed. It runs on stars, issues, pull requests, and sponsorships."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => {
          const inner = (
            <>
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
                {card.icon}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-body">{card.body}</p>
              <span className="mt-4 flex min-h-11 items-center gap-2 text-sm text-accent">
                {card.label}
                <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </>
          );
          const className = "surface surface-lift group flex flex-col rounded-xl p-6";
          return card.external ? (
            <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer" className={className}>
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
