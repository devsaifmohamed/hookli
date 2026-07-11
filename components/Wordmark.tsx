const sizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-4xl sm:text-5xl",
} as const;

export function Wordmark({
  size = "md",
  className = "",
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={`whitespace-nowrap font-mono font-semibold ${sizeClasses[size]} ${className}`}
    >
      <span className="text-slate-syntax">use(</span>
      <span className="text-accent">hookli</span>
      <span className="text-slate-syntax">)</span>
    </span>
  );
}
