import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, Globe, Mail, MessageCircle, Plus, Settings, Unplug } from "lucide-react";
import { Button, Card, CardContent, Spinner } from "../../components/ui";
import { getAgents } from "../../services/agentService";
import {
  disableEmailIntegration,
  getGoogleOAuthUrl,
  listEmailIntegrations,
  listWhatsAppIntegrations,
} from "../../services/integrationService";
import { useToast } from "../../components/ui/ToastProvider";
import WidgetCustomizer from "../../features/widget/WidgetCustomizer";
import WhatsAppSetup from "../integrations/WhatsAppSetup";
import { getWidgetConfig } from "../../services/widgetService";

export default function ChannelsIntegration() {
  const { id: agentId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [agents, setAgents] = useState([]);
  const [whatsAppIntegrations, setWhatsAppIntegrations] = useState([]);
  const [gmailIntegrations, setGmailIntegrations] = useState([]);
  const [widgetConfig, setWidgetConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailConnecting, setEmailConnecting] = useState(false);
  const [disconnectingEmailId, setDisconnectingEmailId] = useState(null);
  const [error, setError] = useState(null);
  const [activeChannelView, setActiveChannelView] = useState("list");

  useEffect(() => {
    loadIntegrations();

    const isWhatsAppConnected = searchParams.get("connected") === "true";
    const isGmailConnected = searchParams.get("email_connected") === "true";

    if (isWhatsAppConnected || isGmailConnected) {
      showToast(
        isWhatsAppConnected
          ? "WhatsApp connected successfully."
          : "Gmail connected successfully.",
      );

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("connected");
      nextParams.delete("email_connected");
      setSearchParams(nextParams, { replace: true });
    }
  }, [agentId, searchParams, setSearchParams, showToast]);

  useEffect(() => {
    setActiveChannelView("list");
  }, [agentId]);

  async function loadIntegrations() {
    try {
      setLoading(true);
      setError(null);

      const [agentsResult, whatsappResult, gmailResult, widgetResult] = await Promise.all([
        getAgents(),
        listWhatsAppIntegrations().catch(() => ({ success: false, data: [] })),
        agentId
          ? listEmailIntegrations(agentId).catch(() => ({ success: false, data: [] }))
          : Promise.resolve({ success: false, data: [] }),
        agentId
          ? getWidgetConfig(agentId).catch(() => ({ success: false, config: null }))
          : Promise.resolve({ success: false, config: null }),
      ]);

      setAgents(agentsResult.agents || []);
      setWhatsAppIntegrations(
        whatsappResult.success && agentId
          ? (whatsappResult.data || []).filter((integration) => integration.agentId?._id === agentId)
          : [],
      );
      setGmailIntegrations(gmailResult.success ? gmailResult.data || [] : []);
      setWidgetConfig(widgetResult.success ? widgetResult.config || null : null);
    } catch (err) {
      console.error("Failed to load integrations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGmailConnect() {
    try {
      if (!agentId) {
        setError("Select an agent first to connect Gmail.");
        return;
      }

      setEmailConnecting(true);
      setError(null);
      localStorage.setItem("gmail_agent_id", agentId);

      const oauthUrl = getGoogleOAuthUrl();
      if (!oauthUrl) {
        setError("Gmail OAuth not configured. Check frontend environment variables.");
        return;
      }

      window.location.href = oauthUrl;
    } catch (err) {
      console.error("Failed to start Gmail connection:", err);
      setError(err.message);
      setEmailConnecting(false);
    }
  }

  async function handleGmailDisconnect() {
    const integration = gmailIntegrations.find((item) => item.isActive);
    if (!integration?._id) return;

    const confirmed = window.confirm("Disconnect Gmail for this agent?");
    if (!confirmed) return;

    try {
      setDisconnectingEmailId(integration._id);
      await disableEmailIntegration(integration._id);
      localStorage.removeItem("gmail_integration_setup");
      showToast("Gmail disconnected.");
      await loadIntegrations();
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Failed to disconnect Gmail.", { tone: "error" });
    } finally {
      setDisconnectingEmailId(null);
    }
  }

  const whatsAppIntegration = whatsAppIntegrations.find(
    (integration) => integration.phone_number && integration.isActive,
  );
  const gmailIntegration = gmailIntegrations.find((integration) => integration.isActive);

  if (!agentId) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Channels</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Choose an agent first, then connect Gmail, WhatsApp, or Website Chatbot for that agent.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <Spinner size="sm" />
            Loading agents...
          </div>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-[var(--color-muted)]">
                No agents found. Create an agent first to configure channels.
              </p>
              <Button className="mt-4" onClick={() => navigate("/agents/create")}>
                Create Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent._id} className="transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">{agent.name}</h3>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {agent.description || agent.purpose || "No description provided."}
                      </p>
                    </div>
                    <Button className="w-full" onClick={() => navigate(`/channels/${agent._id}`)}>
                      Open Channels
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-[var(--color-muted)]">
            <Spinner size="sm" />
            Loading channels...
          </div>
        </div>
      </div>
    );
  }

  if (activeChannelView === "whatsapp-setup") {
    return (
      <div className="w-full">
        <div className="mb-6">
          <button
            onClick={() => {
              setActiveChannelView("list");
              loadIntegrations();
            }}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-800/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            ← Back to Channels
          </button>
        </div>
        <WhatsAppSetup agentId={agentId} />
      </div>
    );
  }

  if (activeChannelView === "website-widget") {
    return (
      <div className="w-full">
        <WidgetCustomizer
          agentId={agentId}
          onBack={() => setActiveChannelView("list")}
          onWidgetUpdated={loadIntegrations}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Channel Integrations</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Connect your agent to messaging platforms and communication channels
        </p>
      </div>

      {error ? (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-400">Error</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChannelCard
          icon={<MessageCircle className="h-8 w-8 text-green-500" />}
          title="WhatsApp"
          description="Connect to WhatsApp Business Account"
          subtitle="Reach customers via WhatsApp"
          isConnected={!!whatsAppIntegration}
          connectedInfo={
            whatsAppIntegration
              ? {
                  primary: whatsAppIntegration.phone_number,
                  status: whatsAppIntegration.isActive ? "Active" : "Inactive",
                }
              : null
          }
          onConnect={() => setActiveChannelView("whatsapp-setup")}
          connectLabel="Manage WhatsApp"
          onConnectedAction={() => setActiveChannelView("whatsapp-setup")}
          connectedActionLabel="Manage WhatsApp"
        />

        <ChannelCard
          icon={<Mail className="h-8 w-8 text-blue-500" />}
          title="Gmail"
          description="Connect Gmail inbox for AI-powered email replies"
          subtitle="Connect your Gmail account"
          isConnected={!!gmailIntegration}
          connectedInfo={
            gmailIntegration
              ? {
                  primary: gmailIntegration.email,
                  status: gmailIntegration.isActive ? "Connected" : "Inactive",
                }
              : null
          }
          onConnect={handleGmailConnect}
          isLoading={emailConnecting}
          onDisconnect={handleGmailDisconnect}
          disconnectLabel="Disconnect Gmail"
          disconnectLoading={disconnectingEmailId === gmailIntegration?._id}
        />

        <ChannelCard
          icon={<Globe className="h-8 w-8 text-purple-500" />}
          title="Website Chatbot"
          description="Embed chatbot on your website"
          subtitle="Customize widget and generate embed script"
          isConnected={!!widgetConfig}
          connectedInfo={
            widgetConfig
              ? {
                  primary: widgetConfig.websiteUrl,
                  status: "Connected",
                }
              : null
          }
          onConnect={() => setActiveChannelView("website-widget")}
          connectLabel={widgetConfig ? "Open Customizer" : "Connect Website Chatbot"}
          onConnectedAction={() => setActiveChannelView("website-widget")}
          connectedActionLabel="Open Customizer"
        />
      </div>

      <Card className="bg-slate-900/50">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-semibold text-[var(--color-text)]">How Channel Integration Works</h3>
          <ul className="space-y-2 text-sm text-[var(--color-muted)]">
            <li>Users send messages on the connected channel</li>
            <li>Messages are automatically forwarded to this agent</li>
            <li>Agent provides intelligent replies</li>
            <li>Responses are sent back to the user</li>
            <li>All conversations are logged for analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ChannelCard({
  icon,
  title,
  description,
  subtitle,
  isConnected,
  connectedInfo,
  onConnect,
  isLoading,
  connectLabel,
  onDisconnect,
  disconnectLabel,
  disconnectLoading,
  onConnectedAction,
  connectedActionLabel,
}) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-center">{icon}</div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
          </div>

          {isConnected && connectedInfo ? (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-center">
              <p className="text-xs font-semibold uppercase text-green-400">Connected</p>
              <p className="mt-1 text-sm font-mono text-[var(--color-text)] break-all">
                {connectedInfo.primary}
              </p>
              <p className="text-xs text-[var(--color-muted)]">Status: {connectedInfo.status}</p>
            </div>
          ) : (
            <p className="text-center text-xs text-[var(--color-muted)]">{subtitle}</p>
          )}

          {!isConnected ? (
            <Button onClick={onConnect} isLoading={isLoading} className="w-full" size="sm">
              <div className="flex items-center justify-center">
                <Plus className="mr-1 h-4 w-4" />
                {connectLabel || `Connect ${title}`}
              </div>
            </Button>
          ) : (
            <div className="space-y-2">
              {onConnectedAction ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  size="sm"
                  onClick={onConnectedAction}
                  leftIcon={<Settings className="h-4 w-4" />}
                >
                  {connectedActionLabel || "Manage"}
                </Button>
              ) : (
                <Button variant="secondary" className="w-full" size="sm" disabled>
                  Connected
                </Button>
              )}

              {onDisconnect ? (
                <Button
                  variant="danger"
                  className=" w-full "
                  size="sm"
                  onClick={onDisconnect}
                  isLoading={disconnectLoading}
                  leftIcon={!disconnectLoading ? <Unplug className="h-4 w-4" /> : undefined}
                >
                  {disconnectLabel || `Disconnect ${title}`}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
