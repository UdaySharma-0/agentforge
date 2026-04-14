import { Link, useNavigate } from "react-router-dom";
import PublicTopbar from "../components/layout/PublicTopbar";
import {
  Globe,
  FileUp,
  UserCog,
  MessageSquare,
  Zap,
  ShieldCheck,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function Features() {
  const navigate = useNavigate();

  const coreFeatures = [
    {
      title: "Smart Knowledge Ingestion",
      desc: "Automatically scrape your business website or upload PDF, DOCX, and TXT files to give your agent instant expertise.",
      icon: <Globe className="text-indigo-400" size={24} />,
    },
    {
      title: "Dynamic Persona Definition",
      desc: "Tailor your agent's tone, response length, and behavior to match your brand's unique voice and personality.",
      icon: <UserCog className="text-indigo-400" size={24} />,
    },
    {
      title: "Real-Time Sandbox Testing",
      desc: "Interact with your agent in a secure test lab to verify its knowledge and behavior before going live.",
      icon: <MessageSquare className="text-indigo-400" size={24} />,
    },
  ];

  const deploymentChannels = [
    { name: "WhatsApp Business", status: "Available" },
    { name: "Website Widget", status: "Available" },
    { name: "Gmail Integration", status: "Available" },
    { name: "Slack & Discord", status: "Coming Soon" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-indigo-500/30">
      <PublicTopbar active="features" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-20 pt-32 text-center md:px-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="mb-4 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            The Forge Protocol
          </span>
          <h1 className="mb-6 text-4xl font-black tracking-tighter md:text-6xl lg:text-7xl">
            Don’t build a chatbot. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">
              Deploy intelligence.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-[var(--color-muted)] leading-relaxed">
            The easiest way to ingest business data, define a persona, and
            deploy a custom neural agent anywhere your customers are.
          </p>
        </div>
      </section>

      {/* Step-by-Step Core Tech */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {coreFeatures.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)]/50 p-8 transition-all hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <div className="text-[10px] font-black text-indigo-500/40 uppercase mb-2 tracking-widest">
                  Phase 0{idx + 1}
                </div>
                <h2 className="mb-3 text-xl font-bold tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--color-muted)] font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Integration Status Grid */}
          <div className="rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 p-8 md:p-12 relative overflow-hidden group">
            {/* Subtle Background Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
              {/* Text Content */}
              <div className="max-w-md text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                  Multi-Channel Deployment
                </h3>
                <p className="text-sm md:text-base text-[var(--color-muted)] font-medium leading-relaxed">
                  Authorise and deploy your unit to any channel in one click. We
                  handle the infrastructure, you handle the growth.
                </p>
              </div>

              {/* Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-[480px]">
                {deploymentChannels.map((channel) => (
                  <div
                    key={channel.name}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4 transition-all duration-300 hover:border-indigo-500/30 hover:bg-indigo-500/5"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Status Dot */}
                      <div
                        className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px] ${
                          channel.status === "Available"
                            ? "bg-emerald-500 shadow-emerald-500/50"
                            : "bg-white/20 shadow-transparent"
                        }`}
                      />
                      <span className="text-xs font-bold text-gray-200 tracking-wide">
                        {channel.name}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border ${
                        channel.status === "Available"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                          : "bg-white/5 border-white/10 text-white/30"
                      }`}
                    >
                      {channel.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Highlight */}
      <section className="px-6 py-10 text-center">
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-[var(--color-border)] p-10">
          <Zap className="mx-auto mb-4 text-indigo-500 opacity-50" size={32} />
          <h3 className="text-lg font-bold mb-2">Visual Workflow Editor</h3>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            We are currently building a node-based logic engine for complex
            multi-agent workflows.
          </p>
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            Coming in v4.2
          </span>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-14 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="mb-4 text-2xl font-black tracking-tighter">
              AgentForge<span className="text-indigo-500">.</span>
            </h3>
            <p className="text-sm font-medium text-[var(--color-muted)] max-w-xs leading-relaxed">
              Building the easiest way to deploy intelligence anywhere.
              Simplified RAG and multi-channel deployment for modern teams.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-2 text-sm font-bold text-[var(--color-muted)]">
              <li
                className="cursor-pointer hover:text-indigo-400 transition-colors"
                onClick={() => navigate("/features")}
              >
                Features
              </li>
              <li
                className="cursor-pointer hover:text-indigo-400 transition-colors"
                onClick={() => navigate("/docs")}
              >
                Docs
              </li>
              <li className="cursor-pointer hover:text-indigo-400 transition-colors">
                Security
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-black uppercase tracking-widest">
              Legal
            </h4>
            <ul className="space-y-2 text-sm font-bold text-[var(--color-muted)]">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-50">
            © 2026 AgentForge AI Cluster. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400/60">
            <ShieldCheck size={12} /> Encrypted Session
          </div>
        </div>
      </footer>
    </div>
  );
}
