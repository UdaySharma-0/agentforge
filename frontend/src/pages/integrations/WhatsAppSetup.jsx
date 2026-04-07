import { useEffect, useState } from "react";
import { Button, Spinner, Badge, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import {
  listWhatsAppIntegrations,
  disableWhatsAppIntegration,
  getMetaOAuthUrl,
  getWebhookSetupInstructions,
} from "../../services/integrationService";
import { Copy, Trash2, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";

/**
 * WhatsApp Integration Setup Component
 * Shows:
 * - List of connected WhatsApp numbers
 * - Connect new WhatsApp button
 * - Webhook setup instructions
 */
export default function WhatsAppSetup({ agentId }) {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [disabling, setDisabling] = useState(null);
  const [showWebhookSetup, setShowWebhookSetup] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadIntegrations();
    checkSetupComplete();
  }, [agentId]);

  async function loadIntegrations() {
    try {
      setLoading(true);
      setError(null);
      const result = await listWhatsAppIntegrations();
      if (result.success) {
        // Filter to only this agent's integrations
        const filtered = result.data.filter(
          (integration) => integration.agentId?._id === agentId
        );
        setIntegrations(filtered);
      }
    } catch (err) {
      console.error("Failed to load integrations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Check if user just connected WhatsApp
   * Show webhook setup instructions
   */
  function checkSetupComplete() {
    const setup = localStorage.getItem("whatsapp_integration_setup");
    if (setup) {
      try {
        const data = JSON.parse(setup);
        setSelectedSetup(data);
        setShowWebhookSetup(true);
        // Reload integrations to show new connection
        setTimeout(() => {
          loadIntegrations();
        }, 500);
      } catch (e) {
        console.error("Failed to parse setup data:", e);
      }
    }
  }

  async function handleConnectWhatsApp() {
    try {
      setConnecting(true);
      setError(null);

      // Save agent ID for callback
      localStorage.setItem("whatsapp_agent_id", agentId);

      // Get OAuth URL
      const oauthUrl = getMetaOAuthUrl();
      if (!oauthUrl) {
        setError(
          "WhatsApp OAuth is not configured. Check your environment variables."
        );
        return;
      }

      // Redirect to Meta OAuth
      window.location.href = oauthUrl;
    } catch (err) {
      console.error("Failed to connect WhatsApp:", err);
      setError(err.message);
      setConnecting(false);
    }
  }

  async function handleDisableIntegration(integrationId) {
    if (!window.confirm("Disconnect this WhatsApp number?")) {
      return;
    }

    try {
      setDisabling(integrationId);
      const result = await disableWhatsAppIntegration(integrationId);
      if (result.success) {
        setIntegrations(
          integrations.filter((i) => i._id !== integrationId)
        );
      }
    } catch (err) {
      console.error("Failed to disable integration:", err);
      setError(err.message);
    } finally {
      setDisabling(null);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeWebhookSetup() {
    setShowWebhookSetup(false);
    localStorage.removeItem("whatsapp_integration_setup");
    setSelectedSetup(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <CardTitle>WhatsApp Integration</CardTitle>
          </div>
          <Button
            onClick={handleConnectWhatsApp}
            isLoading={connecting}
            size="sm"
          >
            + Connect WhatsApp
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Webhook Setup Instructions */}
        {showWebhookSetup && selectedSetup && (
          <div className="space-y-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-400">
                    ✅ WhatsApp Connected!
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Number: <span className="font-mono font-medium">{selectedSetup.display_phone_number || selectedSetup.phone_number}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeWebhookSetup}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 border-t border-blue-500/20 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Next Step: Configure Webhook in Meta Dashboard
              </p>
              <div className="space-y-2 text-xs">
                <div className="space-y-1 rounded bg-slate-900/50 p-2">
                  <p className="text-slate-400">Webhook URL:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-slate-950 px-2 py-1 font-mono text-slate-300">
                      {selectedSetup.webhookUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedSetup.webhookUrl)}
                      className="flex-shrink-0 rounded p-1 hover:bg-slate-700"
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 rounded bg-slate-900/50 p-2">
                  <p className="text-slate-400">Verify Token:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-slate-950 px-2 py-1 font-mono text-slate-300 text-xs">
                      {selectedSetup.webhookToken}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedSetup.webhookToken)}
                      className="flex-shrink-0 rounded p-1 hover:bg-slate-700"
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <ol className="space-y-1 pt-2 text-xs text-slate-400">
                <li>1. Go to your Meta Business Account Dashboard</li>
                <li>2. Select your WhatsApp app</li>
                <li>3. Go to Configuration</li>
                <li>4. Enter the Webhook URL and Verify Token above</li>
                <li>5. Click "Verify and Save"</li>
                <li>6. Your WhatsApp agent is ready to receive messages! 🎉</li>
              </ol>
            </div>

            {copied && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Copied to clipboard!
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Spinner size="sm" />
              Loading integrations...
            </div>
          </div>
        ) : integrations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">
              No WhatsApp numbers connected yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Click "Connect WhatsApp" to link a phone number to this agent
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {integrations.map((integration) => (
              <div
                key={integration._id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="font-mono font-medium text-slate-200">
                      {integration.phone_number}
                    </span>
                    <Badge
                      variant={integration.isActive ? "success" : "warning"}
                    >
                      {integration.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Connected {new Date(integration.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDisableIntegration(integration._id)}
                  disabled={disabling === integration._id}
                  className="rounded p-2 hover:bg-slate-800 disabled:opacity-50"
                  title="Disconnect"
                >
                  <Trash2
                    className="h-4 w-4 text-slate-400"
                    style={{
                      animation:
                        disabling === integration._id
                          ? "spin 1s linear infinite"
                          : "none",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg bg-slate-900/50 p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">💡 How it works:</p>
          <ul className="mt-2 space-y-1">
            <li>
              • Users send messages to your WhatsApp number
            </li>
            <li>
              • Messages are automatically forwarded to this agent
            </li>
            <li>
              • Agent responds, and replies are sent back to users
            </li>
            <li>
              • All conversations are logged for analytics
            </li>
          </ul>
        </div>
      </CardContent>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
}
