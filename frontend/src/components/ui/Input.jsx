import { forwardRef } from "react";
import { cn } from "./utils";

const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    className,
    inputClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn("group flex w-full flex-col gap-1.5", className)}>
      {label ? (
        <label 
          htmlFor={id} 
          className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-focus-within:text-indigo-500 dark:text-slate-400"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500">
            {leftIcon}
          </div>
        ) : null}

        <input
          id={id}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10",
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            error && "border-rose-500 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/50 dark:bg-rose-500/5 dark:focus:border-rose-500",
            inputClassName
          )}
          {...props}
        />

        {rightIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="ml-1 animate-in fade-in slide-in-from-top-1 text-xs font-medium text-rose-500 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p className="ml-1 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;