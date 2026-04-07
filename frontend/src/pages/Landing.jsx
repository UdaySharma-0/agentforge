import { Link, useNavigate } from "react-router-dom";
import {
  Cpu,
  GitBranch,
  MessageSquare,
  Activity,
  Layers,
  ShieldCheck,
  ArrowRight,
  Zap,
  Code2,
} from "lucide-react";
import PublicTopbar from "../components/layout/PublicTopbar";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

const handleMouseMove = (e) => {
  const card = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - card.left;
  const y = e.clientY - card.top;
  const centerX = card.width / 2;
  const centerY = card.height / 2;
  
  // Adjust the '20' to make it more or less sensitive
  const rotateX = (y - centerY) / 20; 
  const rotateY = (centerX - x) / 20;

  setRotate({ x: rotateX, y: rotateY });
};

const resetRotate = () => {
  setRotate({ x: 0, y: 0 });
};

  return (
    <div className="bg-(--color-bg) text-(--color-text) selection:bg-indigo-500/30 overflow-x-hidden">
      <PublicTopbar active="home" />

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-10 overflow-hidden">
  {/* Performance-friendly background */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-500/[0.03] to-transparent" />

  <div className="mx-auto max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-10">
    
    {/* Left Column: Text Content */}
    <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col justify-center">
      <div className="mb-6 inline-flex w-fit mx-auto lg:mx-0 items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
        <Zap size={12} className="mr-2" />
        <span>v2.0 Orchestration</span>
      </div>

      {/* Adjusted text sizes: text-4xl on mobile, text-6xl on medium, text-7xl on large */}
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] text-slate-900 dark:text-white">
        Forge AI Workflows <br />
        <span className="bg-linear-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Without Writing Code
        </span>
      </h1>

      <p className="mx-auto lg:mx-0 mb-5 max-w-lg text-base text-slate-600 dark:text-slate-400 md:text-xl leading-relaxed font-medium">
        Don’t build a chatbot. Build the easiest way to deploy intelligence anywhere.
      </p>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
        <button
          onClick={() => navigate("/login")}
          className="group flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-lg font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-xl active:scale-95"
        >
          Get Started Free
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
        <button className="rounded-full border border-slate-200 dark:border-slate-800 bg-white/5 px-6 py-3 text-lg font-bold transition-all hover:bg-white/10">
          View Demo
        </button>
      </div>
    </div>

    {/* Right Column: Visual UI Asset */}
    <div 
    className="w-full lg:w-1/2 flex justify-center items-center lg:mt-0 mt-8 [perspective:1000px]"
    onMouseMove={handleMouseMove}
    onMouseLeave={resetRotate}
  >
    <div 
      style={{
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: rotate.x === 0 ? 'all 0.5s ease-out' : 'none'
      }}
      className="relative w-full max-w-md aspect-[4/3] rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 p-3 shadow-2xl backdrop-blur-sm transition-transform duration-200 ease-out preserve-3d"
    >
      {/* Decorative "Glow" that follows the tilt */}
      <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity -z-10" />

      <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 flex flex-col p-6 overflow-hidden shadow-inner">
        <div className="flex items-center gap-1.5 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
        </div>
        
        <div className="space-y-6 [transform:translateZ(50px)]"> 
          {/* translateZ makes the inner content "pop" out */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-indigo-500/10 shadow-lg">
              <div className="w-4 h-4 rounded-sm bg-indigo-500 animate-pulse" />
            </div>
            <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          
          <div className="ml-5 border-l-2 border-slate-100 dark:border-slate-800 pl-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                 <div className="w-4 h-4 rounded-sm bg-purple-500" />
              </div>
              <div className="h-2 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  </div>
</section>

      <section className="relative bg-(--color-bg) px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Powering the Future of Autonomy
            </h2>
            <p className="text-(--color-muted)">
              Everything you need to move from prompt to production.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<GitBranch className="text-sky-400" />}
              title="Visual Workflow Editor"
              desc="Drag-and-drop nodes to define complex logic, branching, and loops for your agents."
            />
            <FeatureCard
              icon={<Cpu className="text-purple-400" />}
              title="Model Agnostic"
              desc="Seamlessly switch between GPT-4, Claude 3, or local Llama models with a single click."
            />
            <FeatureCard
              icon={<MessageSquare className="text-pink-400" />}
              title="Real-time Debugging"
              desc="Watch your agent's thought process live with integrated chat and step-by-step logs."
            />
            <FeatureCard
              icon={<Activity className="text-emerald-400" />}
              title="Execution Analytics"
              desc="Monitor token usage, latency, and success rates across all deployed workflows."
            />
            <FeatureCard
              icon={<Layers className="text-orange-400" />}
              title="Multi-Agent Swarms"
              desc="Enable multiple agents to collaborate, share memory, and delegate tasks autonomously."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-indigo-400" />}
              title="Enterprise Security"
              desc="SOC2 compliant infrastructure with encrypted API key management and RBAC."
            />
          </div>
        </div>
      </section>

      <section className="border-y border-(--color-border) bg-(--color-card) px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-xl">
              <h2 className="mb-4 text-3xl font-bold">Deep Documentation</h2>
              <p className="text-(--color-muted)">
                Expertly crafted guides to help you master agentic engineering.
              </p>
            </div>
            <button className="flex items-center gap-2 font-semibold text-indigo-400 hover:text-indigo-300">
              Explore Full Docs <Code2 size={18} />
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DocCard
              title="Quickstart Guide"
              desc="Deploy your first 'Research Agent' in under 5 minutes."
            />
            <DocCard
              title="Custom Tooling"
              desc="Learn how to connect your own APIs as agent tools."
            />
            <DocCard
              title="Vector Databases"
              desc="Integrating RAG and long-term memory into workflows."
            />
          </div>
        </div>
      </section>

      <footer className="bg-(--color-bg) px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
          <div className="col-span-2">
            <h3 className="mb-4 text-2xl font-bold tracking-tight">
              AgentForge
            </h3>
            <p className="max-w-xs leading-relaxed text-(--color-muted)">
              Empowering the next generation of developers to build autonomous
              systems with speed and safety.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-md font-bold uppercase tracking-widest text-indigo-500">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-(--color-muted)">
              <li className="cursor-pointer transition hover:text-white">Workflow Canvas</li>
              <li className="cursor-pointer transition hover:text-white">Agent Templates</li>
              <li className="cursor-pointer transition hover:text-white">API Keys</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-md font-bold uppercase tracking-widest text-indigo-500">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-(--color-muted)">
              <li className="cursor-pointer transition hover:text-white">Changelog</li>
              <li><Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition hover:text-white">Terms of Service</Link></li>
              <li className="cursor-pointer transition hover:text-white">Contact</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-(--color-border) pt-8 text-center text-sm text-(--color-muted)">
          © 2026 AgentForge Technologies Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group relative rounded-2xl border border-(--color-border) bg-(--color-card) p-8 transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl">
      <div className="mb-4 inline-block rounded-lg bg-(--color-bg) p-3 shadow-inner">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-(--color-text)">{title}</h3>
      <p className="text-sm leading-relaxed text-(--color-muted)">{desc}</p>
    </div>
  );
}

function DocCard({ title, desc }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-(--color-border) bg-(--color-bg) p-6 transition-colors hover:bg-indigo-500/5">
      <h3 className="mb-2 flex items-center justify-between font-bold text-(--color-text)">
        {title}
        <ArrowRight size={16} className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
      </h3>
      <p className="text-sm text-(--color-muted)">{desc}</p>
    </div>
  );
}