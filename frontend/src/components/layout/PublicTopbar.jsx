import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  Mail,
  Globe,
  Home,
  Zap,
  Shield,
  Cpu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../app/themeContext";
import { cn } from "./../ui/utils";

export default function PublicTopbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const integrations = [
    {
      name: "WhatsApp",
      desc: "Automate chat workflows",
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Email",
      desc: "AI-powered responses",
      icon: Mail,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Website",
      desc: "Embeddable concierge",
      icon: Globe,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const navLinks = [
    { name: "Home", path: "/"},
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "Documentation", path: "/docs" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    // Change the Nav wrapper class to this:
    <nav
      className={cn(
        "fixed top-0 z-[100] w-full transition-all duration-500 px-6",
        scrolled ? "top-4" : "top-0 py-2",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between transition-all duration-500",
          scrolled
            ? "rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-xl px-4 py-2 shadow-lg dark:border-white/10 dark:bg-slate-950/60"
            : "bg-transparent py-4 px-0",
        )}
      >
        {/* Logo Section */}
        <div
          onClick={() => navigate("/")}
          className="group flex cursor-pointer items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition-transform group-hover:scale-110">
            <Zap size={20} fill="currentColor" />
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-lg group-hover:blur-xl transition-all"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            AgentForge
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={()=>navigate(link.path)}
              className={cn(
                "relative px-4 py-2 text-sm font-semibold transition-all",
                isActive(link.path)
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              {link.name}
            </button>
          ))}

          {/* Enhanced Integrations Dropdown */}
          <div className="group relative">
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-400 transition-colors">
              Integrations
              <ChevronDown
                size={14}
                className="transition-transform group-hover:rotate-180"
              />
            </button>

            <div className="absolute -left-20 top-full pt-4 opacity-0 translate-y-4 pointer-events-none transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
              <div className="w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl backdrop-blur-2xl">
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">
                    Ready to deploy
                  </p>
                  {integrations.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => navigate("/login")}
                      className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all hover:bg-white/5"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          item.bg,
                        )}
                      >
                        <item.icon size={20} className={item.color} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="bg-white/5 p-3">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                    Upcoming 50+ Integrations <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => navigate("/login")}
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay Style */}
      <div
        className={cn(
          "absolute left-6 right-6 top-full mt-4 origin-top rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl transition-all duration-300 lg:hidden",
          isMenuOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                navigate(link.path);
                setIsMenuOpen(false);
              }}
              className={cn(
                "flex items-center gap-4 rounded-xl p-4 text-left text-lg font-bold transition-colors hover:bg-white/5",
                isActive(link.path)
                  ? "text-indigo-500 bg-indigo-500/5"
                  : "text-white",
              )}
            >
              {link.name}
            </button>
          ))}
          <hr className="border-white/5" />
          <button className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg">
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}
