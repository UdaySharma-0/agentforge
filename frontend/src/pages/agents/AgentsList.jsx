import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Eye, Plus } from "lucide-react";
import { fetchAgents } from "../../app/agentSlice";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Spinner,
  Table,
} from "../../components/ui";

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function statusVariant(status) {
  const s = status?.toLowerCase();
  if (s === "active") return "success";
  if (s === "inactive" || s === "draft") return "warning";
  return "default";
}

export default function AgentsList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list, listLoading, error } = useSelector((state) => state.agents);

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  // Mobile Card Component for better responsiveness
  const MobileAgentCard = ({ agent }) => (
    <div className="border-b border-[var(--color-border)] p-4 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 font-bold text-indigo-500">
            {(agent?.name || "").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[var(--color-text)]">{agent?.name || ""}</p>
            <p className="text-xs italic text-[var(--color-muted)]">
              "{agent.purpose || "General Purpose"}"
            </p>
          </div>
        </div>
        <Badge variant={statusVariant(agent.status)} className="capitalize">
          {agent.status || "draft"}
        </Badge>
      </div>

      <p className="text-sm text-[var(--color-muted)] mb-4 line-clamp-2">
        {agent.description || "No description provided"}
      </p>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-[var(--color-muted)]">
          Created: {formatDate(agent.createdAt)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/agents/${agent._id}`)}
            className="p-2 text-[var(--color-muted)] hover:text-indigo-500"
            aria-label="View Agent Details"
            title="View Agent Details"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => navigate(`/agents/${agent._id}/edit`)}
            className="p-2 text-[var(--color-muted)] hover:text-indigo-500"
            aria-label="Edit Agent"
            title="Edit Agent"
          >
            <Edit size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      key: "name",
      header: "Agent Configuration",
      render: (agent) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 font-bold text-indigo-500">
            {(agent?.name || "").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-[var(--color-text)]">{agent?.name || ""}</p>
            <p className="text-xs text-[var(--color-muted)] line-clamp-1 max-w-[200px]">
              {agent.description || "No description provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (agent) => (
        <p className="max-w-[280px] truncate text-[var(--color-muted)] italic">
          "{agent.purpose || "General Purpose"}"
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (agent) => (
        <Badge variant={statusVariant(agent.status)} className="capitalize px-3 py-1">
          {agent.status || "draft"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (agent) => (
        <span className="text-sm text-[var(--color-muted)]">
          {formatDate(agent.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (agent) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/agents/${agent._id}`)}
            className="rounded-md p-2 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
            aria-label="View Agent Details"
            title="View Agent Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => navigate(`/agents/${agent._id}/edit`)}
            className="rounded-md p-2 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
            aria-label="Edit Agent"
            title="Edit Agent"
          >
            <Edit size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">AI Agents</h1>
          <p className="text-[var(--color-muted)]">
            Deploy and monitor your autonomous agent fleet.
          </p>
        </div>

        <Button
          className="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate("/agents/create")}
        >
          New Agent
        </Button>
      </div>

      {/* Main List Card */}
      <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
        <CardContent className="p-0">
          {listLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-[var(--color-muted)]">
              <Spinner className="h-8 w-8 text-indigo-500" />
              <p className="animate-pulse">Retrieving agent data...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-rose-500 font-medium">{error}</p>
              <Button variant="ghost" className="mt-4" onClick={() => dispatch(fetchAgents())}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE: Visible on medium screens and up */}
              <div className="hidden md:block overflow-x-auto">
                <Table
                  columns={columns}
                  data={list}
                  rowKey="_id"
                  className="w-full border-collapse"
                  emptyText="No agents found."
                />
              </div>

              {/* MOBILE LIST: Visible on small screens only */}
              <div className="block md:hidden">
                {list.length > 0 ? (
                  list.map((agent) => (
                    <MobileAgentCard key={agent._id} agent={agent} />
                  ))
                ) : (
                  <div className="p-8 text-center text-[var(--color-muted)]">
                    No agents found.
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}