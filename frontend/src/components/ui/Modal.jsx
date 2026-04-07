import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "./utils";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  fullscreen: "max-w-[min(1400px,100vw-24px)]",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  bodyClassName,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with enhanced blur and subtle animation */}
      <button
        type="button"
        className="absolute inset-0 animate-in fade-in duration-300 bg-slate-950/40 backdrop-blur-md dark:bg-black/60"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-label="Close modal backdrop"
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative z-10 w-full animate-in zoom-in-95 fade-in duration-300 slide-in-from-bottom-4",
          "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900",
          sizeClasses[size] || sizeClasses.md
        )}
      >
        {/* Subtle top glow for dark mode */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent dark:via-indigo-400/20" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800/60">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
            aria-label="Close modal"
          >
            <X size={18} className="transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Body */}
        <div 
          className={cn(
            "max-h-[70vh] overflow-y-auto px-6 py-6 text-slate-600 dark:text-slate-400", 
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex items-center justify-end gap-3 bg-slate-50/50 px-6 py-4 dark:bg-slate-800/30">
            {footer}
          </div>
        ) : (
          <div className="h-4" />
        )}
      </div>
    </div>,
    document.body
  );
}