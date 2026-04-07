import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { Plus, Play, History, Bot, Activity, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentAgents, setRecentAgents] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchRecent()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchSummary = async () => {
    try {
      const { data } = await apiClient.get("/dashboard/summary");
      if (data.success) setSummary(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecent = async () => {
    try {
      const { data } = await apiClient.get("/dashboard/recent");
      if (data.success) {
        setRecentAgents(data.data.recentAgents);
        setRecentLogs(data.data.recentLogs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header & Quick Actions */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--color-text)">
            Overview
          </h1>
          <p className="text-(--color-muted)">
            Manage your autonomous agents and monitor performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 
             text-white font-medium 
             shadow-md shadow-indigo-600/20 
             transition-all duration-200 ease-out 
             hover:bg-indigo-500 hover:shadow-lg active:scale-[0.98]"
            onClick={() => navigate("/agents/create")}
          >
            <Plus size={18} />
            Create Agent
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 
             border border-[--color-border] 
             bg-[--color-card] 
             font-medium text-gray-700 
             transition-all duration-200 ease-out
             hover:bg-gray-50 hover:border-gray-300 
             active:scale-[0.98]"
            onClick={() => navigate("/test-agent")}
          >
            <Play size={16} />
            Test
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard
          title="Total Agents"
          value={summary?.totalAgents ?? 0}
          icon={<Bot className="text-indigo-500" />}
          link="/agents"
          loading={loading}
        />
        <SummaryCard
          title="Active Workflows"
          value={summary?.activeWorkflows ?? 0}
          icon={<Activity className="text-emerald-500" />}
          link="/workflows"
          loading={loading}
        />
        <SummaryCard
          title="Total Logs"
          value={summary?.totalLogs ?? 0}
          icon={<History className="text-amber-500" />}
          link="/logs"
          loading={loading}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Agents */}
        <DashboardSection
          title="Recent Agents"
          action="View All"
          onAction={() => navigate("/agents")}
        >
          {loading ? (
            <SkeletonList />
          ) : (
            <div className="space-y-3">
              {recentAgents.length === 0 ? (
                <EmptyState message="No agents created yet" />
              ) : (
                recentAgents.map((agent) => (
                  <div
                    key={agent._id}
                    onClick={() => navigate(`/agents/${agent._id}`)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-(--color-border) bg-(--color-card) p-4 transition-all hover:border-indigo-500/40 hover:bg-(--color-hover)"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-(--color-text)">
                        {agent.name}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-(--color-muted) opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </DashboardSection>

        {/* Recent Chats / Logs */}
        <DashboardSection
          title="Activity Stream"
          action="View Logs"
          onAction={() => navigate("/logs")}
        >
          {loading ? (
            <SkeletonList />
          ) : (
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <EmptyState message="No activity recorded" />
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log._id}
                    onClick={() => navigate("/logs")}
                    className="cursor-pointer rounded-xl border border-(--color-border) p-4 transition-colors hover:bg-(--color-hover)"
                  >
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-400">
                      {log.agentId?.name || "System Agent"}
                    </div>
                    <div className="truncate text-sm text-(--color-muted)">
                      {log.input}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

/* ===== Optimized Sub-Components ===== */

function SummaryCard({ title, value, link, icon, loading }) {
  const navigate = useNavigate();
  if (loading)
    return (
      <div className="h-32 w-full animate-pulse rounded-2xl bg-(--color-card) border border-(--color-border)" />
    );

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden border-(--color-border) bg-(--color-card) p-6 transition-all hover:border-indigo-500/30"
      onClick={() => navigate(link)}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/5 transition-transform group-hover:scale-150" />
      <div className="relative flex flex-col gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-bg) border border-(--color-border)">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-(--color-muted)">{title}</p>
          <p className="text-3xl font-bold text-(--color-text)">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function DashboardSection({ title, children, action, onAction }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <button
          onClick={onAction}
          className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          {action} →
        </button>
      </div>
      <div className="min-h-[300px] rounded-2xl border border-(--color-border) bg-(--color-card)/50 p-6 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <p className="py-10 text-center text-sm text-(--color-muted)">{message}</p>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-14 w-full animate-pulse rounded-xl bg-(--color-bg)/50"
        />
      ))}
    </div>
  );
}
