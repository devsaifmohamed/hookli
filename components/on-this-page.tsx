"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

/* Right-rail "On this page" nav for hook pages (T16 usehooks-ts anatomy).
   Scroll-spy via IntersectionObserver highlights the section nearest the top;
   the rail itself is hidden below xl (the template only renders it there). */
export function OnThisPage({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-syntax">On this page</p>
      <ul className="mt-3 flex flex-col border-l border-slate-syntax/40">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1 pl-4 text-sm transition-colors duration-200 ${active === item.id ? "border-accent text-fg" : "border-transparent text-gray-body hover:text-fg"}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
