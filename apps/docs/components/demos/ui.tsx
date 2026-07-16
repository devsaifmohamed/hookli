"use client";

import { useId } from "react";

/* Shared primitives for docs-page demos (T7+). Same visual language as the
   T6 useToggle demo: ground surface, slate borders, mono labels, 44px targets. */

export function DemoInput({
  label,
  ...props
}: { label: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "className"
>) {
  const id = useId();

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs text-gray-body">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="min-h-11 w-full rounded-md border border-gray-outline bg-ground px-3 font-mono text-sm text-fg transition-colors duration-200 placeholder:text-gray-body focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
    </div>
  );
}

export function DemoButton({
  children,
  ...props
}: { children: React.ReactNode } & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "type"
>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-outline px-4 font-mono text-sm text-gray-body transition-colors duration-200 hover:border-gray-body hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-outline disabled:hover:text-gray-body aria-expanded:border-accent aria-expanded:text-accent aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent"
    >
      {children}
    </button>
  );
}

/* One label/value row; render inside a <dl>. */
export function DemoReadout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-syntax py-2 last:border-b-0">
      <dt className="shrink-0 font-mono text-xs text-gray-body">{label}</dt>
      <dd className="truncate font-mono text-sm text-fg">{children}</dd>
    </div>
  );
}
