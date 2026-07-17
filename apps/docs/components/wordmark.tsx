const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl sm:text-5xl",
  xl: "text-5xl sm:text-6xl md:text-7xl",
} as const;

/* Brand v4 lockup — lowercase name in the brand sans, React-cyan full stop.
   Matches public/hookli-banner.svg; the old use(hookli) mono mark is retired. */
export function Wordmark({
  size = "md",
  className = "",
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={`whitespace-nowrap font-sans font-semibold tracking-tight text-fg ${sizeClasses[size]} ${className}`}
    >
      hookli
      <span className="text-accent">.</span>
    </span>
  );
}

/* The brand mark from public/hookli-icon.svg without the tile: a hook cradling
   a state dot. Size it via className (height + w-auto); colors come from tokens. */
export function HookMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-13 -3 110 140"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M84 10 V82 A42 42 0 1 1 0 82 V58"
        stroke="var(--color-accent)"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <circle cx="42" cy="82" r="15" fill="var(--color-fg)" />
    </svg>
  );
}
