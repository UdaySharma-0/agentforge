import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Moon, Sun, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useTheme } from "../../app/themeContext";
import { loginUser, loginWithGoogleUser } from "../../app/authSlice";
import { useToast } from "../../components/ui/ToastProvider";

const GOOGLE_OAUTH_CLIENT = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_OAUTH_CLIENT) {
  console.error("Missing VITE_GOOGLE_CLIENT_ID environment variable - Google OAuth will not work");
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await dispatch(loginUser(formData)).unwrap();
      showToast("Access Granted. Welcome back to the Forge.");
      navigate("/dashboard");
    } catch (error) {
      showToast(error.message || "Authentication Failed", { tone: "error" });
    }
  };

  useEffect(() => {
    let cancelled = false;
    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current || !GOOGLE_OAUTH_CLIENT) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_OAUTH_CLIENT,
        callback: async ({ credential }) => {
          try {
            await dispatch(loginWithGoogleUser(credential)).unwrap();
            showToast("Neural link established. Welcome!");
            navigate("/dashboard");
          } catch (error) {
            showToast("Google Authentication Failed", { tone: "error" });
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 200,
      });
      setIsGoogleReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initializeGoogle;
    script.onerror = () => console.error("Failed to load Google Sign-In library");
    document.body.appendChild(script);

    return () => { 
      cancelled = true;
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [dispatch, navigate, showToast, GOOGLE_OAUTH_CLIENT]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 transition-colors duration-500 overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/50 backdrop-blur-md text-[var(--color-muted)] transition-all hover:scale-110 active:scale-95"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo/Brand Area */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-[var(--color-text)]">
            AgentForge<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
            Enter your credentials to access the cluster.
          </p>
        </div>

        {/* Login Card */}
        <div className="feature-card border-none bg-[var(--color-card)]/40 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl rounded-[2.5rem]">
          {/* Tabs */}
          <div className="mb-8 flex border-b border-[var(--color-border)]">
            <button className="flex-1 border-b-2 border-primary pb-3 text-sm font-bold uppercase tracking-widest text-primary">
              Log In
            </button>
            <Link
              to="/register"
              className="flex-1 pb-3 text-center text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              Sign Up
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] ml-1">Work Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">Password</label>
                <Link to="/forgot" className="text-[10px] font-bold text-primary hover:underline">Lost Access?</Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Log In
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            {/* Privacy & Terms Policy - Restored */}
            <p className="px-2 text-center text-[10px] leading-relaxed font-medium text-[var(--color-muted)]">
              By continuing, you acknowledge AgentForge&apos;s{" "}
              <Link to="/terms" className="font-bold text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-bold text-primary hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-[var(--color-card)] px-3 text-[var(--color-muted)]">Social Uplink</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className={`relative flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-text)] transition hover:bg-white/5 ${!isGoogleReady && "opacity-50"}`}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
              Google
              <div ref={googleButtonRef} className="absolute inset-0 z-10 opacity-[0.01] cursor-pointer" />
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--color-text)] transition hover:bg-white/5">
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="h-4 w-4 dark:invert" alt="GitHub" />
              GitHub
            </button>
          </div>
        </div>

        {/* Bottom Tagline */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] opacity-40">
          Agent Forge Protocol v4.0.2 Stable
        </p>
      </div>
    </div>
  );
}