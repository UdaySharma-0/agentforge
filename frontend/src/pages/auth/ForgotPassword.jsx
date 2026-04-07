import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useTheme } from "../../app/themeContext";
import PublicTopbar from "../../components/layout/PublicTopbar";

export default function ForgotPassword() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PublicTopbar />

      <div className="flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-xl sm:p-10">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-indigo-500">
            <Mail size={20} />
          </div>

          <h1 className="text-3xl font-semibold text-[var(--color-text)]">
            Password reset
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Self-service password reset is not wired up yet in this build. Your
            sign-in flow still works normally, and this page prevents the app from
            routing to a missing screen.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            If you need access right away, use the account you originally signed up
            with or have an admin reset the password directly from the backend.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>

            <Link
              to={theme === "dark" ? "/privacy" : "/terms"}
              className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-hover)]"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
