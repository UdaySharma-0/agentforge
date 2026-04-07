import { cn } from "./utils";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:hover:border-slate-700",
        className
      )}
      {...props}
    >
      {/* Subtle top highlight for dark mode */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-500/10 to-transparent dark:via-white/5" />
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 
      className={cn(
        "text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-slate-100", 
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p 
      className={cn(
        "text-sm font-medium text-slate-500 dark:text-slate-400", 
        className
      )}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div 
      className={cn(
        "flex items-center p-6 pt-0 border-t border-transparent transition-colors group-hover:border-slate-100 dark:group-hover:border-slate-800", 
        className
      )}
    >
      {children}
    </div>
  );
}