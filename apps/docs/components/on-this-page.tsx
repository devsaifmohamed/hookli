"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

/* Modern Mintlify-style "On this page" TOC for the right rail.
   Subtle scroll-spy highlights active section without harsh border lines. */
export function OnThisPage({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-body/60">
        On this page
      </p>
      <ul className="space-y-1.5 text-xs">
        {items.map((item) => {
          const isCurrent = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isCurrent ? "location" : undefined}
                className={`flex items-center gap-2 py-0.5 transition-colors duration-150 ${
                  isCurrent
                    ? "text-accent font-medium"
                    : "text-gray-body/70 hover:text-white"
                }`}
              >
                {isCurrent && (
                  <span
                    className="size-1 rounded-full bg-accent shadow-sm shadow-accent"
                    aria-hidden="true"
                  />
                )}
                <span className={isCurrent ? "" : "pl-3"}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
