import { Link } from "react-router-dom";
import PublicTopbar from "../components/layout/PublicTopbar";
import { 
  ShieldAlert, 
  UserCheck, 
  Scale, 
  RefreshCw, 
  FileCode, 
  HelpCircle,
  ArrowRight
} from "lucide-react";

const sections = [
  {
    title: "Using AgentForge",
    icon: <UserCheck size={20} className="text-primary" />,
    body: "You may use AgentForge only in compliance with applicable laws and these terms. You are responsible for activity performed through your account and workspace.",
  },
  {
    title: "Accounts and Access",
    icon: <ShieldAlert size={20} className="text-primary" />,
    body: "Keep your login credentials secure and accurate. You are responsible for maintaining access controls for your users, integrations, and any connected services.",
  },
  {
    title: "Acceptable Use",
    icon: <Scale size={20} className="text-primary" />,
    body: "You may not use AgentForge to violate laws, infringe rights, distribute malicious content, abuse third-party systems, or interfere with the stability or security of the platform.",
  },
  {
    title: "Platform Availability",
    icon: <RefreshCw size={20} className="text-primary" />,
    body: "We may update, improve, or modify the service over time. We aim for reliable operation, but availability and specific features may change as the product evolves.",
  },
  {
    title: "Intellectual Property",
    icon: <FileCode size={20} className="text-primary" />,
    body: "AgentForge and its product materials remain the property of their respective owners. You retain rights to content you submit, subject to the permissions needed for us to operate the service.",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-primary/30">
      <PublicTopbar />

      <main className="relative px-6 pb-24 pt-32 md:px-10">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Header Hero Area */}
          <div className="mb-12 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-card)]/60 p-8 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 md:p-16">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">
              <Scale size={14} /> Usage Protocol
            </div>
            <h1 className="text-4xl font-black tracking-tighter md:text-6xl text-[var(--color-text)]">
              Terms of Service<span className="text-primary">.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] font-medium md:text-lg">
              The foundational rules for interacting with the AgentForge cluster. 
              Designed for clarity and operational integrity.
            </p>
            <div className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-60">
              <span>Revision 4.0.2</span>
              <span className="h-1 w-1 rounded-full bg-[var(--color-border)]" />
              <span>Effective: April 2, 2026</span>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <section
                key={section.title}
                className="group rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/40 p-8 transition-all hover:bg-[var(--color-card)] hover:border-primary/30"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
                    {section.title}
                  </h2>
                </div>
                <p className="leading-relaxed text-[var(--color-muted)] font-medium text-sm md:text-base">
                  {section.body}
                </p>
              </section>
            ))}

            {/* Questions / CTA Section */}
            <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 md:p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary mb-6">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-4">Need clarification?</h2>
              <p className="mx-auto max-w-xl leading-relaxed text-[var(--color-muted)] font-medium mb-8">
                Our support team is available to explain our operational protocols 
                and terms in detail.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="group w-full sm:w-auto rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                >
                  Create an Account
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/privacy"
                  className="w-full sm:w-auto rounded-2xl border border-[var(--color-border)] bg-transparent px-8 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-muted)] transition-all hover:bg-white/5"
                >
                  Privacy Policy
                </Link>
              </div>
            </section>
          </div>
          
          {/* Bottom Branding */}
          <div className="mt-16 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--color-muted)] opacity-30">
               Agent Forge AI Cluster • Legal Framework v4.0
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}