import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicTopbar from "../../components/layout/PublicTopbar";
import { 
  BookOpen, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Database, 
  ArrowRight 
} from "lucide-react";

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-primary/30">
      <PublicTopbar active="docs" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-20 pt-32 text-center md:px-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <BookOpen size={14} /> Knowledge Core
          </div>
          <h1 className="mb-6 text-4xl font-black tracking-tighter md:text-6xl lg:text-7xl">
            AgentForge <span className="text-[var(--color-muted)]">Documentation.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-[var(--color-muted)] leading-relaxed">
            Understand the neural architecture, ingestion protocols, and multi-channel 
            deployment workflows powering your AI workforce.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-6 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-2">
          
          <DocCard 
            title="System Overview" 
            icon={<Layers size={20} />}
            badge="Fundamentals"
          >
            AgentForge is a production-grade framework designed to bridge the gap between 
            raw AI models and business utility. It operates on a three-tier architecture: 
            <strong> Ingestion</strong> (Data), <strong>Calibration</strong> (Persona), 
            and <strong>Distribution</strong> (Channels).
          </DocCard>

          <DocCard 
            title="Neural Execution Flow" 
            icon={<Zap size={20} />}
            badge="Runtime"
          >
            
            <ul className="mt-4 space-y-3">
              <FlowItem step="01" text="User input is intercepted by the chosen Channel node." />
              <FlowItem step="02" text="Vector engine queries the agent's ingested knowledge base." />
              <FlowItem step="03" text="The Persona layer applies tone and behavioral constraints." />
              <FlowItem step="04" text="Response is delivered and session logs are indexed." />
            </ul>
          </DocCard>

          <DocCard 
            title="Knowledge Ingestion" 
            icon={<Database size={20} />}
            badge="Data Layer"
          >
            Units can be trained using two primary protocols:
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Web Scraping</p>
                <p className="text-xs text-[var(--color-muted)]">Provide a URL to index entire business sites into the agent's memory.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">File Ingestion</p>
                <p className="text-xs text-[var(--color-muted)]">Directly upload PDF, DOCX, or TXT files for manual context training.</p>
              </div>
            </div>
          </DocCard>

          <DocCard 
            title="Security Protocols" 
            icon={<ShieldCheck size={20} />}
            badge="Compliance"
          >
            Every uplink is protected by the Forge Security Layer:
            <ul className="mt-4 ml-2 space-y-2 text-xs font-medium text-[var(--color-muted)]">
              <li className="flex items-center gap-2"><ArrowRight size={12} className="text-primary" /> JWT-based authentication for all API endpoints.</li>
              <li className="flex items-center gap-2"><ArrowRight size={12} className="text-primary" /> Encrypted storage for channel access tokens (Meta/Google).</li>
              <li className="flex items-center gap-2"><ArrowRight size={12} className="text-primary" /> Isolated neural environments for workspace data.</li>
            </ul>
          </DocCard>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-14 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-2xl font-black tracking-tighter">AgentForge<span className="text-primary">.</span></h3>
            <p className="text-sm font-medium text-[var(--color-muted)] max-w-xs leading-relaxed">
              Deploying intelligence anywhere. The easiest framework for business-ready AI agents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--color-text)]">Platform</h4>
              <ul className="space-y-2 text-sm font-bold text-[var(--color-muted)]">
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate("/features")}>Features</li>
                <li className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate("/docs")}>Documentation</li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-black uppercase tracking-widest text-[var(--color-text)]">Resources</h4>
              <ul className="space-y-2 text-sm font-bold text-[var(--color-muted)]">
                <li><Link to="/features" className="hover:text-primary transition-colors">Changelog</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-50">
            © 2026 AgentForge AI. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
             <ShieldCheck size={12} /> Verification: Active
          </div>
        </div>
      </footer>
    </div>
  );
}

function DocCard({ title, icon, badge, children }) {
  return (
    <div className="group rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)]/50 p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-colors">
          {badge}
        </span>
      </div>
      <h2 className="mb-3 text-2xl font-black tracking-tight text-[var(--color-text)]">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-[var(--color-muted)] font-medium">
        {children}
      </div>
    </div>
  );
}

function FlowItem({ step, text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-[10px] font-black text-primary/40 mt-1">{step}</span>
      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-tight leading-relaxed">{text}</p>
    </li>
  );
}