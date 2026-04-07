import { useState, useRef } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button, Modal } from "../../components/ui";

export default function ScriptGeneratorModal({ isOpen, onClose, script }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      
      // Cleanup previous timeout if user clicks rapidly
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Embed Script"
      size="lg"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Dismiss
          </Button>
          <Button 
            onClick={handleCopy} 
            className="min-w-[120px]"
            variant={copied ? "success" : "primary"} // Assuming your UI kit supports these
            leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? "Copied!" : "Copy Script"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Instruction Alert */}
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <Terminal className="mt-0.5 h-5 w-5 text-emerald-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-emerald-200">Installation Instruction</p>
            <p className="text-xs text-emerald-400/80">
              To go live, paste this snippet into your HTML file immediately before the closing 
              <code className="mx-1 rounded bg-emerald-500/20 px-1 py-0.5 text-emerald-300">{"</body>"}</code> tag.
            </p>
          </div>
        </div>

        {/* Code Snippet Container */}
        <div className="group relative">
          <pre className="max-h-[320px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-[11px] leading-relaxed text-indigo-300 transition-colors group-hover:border-slate-700">
            <code>{script}</code>
          </pre>
          
          {/* Subtle Overlay Copy Button */}
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-md bg-slate-800/50 p-2 text-slate-400 opacity-0 transition-all hover:bg-slate-700 hover:text-white group-hover:opacity-100"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
}