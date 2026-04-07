import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import apiClient from "../../services/apiClient";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
  Table,
} from "../../components/ui";

const SORT_OPTIONS = [
  { value: "time-desc", label: "Newest First" },
  { value: "time-asc", label: "Oldest First" },
  { value: "agent-asc", label: "Agent A-Z" },
  { value: "agent-desc", label: "Agent Z-A" },
  { value: "channel-asc", label: "Channel A-Z" },
  { value: "channel-desc", label: "Channel Z-A" },
];

function formatLogTimestamp(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusVariant(status) {
  switch (status) {
    case "success":
      return "success";
    case "failed":
      return "danger";
    case "pending":
      return "warning";
    default:
      return "default";
  }
}

function truncateText(text, maxLength = 120) {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function formatChannel(channel) {
  if (!channel) return "Unknown";

  switch (channel) {
    case "chatbot":
      return "Chatbot";
    case "web":
      return "Web";
    case "api":
      return "API";
    case "email":
      return "Email";
    case "whatsapp":
      return "WhatsApp";
    default:
      return channel;
  }
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortValue, setSortValue] = useState("time-desc");

  const { sortBy, sortOrder } = useMemo(() => {
    const [currentSortBy, currentSortOrder] = sortValue.split("-");
    return {
      sortBy: currentSortBy || "time",
      sortOrder: currentSortOrder || "desc",
    };
  }, [sortValue]);

  const fetchLogs = async ({ nextPage = 1, append = false } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data } = await apiClient.get("/logs", {
        params: {
          page: nextPage,
          limit: 20,
          sortBy,
          sortOrder,
        },
      });

      const nextLogs = data.logs || [];

      setLogs((current) => (append ? [...current, ...nextLogs] : nextLogs));
      setPage(data.page || nextPage);
      setTotal(data.total || 0);
      setHasMore(Boolean(data.hasMore));
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load logs");
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLogs({ nextPage: 1, append: false });
  }, [sortBy, sortOrder]);

  const handleRefresh = () => {
    fetchLogs({ nextPage: 1, append: false });
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchLogs({ nextPage: page + 1, append: true });
  };

  const columns = [
    {
      key: "agent",
      header: "Agent",
      render: (log) => (
        <div className="min-w-[120px]">
          <div className="font-medium text-[var(--color-text)]">
            {log.agentId?.name || "Agent"}
          </div>
        </div>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      render: (log) => (
        <span className="whitespace-nowrap text-sm text-[var(--color-muted)]">
          {formatChannel(log.channel)}
        </span>
      ),
    },
    {
      key: "input",
      header: "User Input",
      render: (log) => (
        <p className="max-w-[240px] text-sm text-[var(--color-muted)]">
          {truncateText(log.input)}
        </p>
      ),
    },
    {
      key: "output",
      header: "Agent Output",
      render: (log) => (
        <p className="max-w-[280px] text-sm text-[var(--color-muted)]">
          {truncateText(log.output)}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (log) => (
        <Badge variant={getStatusVariant(log.status)}>
          {log.status || "unknown"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Time",
      render: (log) => (
        <span className="whitespace-nowrap text-sm text-[var(--color-muted)]">
          {formatLogTimestamp(log.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Execution Logs
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Review recent agent runs, outcomes, channels, and timestamps across your workspace.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <span>Sort</span>
            <select
              value={sortValue}
              onChange={(event) => setSortValue(event.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="secondary"
            onClick={handleRefresh}
            isLoading={loading}
            leftIcon={!loading ? <RefreshCw size={16} /> : null}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="mb-6 border-rose-500/30">
          <CardContent className="flex items-start gap-3 py-4">
            <span className="rounded-full bg-rose-500/10 p-2 text-rose-400">
              <AlertCircle size={18} />
            </span>
            <div>
              <p className="font-medium text-[var(--color-text)]">Unable to load logs</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>All Activity</CardTitle>
            <CardDescription>
              {loading
                ? "Loading recent execution history..."
                : `Showing ${logs.length} of ${total} log entries`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="flex items-center gap-3 text-[var(--color-muted)]">
                <Spinner size="sm" />
                <span className="text-sm">Loading logs...</span>
              </div>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={logs}
                rowKey="_id"
                emptyText="No logs found yet. Run an agent or test chat to start building execution history."
              />

              {logs.length > 0 ? (
                <div className="mt-5 flex flex-col items-center gap-3">
                  {hasMore ? (
                    <Button
                      variant="secondary"
                      onClick={handleLoadMore}
                      isLoading={loadingMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading More..." : "More"}
                    </Button>
                  ) : (
                    <p className="text-sm text-[var(--color-muted)]">
                      You&apos;ve reached the end of your logs.
                    </p>
                  )}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
