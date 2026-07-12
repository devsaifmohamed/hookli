import { Fragment, type ReactNode } from "react";
import { ExternalLinkIcon } from "@/components/Icons";

/* Web-API mentions inside hook descriptions become linked MDN chips (T16
   usehooks-ts anatomy). Curated term → MDN map; matching is case-insensitive
   and word-bounded so "fetch" links but "useFetch"/"fetchData" don't. */
const WEB_APIS: Record<string, string> = {
  localstorage:
    "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
  geolocation:
    "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API",
  fetch: "https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch",
  scroll:
    "https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event",
  mousedown:
    "https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event",
  mousemove:
    "https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event",
};

/* Longest terms first so multi-word/compound names win over their substrings. */
const TERM_PATTERN = new RegExp(
  `\\b(${Object.keys(WEB_APIS)
    .sort((a, b) => b.length - a.length)
    .join("|")})\\b`,
  "gi",
);

function ApiChip({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 whitespace-nowrap rounded border border-accent/40 bg-accent/10 px-1.5 align-baseline text-[0.92em] font-medium text-accent transition-colors duration-200 hover:bg-accent/20"
    >
      {label}
      <ExternalLinkIcon className="size-3 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (MDN, opens in a new tab)</span>
    </a>
  );
}

/* Returns the text with recognised Web-API terms replaced by MDN chips. */
export function linkifyWebApis(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(TERM_PATTERN)) {
    const term = match[0];
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const href = WEB_APIS[term.toLowerCase()];
    parts.push(<ApiChip key={key++} label={term} href={href} />);
    last = start + term.length;
  }

  if (last < text.length) parts.push(text.slice(last));

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  );
}
