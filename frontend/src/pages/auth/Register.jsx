import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, User, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../utils/constants";
import { useTheme } from "../../app/themeContext";
import { useToast } from "../../components/ui/ToastProvider";

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Registration failed", { tone: "error" });
        return;
      }
      showToast("Account created successfully. You can sign in now!");
      navigate("/login");
    } catch {
      showToast("Server error", { tone: "error" });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 transition-colors duration-500 overflow-hidden sm:px-6 lg:px-8">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/50 backdrop-blur-md text-[var(--color-muted)] transition-all hover:scale-110 active:scale-95 sm:right-6 sm:top-6"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative z-10 w-full max-w-[440px] space-y-8 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-card)]/60 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 transition-all sm:p-10">
        
        {/* Header */}
        <div className="text-left">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            Join AgentForge AI
          </h2>
          <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
            Start building your intelligent agent workforce today.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex border-b border-[var(--color-border)]">
          <Link to="/login" className="flex-1 pb-3 text-center text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
            Log In
          </Link>
          <button className="flex-1 border-b-2 border-primary pb-3 text-center text-sm font-bold uppercase tracking-widest text-primary">
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
              Full Name
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-primary transition-colors">
                <User size={16} />
              </span>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none ring-primary/20 transition-all focus:ring-4 placeholder:opacity-30"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
              Work Email
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-primary transition-colors">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none ring-primary/20 transition-all focus:ring-4 placeholder:opacity-30"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
              Password
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-primary transition-colors">
                <Lock size={16} />
              </span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none ring-primary/20 transition-all focus:ring-4 placeholder:opacity-30"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Create Free Account
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>

          <p className="px-2 text-center text-[10px] font-medium leading-relaxed text-[var(--color-muted)]">
            By creating an account, you agree to AgentForge&apos;s{" "}
            <Link to="/terms" className="font-bold text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-bold text-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </form>

        <p className="text-center text-sm font-medium text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>

        {/* Footer Links */}
        <div className="mt-10 flex justify-center text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-muted)] opacity-40">
          <span>Copyright 2026 AgentForge AI Inc.</span>
        </div>
      </div>
    </div>
  );
}