"use client";

import { KofiIcon } from "@/components/icons";
import { KOFI_URL } from "@/lib/site";

/* Persistent floating support CTA (bottom-right, every route — mounted once in
   app/layout.tsx). Collapsed it's a 56px accent circle; on hover/focus it
   expands to reveal the label. A gentle idle bob draws the eye — the global
   prefers-reduced-motion guard (globals.css) neutralises it. Opens Ko-fi in a
   new tab. */
export function DonateButton() {
  return (
    <a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support hookli — buy me a coffee on Ko-fi"
      className="donate-float group fixed bottom-5 right-5 z-50 flex h-14 items-center gap-0 overflow-hidden rounded-full bg-accent pl-4 pr-4 font-semibold text-ground shadow-lg shadow-accent/30 ring-1 ring-inset ring-fg/10 transition-[padding,box-shadow] duration-200 ease-out hover:gap-2.5 hover:pr-5 hover:shadow-xl hover:shadow-accent/40 focus-visible:gap-2.5 focus-visible:pr-5"
    >
      <KofiIcon className="size-6 shrink-0" />
      <span className="max-w-0 whitespace-nowrap text-sm opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100">
        Buy me a coffee
      </span>
    </a>
  );
}
