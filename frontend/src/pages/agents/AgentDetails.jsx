import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedAgent,
  deleteAgentAction,
  fetchAgentById,
} from "../../app/agentSlice";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "../../components/ui";
import {
  Settings2,
  BookOpen,
  MessageSquare,
  Zap,
  Trash2,
  Edit3,
  Cpu,
  Activity,
  Globe,
} from "lucide-react";

function statusVariant(status) {
  if (status === "active") return "success";
  if (status === "inactive") return "warning";
  return "default";
}

export default function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedAgent, detailLoading, deleteLoading, error } = useSelector(
    (state) => state.agents,
  );

  const behaviorSummary = [
    selectedAgent?.instructions?.tone
      ? `Tone: ${selectedAgent.instructions.tone}`
      : null,
    selectedAgent?.instructions?.responseLength
      ? `Length: ${selectedAgent.instructions.responseLength}`
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  useEffect(() => {
    dispatch(fetchAgentById(id));
    return () => {
      dispatch(clearSelectedAgent());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    const ok = window.confirm(
      "Delete this agent? This action cannot be undone.",
    );
    if (!ok) return;
    try {
      await dispatch(deleteAgentAction(id)).unwrap();
      navigate("/agents");
    } catch (e) {}
  };

  if (detailLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-[var(--color-muted)]">
        <Spinner className="h-8 w-8 text-primary" />
        <span className="animate-pulse text-sm font-medium">
          Retrieving Agent Profile...
        </span>
      </div>
    );
  }

  if (!selectedAgent) {
    return (
      <div className="mx-auto max-w-md pt-20 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Agent Not Found
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {error ||
            "The agent you are looking for does not exist or has been decommissioned."}
        </p>
        <Button className="mt-6" onClick={() => navigate("/agents")}>
          Return to Fleet
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant={statusVariant(selectedAgent.status)}
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            >
              {selectedAgent.status || "draft"}
            </Badge>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Agent ID: {id.slice(-6)}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)]">
            {selectedAgent.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-11 rounded-xl border-[var(--color-border)] bg-[var(--color-card)] px-6 hover:bg-white/5"
            onClick={() => navigate(`/agents/${id}/edit`)}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button
            variant="danger"
            className="h-11 w-11 rounded-xl p-0 transition-all hover:scale-105 sm:w-auto sm:px-6"
            onClick={handleDelete}
            isLoading={deleteLoading}
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Terminate</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Overview Data */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="feature-card overflow-hidden border-none bg-gradient-to-br from-[var(--color-card)] to-[var(--color-bg)] shadow-2xl ring-1 ring-[var(--color-border)]">
            <CardHeader className="border-b border-[var(--color-border)]/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold uppercase tracking-wider">
                <Activity className="h-4 w-4 text-primary" /> Core Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 p-6 sm:grid-cols-2">
              <Info label="Processing Engine" icon={<Cpu />}>
                {selectedAgent.engine || "Standard Neural"}
              </Info>
              <Info label="Primary Purpose" icon={<Zap />}>
                {selectedAgent.purpose || "General Assistance"}
              </Info>
              <Info label="Description" className="sm:col-span-2">
                <p className="leading-relaxed text-[var(--color-muted)]">
                  {selectedAgent.description ||
                    "No description provided for this neural unit."}
                </p>
              </Info>
              <div className="sm:col-span-2 rounded-2xl bg-black/20 p-4 dark:bg-white/5 ring-1 ring-[var(--color-border)]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Behavioral Instructions
                </p>
                <p className="text-sm italic text-[var(--color-text)]">
                  "{behaviorSummary || "Awaiting behavioral programming..."}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Config Links as Tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => navigate(`/agents/${id}/knowledge`)}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-[var(--color-card)]/50 p-6 transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:bg-blue-500/5"
            >
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">
                  Knowledge
                </div>
                <div className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-tight">
                  Train on data
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate(`/agents/${id}/behavior`)}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-[var(--color-card)]/50 p-6 transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-indigo-500/5"
            >
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400 group-hover:scale-110 transition-transform">
                <Settings2 className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-black uppercase tracking-wider text-[var(--color-text)]">
                  Behavior
                </div>
                <div className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-tight">
                  Fine-tune tone
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate(`/agents/${id}/test`)}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="rounded-xl bg-primary/20 p-3 text-primary group-hover:animate-pulse">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-black uppercase tracking-wider text-primary">
                  Test Lab
                </div>
                <div className="text-[10px] font-medium text-primary/70 uppercase tracking-tight">
                  Live debugging
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: Status & Launch */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Globe className="h-5 w-5 animate-pulse" /> Deployment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                This agent is ready for production. Connect your API keys to
                sync with external channels.
              </p>
              <Button
                onClick={() => navigate(`/channels/${id}`)}
                className="w-full bg-primary py-6 text-base font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                Go Live
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                System Optimized
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-[var(--color-border)] p-6 text-center">
            <p className="text-xs font-medium text-[var(--color-muted)]">
              Memory Retention
            </p>
            <div className="mt-2 text-4xl font-black text-primary">
              {selectedAgent.memoryWindow || 5}
            </div>
            <p className="text-[10px] text-[var(--color-muted)]">
              Message Window
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, children, className = "", icon }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-muted)]">
        {icon && <span className="text-primary/60">{icon}</span>}
        {label}
      </div>
      <div className="text-sm font-medium text-[var(--color-text)]">
        {children}
      </div>
    </div>
  );
}

function ConfigTile({ icon, title, desc, onClick, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
        highlight
          ? "border-primary/50 bg-primary/10 text-primary shadow-lg shadow-primary/10"
          : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] hover:border-primary/50 hover:text-[var(--color-text)]"
      }`}
    >
      <div className="text-current">{icon}</div>
      <div className="text-sm font-bold">{title}</div>
      <div className="text-[10px] opacity-60">{desc}</div>
    </button>
  );
}
