import { ArrowLeft, Menu, Moon, Search, Sun, ChevronRight, Command } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../app/themeContext";

const titleByPath = {
  "/dashboard": "Dashboard",
  "/agents": "Agents",
  "/agents/knowledge": "Knowledge Base",
  "/agents/knowledge/add": "Add Knowledge",
  "/workflows": "Workflows",
  "/channels": "Channels",
  "/chat": "Chat Tester",
  "/logs": "Logs",
  "/docs": "Documentation",
  "/settings": "Settings",
};

function titleFromPath(pathname) {
  if (/^\/agents\/[^/]+\/knowledge\/add(?:\/|$)/.test(pathname)) {
    return "Add Knowledge";
  }
  if (/^\/agents\/[^/]+\/knowledge(?:\/|$)/.test(pathname)) {
    return "Knowledge Base";
  }

  return (
    titleByPath[pathname] ||
    Object.entries(titleByPath).find(([path]) => pathname.startsWith(path))?.[1] ||
    ""
  );
}

function buildBreadcrumbs(pathname) {
  const normalized = pathname.split("?")[0].split("#")[0] || "/";
  if (normalized === "/") return [{ label: "Home", to: "/" }];

  const segments = normalized.split("/").filter(Boolean);
  const crumbs = [];

  let current = "";
  for (const segment of segments) {
    current += `/${segment}`;
    const mapped = titleByPath[current];

    let label = mapped;
    if (!label) {
      if (segment === "create") label = "Create";
      else if (segment === "edit") label = "Edit";
      else if (segment === "test") label = "Test";
      else if (segment === "behavior") label = "Behavior";
      else if (segment === "knowledge") label = "Knowledge";
      else if (/^[a-f0-9]{12,}$/i.test(segment)) label = "Detail";
      else label = segment.replace(/[-_]/g, " ");
    }

    crumbs.push({ label, to: current });
  }

  const sectionTitle = titleFromPath(normalized);
  if (sectionTitle && crumbs.length > 0) {
    const basePath =
      Object.keys(titleByPath).find((p) => normalized.startsWith(p)) || crumbs[0].to;
    crumbs[0] = { label: sectionTitle, to: basePath };
  }

  return crumbs;
}

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = useSelector((state) => state.auth.user);

  const activeTitle = titleFromPath(location.pathname) || "AgentForge";
  const breadcrumbs = buildBreadcrumbs(location.pathname);
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;
  
  // Get user initials from name
  const getInitials = (name) => {
    if (!name) return "AF";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md transition-all dark:border-slate-800/60 dark:bg-slate-950/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
        
        {/* Left Section: Navigation & Titles */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-indigo-500 hover:text-white dark:bg-slate-800/50 dark:text-slate-400 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={20} className="transition-transform group-active:scale-90" />
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={!canGoBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-indigo-500/30 hover:text-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex min-w-0 flex-col justify-center">
            <h2 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
              {activeTitle}
            </h2>
            
            {breadcrumbs.length ? (
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 overflow-hidden text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-500"
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <span key={crumb.to} className="flex items-center gap-1.5">
                      {index > 0 && <ChevronRight size={10} className="opacity-40" />}
                      {isLast ? (
                        <span className="truncate text-indigo-500 dark:text-indigo-400/80">{crumb.label}</span>
                      ) : (
                        <Link
                          to={crumb.to}
                          className="truncate transition-colors hover:text-slate-900 dark:hover:text-slate-200"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </nav>
            ) : null}
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Search Input */}
          <div className="group hidden h-10 w-64 items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3 transition-all hover:border-indigo-500/30 hover:bg-white focus-within:border-indigo-500/30 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus-within:bg-slate-900 md:flex">
            <div className="flex flex-1 items-center gap-2.5 text-slate-400 transition-colors group-hover:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400">
              <Search size={16} className="shrink-0" />
              <input 
                type="text" 
                placeholder="Search actions..." 
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200" 
              />
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <Command size={10} /> K
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-indigo-500/30 hover:text-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={18} className="transition-transform group-hover:rotate-45" />
            ) : (
              <Moon size={18} className="transition-transform group-hover:-rotate-12" />
            )}
          </button>

          {/* User Profile Overlay */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Hello, {user?.fullName || user?.name || "User"}</span>
              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-tighter">{user?.planType || user?.plan || "Free Plan"}</span>
            </div>
            <div className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 ring-2 ring-white transition-transform hover:scale-105 active:scale-95 dark:ring-slate-950">
              {getInitials(user?.fullName || user?.name)}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}