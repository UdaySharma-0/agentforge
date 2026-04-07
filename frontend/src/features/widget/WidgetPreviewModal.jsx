import { useEffect, useState, useMemo } from "react";
import { 
  X, 
  Monitor, 
  Smartphone, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  LoaderCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WidgetShellPreview from "./WidgetShellPreview";

const FALLBACK_MESSAGE =
  "This website has strict security (X-Frame-Options) that prevents embedding. Your chatbot will still work perfectly on the actual site.";

export default function WidgetPreviewModal({ 
  isOpen, 
  onClose, 
  url, 
  color, 
  greeting 
}) {
  const [previewStatus, setPreviewStatus] = useState("loading");
  const [viewMode, setViewMode] = useState("desktop");

  // Ensure URL format is correct for the iframe
  const safeUrl = useMemo(() => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  }, [url]);

  // Handle ESC key to close the simulator
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setPreviewStatus("loading");
    
    // Safety timeout: If site doesn't load in 6s, show the blocked state
    const timeout = setTimeout(() => {
      if (previewStatus === "loading") setPreviewStatus("blocked");
    }, 6000);
    
    return () => clearTimeout(timeout);
  }, [isOpen, safeUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
      
      {/* 1. HEADER / TOOLBAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-slate-900/50 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Close Simulator"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
              AgentForge Simulator
            </span>
          </div>
        </div>

        {/* VIEWPORT SWITCHER */}
        <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/5">
          <button
            onClick={() => setViewMode("desktop")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "desktop" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> 
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "mobile" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> 
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          SYSTEM STABLE
        </div>
      </header>

      {/* 2. MAIN SIMULATION STAGE */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 md:p-8 min-h-0">
        
        {/* FLOATING ADDRESS BAR */}
        {/* <div className="mb-6 flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 backdrop-blur-xl shadow-xl max-w-full z-20">
          <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px] md:max-w-md">
            {safeUrl}
          </span>
          <RefreshCw 
            onClick={() => setPreviewStatus("loading")}
            className={`h-3 w-3 cursor-pointer text-slate-600 hover:text-white transition-colors ${previewStatus === 'loading' ? 'animate-spin' : ''}`} 
          />
        </div> */}

        {/* DEVICE FRAME */}
        <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
          <motion.div
            layout
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col bg-slate-900 
              ${viewMode === "mobile" 
                ? "h-[680px] w-[340px] rounded-[3.5rem] border-[12px] border-slate-900 ring-2 ring-white/5 origin-center scale-[0.85] sm:scale-100" 
                : "h-full w-full max-w-6xl rounded-2xl border border-white/10"
              }`}
          >
            {/* MOBILE NOTCH */}
            {viewMode === "mobile" && (
              <div className="absolute left-1/2 top-0 z-50 h-7 w-36 -translate-x-1/2 rounded-b-3xl bg-slate-900" />
            )}

            {/* IFRAME CONTENT LAYER */}
            <div className="flex-1 overflow-hidden rounded-[inherit] bg-white relative">
              <iframe
                title="Website Frame"
                src={safeUrl}
                className={`h-full w-full transition-opacity duration-1000 border-none ${
                  previewStatus === "ready" ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setPreviewStatus("ready")}
              />

              {/* OVERLAY STATES (Loading/Blocked) */}
              <AnimatePresence>
                {previewStatus !== "ready" && (
                  <motion.div
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#020617] p-8 text-center"
                  >
                    {previewStatus === "loading" ? (
                      <div className="flex flex-col items-center gap-4">
                        <LoaderCircle className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-slate-400">Fetching preview...</p>
                      </div>
                    ) : (
                      <div className="max-w-xs space-y-6">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                          <AlertTriangle className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white">Preview Restricted</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">{FALLBACK_MESSAGE}</p>
                        </div>
                        <button 
                          onClick={() => window.open(safeUrl, '_blank')}
                          className="inline-flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-400/20 px-4 py-2 rounded-lg hover:bg-indigo-400/5 transition-all"
                        >
                          View Site Directly <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3. WIDGET POSITIONING - FIXED THE SHRINKING ISSUE */}
              <div className={`absolute z-40 transition-all duration-500 pointer-events-none
                ${viewMode === "mobile" 
                  ? "bottom-4 right-4 scale-[0.75] origin-bottom-right" 
                  : "bottom-2 right-8 scale-100"
                }`}
              >
                <div className="pointer-events-auto">
                  <WidgetShellPreview 
                    color={color} 
                    greeting={greeting} 
                    compact={viewMode === "mobile"} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* DECORATIVE BACKGROUND LABEL */}
        <div className="absolute bottom-10 left-10 pointer-events-none opacity-[0.03] select-none font-black text-8xl">
            SIMULATOR
        </div>
      </main>
    </div>
  );
}