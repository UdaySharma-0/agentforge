import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "../../components/ui";
import { exchangeGmailCode } from "../../services/integrationService";
import { Mail, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function GmailCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    handleOAuthCallback();
  }, [searchParams]);

  async function handleOAuthCallback() {
    const agentId = localStorage.getItem("gmail_agent_id");
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    try {
      setLoading(true);
      setError(null);

      if (oauthError) {
        throw new Error(`Google OAuth error: ${oauthError}`);
      }
      if (!code) {
        throw new Error("No authorization code received from Google");
      }
      if (!agentId) {
        throw new Error("Agent ID not found. Please try connecting Gmail again.");
      }

      const result = await exchangeGmailCode(code, agentId);

      if (!result.success) {
        throw new Error(result.message || "Failed to connect Gmail");
      }

      localStorage.setItem(
        "gmail_integration_setup",
        JSON.stringify({
          agentId,
          email: result.data?.email,
          connectedAt: new Date().toISOString(),
        })
      );
      localStorage.removeItem("gmail_agent_id");

      setTimeout(() => {
        navigate(`/channels/${agentId}?email_connected=true`);
      }, 1500);

    } catch (err) {
      setError(err.message || "Failed to connect Gmail");
      setTimeout(() => {
        navigate(agentId ? `/channels/${agentId}` : "/channels");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 transition-colors duration-500 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="feature-card border-none bg-[var(--color-card)]/60 p-10 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 rounded-[2.5rem] text-center">
          
          {loading ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow" />
                <Spinner size="lg" className="text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text)] uppercase">
                  Uplink in Progress
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-70">
                  Synchronizing Gmail Neural Protocols
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">
                 <ShieldCheck size={12} /> Secure Auth Channel
              </div>
            </div>
          ) : error ? (
            <div className="space-y-6 animate-in slide-in-from-top-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text)] uppercase">
                  Link Failed
                </h2>
                <p className="text-xs font-semibold text-rose-400/80 leading-relaxed px-4">
                  {error}
                </p>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] animate-pulse">
                Auto-redirecting to Channels...
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text)] uppercase">
                  Access Granted
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/70">
                  Gmail Integration Successfully Indexed
                </p>
              </div>
              <div className="mx-auto h-1 w-24 rounded-full bg-emerald-500/20 overflow-hidden">
                <div className="h-full bg-emerald-500 animate-progress-fast" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Tagline */}
        <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.4em] text-[var(--color-muted)] opacity-30">
          AgentForge Encryption Layer • v4.0.2
        </p>
      </div>
    </div>
  );
}