import { cn } from "./utils";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[2.5px]",
  lg: "h-10 w-10 border-[3.5px]",
};

export default function Spinner({ size = "md", className }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background track for a "high-end" look */}
      <span
        className={cn(
          "absolute rounded-full border-solid border-slate-200 opacity-20 dark:border-slate-700",
          sizeClasses[size] || sizeClasses.md
        )}
      />
      
      {/* Active spinning element */}
      <span
        className={cn(
          "relative inline-block animate-spin rounded-full border-solid border-current border-r-transparent transition-all duration-500 ease-in-out text-indigo-500",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
        style={{
          filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))"
        }}
        aria-label="Loading"
      />
    </div>
  );
}