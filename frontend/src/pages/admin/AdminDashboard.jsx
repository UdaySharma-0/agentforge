import { useEffect, useState } from "react";
import {
  Activity,
  Bot,
  FileText,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Spinner,
} from "../../components/ui";
import { getDashboardStats } from "../../services/adminApi";

const statCards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: UsersIcon,
    accent: "text-sky-500",
  },
  {
    key: "totalAgents",
    label: "Total Agents",
    icon: Bot,
    accent: "text-indigo-500",
  },
  {
    key: "totalWorkflows",
    label: "Total Workflows",
    icon: Activity,
    accent: "text-emerald-500",
  },
  {
    key: "totalLogs",
    label: "Total Logs",
    icon: FileText,
    accent: "text-amber-500",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getDashboardStats();
        setStats(response.data || null);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.key} className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-3 text-3xl">
                    {loading ? "--" : stats?.[card.key] ?? 0}
                  </CardTitle>
                </div>
                <div className={`rounded-2xl border border-current/10 bg-current/5 p-3 ${card.accent}`}>
                  <Icon size={20} />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>Admin posture</CardTitle>
          <CardDescription>
            Quick view into workspace-wide activity and governance controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[160px] items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Spinner size="sm" />
              <span className="text-sm">Loading workspace metrics...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Role enforcement
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Admin-only backend protection remains active.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Use the Users page to promote or demote members without touching the existing auth flow.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Agent oversight
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalAgents ?? 0}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Total agents visible across all workspace owners.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Workflow inventory
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalWorkflows ?? 0}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Current workflows tracked in the platform.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
