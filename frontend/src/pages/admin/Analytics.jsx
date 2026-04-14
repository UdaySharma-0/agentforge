import { useEffect, useState } from "react";
import { Activity, Bot, FileText, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
} from "../../components/ui";
import { getAnalytics } from "../../services/adminApi";

const metrics = [
  { key: "usersCount", label: "Users", icon: Users, accent: "text-sky-500" },
  { key: "agentsCount", label: "Agents", icon: Bot, accent: "text-indigo-500" },
  { key: "workflowsCount", label: "Workflows", icon: Activity, accent: "text-emerald-500" },
  { key: "logsCount", label: "Logs", icon: FileText, accent: "text-amber-500" },
];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAnalytics();
        setAnalytics(response.data || null);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.key} className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="mt-3 text-3xl">
                    {loading ? "--" : analytics?.[metric.key] ?? 0}
                  </CardTitle>
                </div>
                <div className={`rounded-2xl border border-current/10 bg-current/5 p-3 ${metric.accent}`}>
                  <Icon size={20} />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>Workspace analytics snapshot</CardTitle>
          <CardDescription>
            Read-only overview of platform-wide counts from the backend analytics endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[140px] items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Spinner size="sm" />
              <span className="text-sm">Loading analytics...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {metrics.map((metric) => (
                <div
                  key={metric.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {analytics?.[metric.key] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
