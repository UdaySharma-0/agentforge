import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Spinner } from "../../components/ui";
import {
  exchangeWhatsAppCode,
  saveWhatsAppIntegration,
} from "../../services/integrationService";
import { MessageCircle, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * WhatsApp OAuth Callback Page
 * Handles redirect from Meta OAuth with AgentForge Aesthetic
 */
export default function WhatsAppCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasStartedRef = useRef(false);

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`
  ).replace(/\/$/, "");

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    handleOAuthCallback();
  }, [searchParams]);

  async function handleOAuthCallback() {
    const agentId = localStorage.getItem("whatsapp_agent_id");
    const code = searchParams.get("code");
    const error_code = searchParams.get("error_code");
    const error_message = searchParams.get("error_message");

    try {
      setLoading(true);
      setError(null);

      if (error_code || error_message) {
        throw new Error(`Meta OAuth Error: (${error_code}) ${error_message || "Authorization cancelled"}`);
      }

      if (!code) {
        throw new Error("No authorization code received from Meta");
      }

      if (!agentId) {
        throw new Error("Agent ID not found. Please try connecting WhatsApp again.");
      }

      // Exchange Code for Token
      const exchangeResult = await exchangeWhatsAppCode(code, agentId);

      if (!exchangeResult.success) {
        throw new Error(exchangeResult.message || "Failed to exchange OAuth code");
      }

      const {
        access_token,
        phone_number_id,
        phone_number,
        display_phone_number,
        waba_id,
        webhook_token,
      } = exchangeResult.data;

      // Save Integration to Database
      const saveResult = await saveWhatsAppIntegration({
        agentId,
        phone_number_id,
        access_token,
        waba_id,
        phone_number,
        webhook_token,
      });

      if (!saveResult.success) {
        throw new Error(saveResult.message || "Failed to save WhatsApp integration");
      }

      // Store Setup Info
      localStorage.setItem(
        "whatsapp_integration_setup",
        JSON.stringify({
          integrationId: saveResult.data._id,
          phone_number,
          display_phone_number,
          webhookUrl: `${apiBaseUrl}/channels/whatsapp/webhook`,
          webhookToken: webhook_token,
          setupTime: new Date().toISOString(),
        })
      );

      localStorage.removeItem("whatsapp_agent_id");

      setTimeout(() => {
        navigate(`/channels/${agentId}?connected=true`);
      }, 1500);

    } catch (err) {
      setError(err.message || "An error occurred");
      setTimeout(() => {
        navigate(agentId ? `/channels/${agentId}` : "/dashboard");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 transition-colors duration-500 overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="feature-card border-none bg-[var(--color-card)]/60 p-10 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 rounded-[2.5rem] text-center">
          
          {loading ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 animate-spin-slow" />
                <Spinner size="lg" className="text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text)] uppercase">
                  Meta Handshake
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-70">
                  Linking WhatsApp Business API
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/60">
                 <ShieldCheck size={12} /> Encrypted Link Established
              </div>
            </div>
          ) : error ? (
            <div className="space-y-6 animate-in slide-in-from-top-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text)] uppercase">
                  Uplink Terminated
                </h2>
                <p className="text-xs font-semibold text-rose-400/80 leading-relaxed px-4">
                  {error}
                </p>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] animate-pulse">
                Auto-redirecting to Cluster...
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--color-text)] uppercase">
                  System Online
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/70">
                  WhatsApp Node Connected Successfully
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
          AgentForge Meta Integration • v4.0.2
        </p>
      </div>
    </div>
  );
}