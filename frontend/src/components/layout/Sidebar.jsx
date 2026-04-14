import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenText,
  Bot,
  Cable,
  ChartColumnBig,
  FileText,
  LogOut,
  MessageSquareText,
  Settings,
  Waypoints,
  X,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { useToast } from "../ui/ToastProvider";
import { performLogout } from "../../utils/logout";
import { cn } from "./../ui/utils"; 

const BASE_ACTIVITY_ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: ChartColumnBig },
  { id: "agents", label: "Agents", to: "/agents", icon: Bot },
  { id: "knowledge", label: "Knowledge Base", to: "/agents/knowledge", icon: BookOpenText },
  { id: "workflows", label: "Workflows", to: "/workflows", icon: Waypoints },
  { id: "chat", label: "Chat Tester", to: "/chat", icon: MessageSquareText },
  { id: "channels", label: "Channels", to: "/channels", icon: Cable },
  { id: "logs", label: "Logs", to: "/logs", icon: FileText },
  { id: "settings", label: "Settings", to: "/settings", icon: Settings },
];

function matchActiveItem(pathname) {
  if (pathname.startsWith("/agents/knowledge") || /^\/agents\/[^/]+\/knowledge(?:\/|$)/.test(pathname)) return "knowledge";
  if (pathname.startsWith("/agents")) return "agents";
  if (pathname.startsWith("/workflows")) return "workflows";
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/logs")) return "logs";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/channels")) return "channels";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return null;
}

function MainNavList({ onNavigate, isAdmin }) {
  const groups = [
    {
      title: "Main",
      links: [
        { label: "Dashboard", to: "/dashboard", icon: ChartColumnBig },
        { label: "Agents", to: "/agents", icon: Bot },
        { label: "Knowledge Base", to: "/agents/knowledge", icon: BookOpenText },
        { label: "Workflows", to: "/workflows", icon: Waypoints },
      ],
    },
    {
      title: "Operations",
      links: [
        { label: "Channels", to: "/channels", icon: Cable },
        { label: "Chat Tester", to: "/chat", icon: MessageSquareText },
        { label: "Logs", to: "/logs", icon: FileText },
      ],
    },
    {
      title: "System",
      links: [
        { label: "Documentation", to: "/docs", icon: BookOpenText },
        { label: "Settings", to: "/settings", icon: Settings },
        ...(isAdmin
          ? [{ label: "Admin Panel", to: "/admin", icon: LayoutDashboard }]
          : []),
      ],
    },
  ];

  return (
    <nav className="space-y-7 py-4 no-scrollbar">
      {groups.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-500">
            {section.title}
          </p>
          <div className="space-y-1 px-2">
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )
                  }
                >
                  <Icon size={18} className="shrink-0 opacity-70 group-hover:opacity-100" />
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight size={14} className="opacity-0 transition-all -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0" />
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function LogoutButton({ compact = false, isPending, isRippling, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "logout-glow-btn relative overflow-hidden transition-all duration-300",
        "border border-slate-200 dark:border-slate-800",
        compact 
          ? "flex h-12 w-full items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/50" 
          : "flex w-full items-center rounded-2xl p-3 bg-white dark:bg-slate-900/40 shadow-sm hover:shadow-md",
        isRippling && "logout-ripple-active"
      )}
    >
      <div className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
        compact ? "h-9 w-9 bg-rose-500/10 border-rose-500/20 text-rose-500" : "h-10 w-10 bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
      )}>
        <LogOut size={compact ? 16 : 18} />
      </div>
      {!compact && (
        <div className="ml-3 flex flex-col text-left">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{isPending ? "Exiting..." : "Log out"}</span>
          <span className="text-[11px] font-medium text-slate-500">Secure session end</span>
        </div>
      )}
    </button>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { showToast } = useToast();

  const routeActive = useMemo(() => matchActiveItem(location.pathname), [location.pathname]);
  const [active, setActive] = useState(routeActive);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutRippling, setIsLogoutRippling] = useState(false);
  const isAdmin = user?.role === "admin";
  const activityItems = useMemo(
    () =>
      isAdmin
        ? [...BASE_ACTIVITY_ITEMS, { id: "admin", label: "Admin Panel", to: "/admin", icon: LayoutDashboard }]
        : BASE_ACTIVITY_ITEMS,
    [isAdmin],
  );

  useEffect(() => { if (routeActive) setActive(routeActive); }, [routeActive]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsLogoutRippling(true);
    await performLogout(dispatch);
    showToast("You've logged out. See you soon!");
    onClose?.();
    navigate("/login", { replace: true });
  };

  const onActivityClick = (id) => {
    if (active === id) { setActive(null); onClose?.(); return; }
    setActive(id);
    const item = activityItems.find((x) => x.id === id);
    if (item?.to) navigate(item.to);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm lg:hidden transition-all"
            onClick={onClose}
            aria-label="Close sidebar"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 h-screen lg:static lg:h-full flex transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full w-16 flex-col items-center border-r border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-950 transition-colors">
          <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-shadow">
            <Bot size={22} className="text-white" />
          </div>
          <nav className="flex w-full flex-1 flex-col gap-2 px-2">
            {activityItems.map((item) => {
              const Icon = item.icon;
              const isSelected = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onActivityClick(item.id)}
                  className={cn(
                    "group relative flex h-12 w-full items-center justify-center rounded-xl transition-all duration-200",
                    isSelected 
                      ? "bg-indigo-500/10 text-indigo-400 dark:bg-indigo-600/20 dark:text-indigo-300" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-100"
                  )}
                >
                  <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                  {isSelected && <div className="absolute -left-2 h-6 w-1 rounded-r-full bg-indigo-500 shadow-[4px_0_12px_rgba(79,70,229,0.5)]" />}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto w-full px-2">
            <LogoutButton compact isPending={isLoggingOut} isRippling={isLogoutRippling} onClick={handleLogout} />
          </div>
        </div>

        <div className={cn(
          "h-full overflow-hidden border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-all duration-300",
          active && active !== "workflows" ? "w-[280px]" : "w-0"
        )}>
          <div className="flex h-full w-[280px] flex-col">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/60 px-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                  {activityItems.find(i => i.id === active)?.label || "Navigation"}
                </p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-500">Agent Forge</p>
              </div>
              <button onClick={() => { setActive(null); onClose?.(); }} className="rounded-full p-1.5 text-slate-500 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-100">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <MainNavList onNavigate={() => onClose?.()} isAdmin={isAdmin} />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800/60 p-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="mb-4 rounded-xl bg-indigo-100 dark:bg-indigo-500/5 p-3 border border-indigo-300 dark:border-indigo-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-200 uppercase tracking-tighter">Pro Workspace</span>
                </div>
                <div className="h-1 w-full rounded-full bg-indigo-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full w-[70%] bg-indigo-500 dark:bg-indigo-500" />
                </div>
              </div>
              <LogoutButton isPending={isLoggingOut} isRippling={isLogoutRippling} onClick={handleLogout} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
