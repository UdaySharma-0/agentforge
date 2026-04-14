import { NavLink } from "react-router-dom";
import { BarChart3, LayoutDashboard, Shield, Users } from "lucide-react";
import { Card } from "../ui";
import { cn } from "../ui/utils";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/agents", label: "Agents", icon: Shield },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  return (
    <div className="space-y-8 pb-10">
      <div className="rounded-[28px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.9))] p-6 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_38%),linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.78))]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">
              Admin Console
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Workspace control center
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Monitor the full Agent Forge workspace, manage users safely, and handle system-wide agents without affecting member flows.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {adminLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink key={link.to} to={link.to} end={link.end}>
                  {({ isActive }) => (
                    <Card
                      className={cn(
                        "min-w-[160px] rounded-2xl border px-4 py-4 transition-all duration-200",
                        isActive
                          ? "border-indigo-500/30 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-slate-200/70 bg-white/80 hover:border-indigo-400/30 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl border",
                            isActive
                              ? "border-indigo-500/20 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                              : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400",
                          )}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {link.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Admin view
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
