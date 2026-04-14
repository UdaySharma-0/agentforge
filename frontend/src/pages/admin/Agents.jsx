import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
} from "../../components/ui";
import {
  deleteAgentAdmin,
  getAgents,
  updateAgentStatus,
} from "../../services/adminApi";

const statusOptions = ["draft", "active", "inactive"];

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusBadge(status) {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    default:
      return "default";
  }
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAgents();
        setAgents(response.agents || []);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const totals = useMemo(() => {
    return {
      total: agents.length,
      active: agents.filter((agent) => agent.status === "active").length,
      draft: agents.filter((agent) => agent.status === "draft").length,
    };
  }, [agents]);

  const handleStatusChange = async (agentId, status) => {
    try {
      setBusyId(agentId);
      setError("");
      const response = await updateAgentStatus(agentId, status);
      const updatedAgent = response.agent;

      setAgents((current) =>
        current.map((agent) => (agent._id === updatedAgent._id ? updatedAgent : agent)),
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update agent status");
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (agentId) => {
    try {
      setBusyId(agentId);
      setError("");
      await deleteAgentAdmin(agentId);
      setAgents((current) => current.filter((agent) => agent._id !== agentId));
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete agent");
    } finally {
      setBusyId("");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Agent",
      render: (agent) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{agent.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {agent.purpose || "No purpose provided"}
          </p>
        </div>
      ),
    },
    {
      key: "createdBy",
      header: "Owner",
      render: (agent) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {agent.createdBy?.email || "Unknown"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (agent) => (
        <Badge variant={getStatusBadge(agent.status)}>{agent.status || "draft"}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (agent) => (
        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
          {formatDate(agent.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (agent) => (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={agent.status || "draft"}
            disabled={busyId === agent._id}
            onChange={(event) => handleStatusChange(agent._id, event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="danger"
            isLoading={busyId === agent._id}
            leftIcon={<Trash2 size={14} />}
            onClick={() => handleDelete(agent._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="All Agents" value={totals.total} />
        <MetricCard label="Active" value={totals.active} accent="text-emerald-500" />
        <MetricCard label="Draft" value={totals.draft} accent="text-amber-500" />
      </div>

      <Card className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>Global agent management</CardTitle>
          <CardDescription>
            Review every workspace agent, update status safely, or remove unused agents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <Table
            columns={columns}
            data={loading ? [] : agents}
            rowKey="_id"
            emptyText={loading ? "Loading agents..." : "No agents found."}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, accent = "text-slate-900 dark:text-slate-100" }) {
  return (
    <Card className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={accent}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
