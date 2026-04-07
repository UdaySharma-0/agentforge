import { useState, useMemo } from "react";
import { MessageCircle, Sparkles, SendHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WidgetShellPreview({
  color = "#6366F1",
  greeting = [],
  compact = false,
  className = "",
}) {
  const [isChatOpen, setIsChatOpen] = useState(true); // Default to open for the preview simulator

  // Contrast logic for text color
  const isLightColor = useMemo(() => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }, [color]);

  const textColor = isLightColor ? "text-slate-900" : "text-white";
  const mutedTextColor = isLightColor ? "text-slate-900/60" : "text-white/80";

  const displayLines = useMemo(() => {
    const filtered = greeting.filter(Boolean);
    return filtered.length > 0 ? filtered.slice(0, 2) : ["Hey there! 👋", "How can we help you today?"];
  }, [greeting]);

  return (
    <div className={`flex shrink-0 p-4 ${className}`}>
      <div className={`relative flex flex-col items-end gap-4 ${compact ? "w-full max-w-[320px]" : "w-full max-w-[360px]"}`}>
        
        {/* Chat Window Animation */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20, originY: "bottom", originX: "right" }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className={`${compact ? "w-[320px]" : "w-[360px]"} overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]`}
            >
              {/* Header */}
              <div 
                className={`px-6 py-5 transition-colors duration-300 ${textColor}`} 
                style={{ backgroundColor: color }}
              >
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isLightColor ? 'bg-black/10' : 'bg-white/20'}`}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold tracking-tight">AgentForge</span>
                </div>
                <p className={`mt-1 text-[11px] font-medium uppercase tracking-wider ${mutedTextColor}`}>
                  Live Support
                </p>
              </div>

              {/* Conversation Area */}
              <div className="flex flex-col gap-3 bg-slate-50/50 p-5 min-h-[240px]">
                {displayLines.map((line, index) => (
                  <div
                    key={index}
                    className="max-w-[85%] rounded-2xl rounded-tl-none border border-slate-100 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm"
                  >
                    {line}
                  </div>
                ))}

                <div
                  className={`ml-auto max-w-[80%] rounded-2xl rounded-br-none p-3 text-sm leading-relaxed shadow-md ${textColor}`}
                  style={{ backgroundColor: color }}
                >
                  I have a question!
                </div>
              </div>

              {/* Fake Input Area */}
              <div className="border-t border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center justify-between rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-400">
                  Type a message...
                  <SendHorizontal className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launcher Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${textColor}`}
          style={{ backgroundColor: color }}
        >
          {isChatOpen ? (
             <X className="h-6 w-6 animate-in fade-in zoom-in duration-200" />
          ) : (
             <MessageCircle className="h-6 w-6 animate-in fade-in zoom-in duration-200" />
          )}
        </button>
      </div>
    </div>
  );
}