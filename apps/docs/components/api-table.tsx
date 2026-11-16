export type ApiRow = {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
};

/* Modern Mintlify-style property list for Parameters, Returns, and Type Aliases.
   Replaces rigid spreadsheet tables with clean, responsive definition cards
   that never require horizontal scrolling on mobile. */
export function ApiTable({
  rows,
  withDefault = false,
  className = "",
}: {
  rows: readonly ApiRow[];
  withDefault?: boolean;
  className?: string;
}) {
  if (rows.length === 0) return null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] divide-y divide-white/[0.04] ${className}`}
    >
      {rows.map((row) => (
        <div key={row.name} className="p-4 sm:p-5 transition-colors hover:bg-white/[0.01]">
          {/* Top row: Name + Type Badge + Default Badge */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-sm font-semibold text-accent">
              {row.name}
            </span>

            <span className="inline-flex items-center rounded-md bg-accent/[0.08] px-2 py-0.5 font-mono text-xs text-accent-hover border border-accent/15">
              {row.type}
            </span>

            {withDefault && row.defaultValue && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.03] px-2 py-0.5 font-mono text-xs text-gray-body/80 border border-white/[0.06]">
                <span className="text-[10px] uppercase tracking-wider text-gray-body/50">default:</span>
                <span className="text-white">{row.defaultValue}</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-gray-body">
            {row.description}
          </p>
        </div>
      ))}
    </div>
  );
}
