import Spinner from "./Spinner";
import { cn } from "./utils";
import { useTheme } from "../../app/themeContext";

const variantClasses = {
  primary:
    "border-indigo-600 bg-indigo-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-indigo-500 hover:border-indigo-500 active:scale-[0.98] dark:shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]",
  secondary:
    "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800/50",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100",
  dangerLight:
    "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 active:scale-[0.98]",
  dangerDark:
    "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-[0.98] shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs tracking-wide",
  md: "h-10 px-4 text-sm font-semibold",
  lg: "h-12 px-6 text-base font-bold",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  type = "button",
  ...props
}) {
  const { theme } = useTheme();

  const appliedVariant =
    variant === "danger"
      ? theme === "dark"
        ? "dangerDark"
        : "dangerLight"
      : variant;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variantClasses[appliedVariant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-inherit">
          <Spinner size="sm" className="animate-spin text-current" />
        </div>
      )}
      
      <div className={cn(
        "flex items-center gap-2 transition-opacity duration-200",
        isLoading ? "opacity-0" : "opacity-100"
      )}>
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </div>
    </button>
  );
}