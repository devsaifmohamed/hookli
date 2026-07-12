export type ApiRow = {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
};

/* Parameters / Returns tables on hook pages (docs/DESIGN.md §4). Parameters
   pass `withDefault`; Returns omit it. Horizontal scroll keeps 375px clean. */
export function ApiTable({
  rows,
  withDefault = false,
  className = "",
}: {
  rows: readonly ApiRow[];
  withDefault?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-syntax/40 bg-ground-raised ${className}`}
    >
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-syntax/40">
            <th scope="col" className="px-4 py-3 text-xs text-gray-body">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-xs text-gray-body">
              Type
            </th>
            {withDefault && (
              <th scope="col" className="px-4 py-3 text-xs text-gray-body">
                Default
              </th>
            )}
            <th scope="col" className="px-4 py-3 text-xs text-gray-body">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-b border-slate-syntax/40 align-top last:border-b-0"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-accent">
                {row.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-body">
                {row.type}
              </td>
              {withDefault && (
                <td className="whitespace-nowrap px-4 py-3">
                  {row.defaultValue ? (
                    <span className="inline-block rounded border border-slate-syntax/50 bg-ground px-2 py-0.5 font-mono text-xs text-accent">
                      {row.defaultValue}
                    </span>
                  ) : (
                    <span className="font-mono text-gray-body">—</span>
                  )}
                </td>
              )}
              <td className="min-w-48 px-4 py-3 text-gray-body">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
