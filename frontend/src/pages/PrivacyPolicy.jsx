import { Link } from "react-router-dom";
import PublicTopbar from "../components/layout/PublicTopbar";
import { ShieldCheck, Lock, Eye, Database, Share2, MessageCircle } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    icon: <Database size={20} className="text-primary" />,
    body: "AgentForge may collect account details such as your name, email address, and basic workspace information when you create an account or interact with the product.",
  },
  {
    title: "How We Use Information",
    icon: <Eye size={20} className="text-primary" />,
    body: "We use this information to provide the app, secure accounts, improve platform reliability, communicate service updates, and support the features you choose to enable.",
  },
  {
    title: "Data Security",
    icon: <Lock size={20} className="text-primary" />,
    body: "We work to protect your information with reasonable technical and organizational safeguards. No internet-based system can be guaranteed perfectly secure, so please use strong credentials and protect account access.",
  },
  {
    title: "Third-Party Services",
    icon: <Share2 size={20} className="text-primary" />,
    body: "AgentForge may rely on third-party providers for infrastructure, analytics, authentication, and integrations. Those providers may process limited data as needed to deliver their services.",
  },
  {
    title: "Your Choices",
    icon: <ShieldCheck size={20} className="text-primary" />,
    body: "You can review or update your account details through the app where available. If you need help with privacy-related questions, contact the AgentForge team through your normal support channel.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-primary/30">
      <PublicTopbar />

      <main className="relative px-6 pb-24 pt-32 md:px-10">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Header Hero Area */}
          <div className="mb-12 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-card)]/60 p-8 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 md:p-16">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">
              <ShieldCheck size={14} /> Security Protocol
            </div>
            <h1 className="text-4xl font-black tracking-tighter md:text-6xl text-[var(--color-text)]">
              Privacy Policy<span className="text-primary">.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] font-medium md:text-lg">
              Transparency is at the core of AgentForge. This policy outlines how we 
              collect, index, and safeguard your data within the neural cluster.
            </p>
            <div className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-60">
              <span>Version 4.0.2</span>
              <span className="h-1 w-1 rounded-full bg-[var(--color-border)]" />
              <span>Effective: April 2, 2026</span>
            </div>
          </div>

          {/* Policy Sections */}
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

            {/* Contact / CTA Section */}
            <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 md:p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary mb-6">
                <MessageCircle size={24} />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-4">Questions regarding data?</h2>
              <p className="mx-auto max-w-xl leading-relaxed text-[var(--color-muted)] font-medium mb-8">
                Our security team is ready to assist with any neural compliance or 
                privacy-related inquiries.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
                >
                  Back to Login
                </Link>
                <Link
                  to="/terms"
                  className="w-full sm:w-auto rounded-2xl border border-[var(--color-border)] bg-transparent px-8 py-4 text-xs font-black uppercase tracking-widest text-[var(--color-muted)] transition-all hover:bg-white/5"
                >
                  View Terms
                </Link>
              </div>
            </section>
          </div>
          
          {/* Bottom Branding */}
          <div className="mt-16 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--color-muted)] opacity-30">
               Agent Forge AI Cluster • Data integrity verified
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}