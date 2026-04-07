import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {},
});

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const id = toastId++;
    const duration = options.duration ?? 3500;
    const tone = options.tone ?? "success";

    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    neutral: <Info size={18} className="text-indigo-500" />,
    sparkle: <Sparkles size={18} className="text-amber-500" />,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="pointer-events-none fixed right-0 top-0 z-[200] flex flex-col gap-3 p-4 sm:p-6 md:right-4 md:top-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div
                className="group relative flex min-w-[320px] max-w-md items-center justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
                role="status"
                aria-live="polite"
              >
                {/* Visual Accent Bar */}
                <div 
                  className={`absolute left-0 top-0 h-full w-1 ${
                    toast.tone === "success" ? "bg-emerald-500" : 
                    toast.tone === "error" ? "bg-rose-500" : "bg-indigo-500"
                  }`} 
                />

                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    {icons[toast.tone] || icons.neutral}
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {toast.tone === "success" ? "Success" : toast.tone === "error" ? "Alert" : "Notification"}
                    </p>
                    <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                      {toast.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label="Dismiss"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}