import { cn } from "./utils";

export default function Table({
  columns = [],
  data = [],
  rowKey = "id",
  emptyText = "No data found.",
  className,
}) {
  const getRowKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row[rowKey] ?? index;
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-md", 
        className
      )}
    >
      <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <table className="w-full min-w-[600px] text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="relative bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 font-bold transition-colors first:pl-8 last:pr-8", 
                    column.headerClassName
                  )}
                >
                  <span className="flex items-center gap-2">
                    {column.header}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="group relative transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-indigo-500/[0.03]"
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={cn(
                        "px-6 py-4 transition-colors first:pl-8 last:pr-8 group-hover:text-slate-900 dark:group-hover:text-white", 
                        column.className
                      )}
                    >
                      <div className="relative z-10">
                        {column.render ? column.render(row, index) : row[column.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  className="px-6 py-20 text-center" 
                  colSpan={columns.length || 1}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800/50">
                      <span className="text-xl opacity-20">📂</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                      {emptyText}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Visual fade-out effect for horizontal scroll on mobile */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent opacity-0 dark:from-slate-900 lg:hidden" />
    </div>
  );
}