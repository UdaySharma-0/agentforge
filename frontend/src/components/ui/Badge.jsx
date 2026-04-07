import { cn } from "./utils";

const variantClasses = {
  // Dark: Glassy & Recessed | Light: Soft & Clean
  default: `
    bg-slate-500/10 text-slate-600 border-slate-500/20 
    dark:text-slate-300 dark:border-slate-500/30 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]
  `,
  primary: `
    bg-indigo-500/10 text-indigo-600 border-indigo-500/20 
    dark:text-indigo-400 dark:border-indigo-500/40 dark:shadow-[0_0_12px_-4px_rgba(99,102,241,0.5)]
  `,
  success: `
    bg-emerald-500/10 text-emerald-700 border-emerald-500/20 
    dark:text-emerald-400 dark:border-emerald-500/40 dark:shadow-[0_0_12px_-4px_rgba(16,185,129,0.5)]
  `,
  warning: `
    bg-amber-500/10 text-amber-700 border-amber-500/20 
    dark:text-amber-400 dark:border-amber-500/40 dark:shadow-[0_0_12px_-4px_rgba(245,158,11,0.5)]
  `,
  danger: `
    bg-rose-500/10 text-rose-700 border-rose-500/20 
    dark:text-rose-400 dark:border-rose-500/40 dark:shadow-[0_0_12px_-4px_rgba(244,63,94,0.5)]
  `,
  info: `
    bg-sky-500/10 text-sky-700 border-sky-500/20 
    dark:text-sky-400 dark:border-sky-500/40 dark:shadow-[0_0_12px_-4px_rgba(14,165,233,0.5)]
  `,
};

const dotClasses = {
  default: "bg-slate-500 dark:bg-slate-400",
  primary: "bg-indigo-500 dark:bg-indigo-400 animate-pulse",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-400",
  danger: "bg-rose-500 dark:bg-rose-400",
  info: "bg-sky-500 dark:bg-sky-400",
};

export default function Badge({ 
  children, 
  variant = "default", 
  className, 
  showDot = false,
  withShimmer = false 
}) {
  return (
    <span
      className={cn(
        "relative overflow-hidden inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
        variantClasses[variant] || variantClasses.default,
        className
      )}
    >
      {/* Dynamic Shimmer: Subtle white in dark mode, subtle silver in light mode */}
      {withShimmer && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-black/5 dark:via-white/10 to-transparent" />
      )}

      {showDot && (
        <span className={cn("h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shadow-sm", dotClasses[variant])} />
      )}

      <span className="relative z-10 whitespace-nowrap">{children}</span>
    </span>
  );
}