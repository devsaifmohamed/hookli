"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  hooksByCategory,
} from "@/lib/hooks-registry";

/* Docs sidebar (docs/DESIGN.md §2, §5): sticky under the h-14 header, grouped
   by category, active state from the pathname. Hidden below md — the /docs
   index cards navigate on mobile until the T14 drawer lands. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-syntax/40 md:block">
      <nav
        aria-label="Docs"
        className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-6"
      >
        <SidebarLink href="/docs" active={pathname === "/docs"}>
          Overview
        </SidebarLink>
        {CATEGORY_ORDER.map((category) => (
          <div key={category} className="mt-6">
            <h3 className="px-3 font-mono text-xs font-semibold uppercase tracking-wider text-slate-syntax">
              {CATEGORY_LABELS[category]}
            </h3>
            <ul className="mt-2 flex flex-col gap-0.5">
              {hooksByCategory(category).map((hook) => {
                const href = `/docs/${hook.slug}`;
                return (
                  <li key={hook.slug}>
                    <SidebarLink href={href} active={pathname === href}>
                      {hook.name}
                    </SidebarLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-9 items-center rounded-md px-3 font-mono text-sm transition-colors duration-200 ${
        active
          ? "bg-ground-raised text-accent"
          : "text-gray-body hover:bg-ground-raised/60 hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}
