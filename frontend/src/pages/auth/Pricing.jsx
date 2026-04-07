import {
  Check,
  Zap,
  ShieldCheck,
  Globe,
  Bot,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "../../components/ui";
import PublicTopbar from "../../components/layout/PublicTopbar";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Neural Scout",
      price: "0",
      description: "Perfect for developers and hobbyists testing the forge.",
      features: [
        "1 Active AI Agent",
        "100 Messages / month",
        "Web Scraping (1 URL)",
        "Standard Persona Tuning",
        "Community Support",
      ],
      buttonText: "Start For Free",
      isPopular: false,
    },
    {
      name: "Neural Pro",
      price: "49",
      description: "For growing businesses deploying intelligence at scale.",
      features: [
        "5 Active AI Agents",
        "5,000 Messages / month",
        "Unlimited Web Scraping",
        "PDF/DOCX/TXT Knowledge Uploads",
        "WhatsApp & Gmail Integration",
        "Priority Neural Processing",
      ],
      buttonText: "Deploy Pro",
      isPopular: true,
    },
    {
      name: "Neural Enterprise",
      price: "Custom",
      description: "Custom-built clusters for high-volume operations.",
      features: [
        "Unlimited AI Agents",
        "Unlimited Messages",
        "Dedicated Compute Instance",
        "Custom Workflow Nodes (Soon)",
        "24/7 Technical Response",
        "White-label Widget",
      ],
      buttonText: "Contact Sales",
      isPopular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] selection:bg-primary/30 transition-colors duration-500">
      <PublicTopbar active="pricing" />

      {/* Hero Header */}
      <section className="relative overflow-hidden px-6 pb-12 pt-32 text-center md:px-10 md:pb-20 lg:pt-40">
        {/* Responsive Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-full h-[300px] md:h-[500px] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <Zap size={14} /> Subscription Protocols
          </div>
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-[0.9]">
            Scale your{" "}
            <span className="text-[var(--color-muted)] opacity-70">Intelligence.</span>
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-base md:text-lg font-medium text-[var(--color-muted)] leading-relaxed">
            Simple, transparent pricing for deploying neural units across your
            entire business ecosystem.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="px-6 pb-24 md:px-10 lg:pb-32">
        <div className="mx-auto grid max-w-7xl gap-10 md:gap-6 lg:gap-8 lg:grid-cols-3 items-center">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative group ${plan.isPopular ? 'z-10' : 'z-0'}`}>
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                  <Badge className="bg-primary text-white font-black uppercase tracking-[0.2em] px-4 py-1.5 shadow-xl shadow-primary/20 border-none">
                    Most Deployed
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full feature-card border-none p-0 shadow-2xl transition-all duration-500 md:hover:-translate-y-2 ${
                  plan.isPopular
                    ? "bg-gradient-to-b from-primary/10 to-transparent ring-2 ring-primary/40 lg:scale-105"
                    : "bg-[var(--color-card)]/40 ring-1 ring-white/5"
                } backdrop-blur-sm`}
              >
                <CardContent className="p-8 md:p-10 flex flex-col h-full">
                  <div className="mb-8">
                    <h3 className="text-xl font-black tracking-tight mb-2 uppercase opacity-90">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl md:text-5xl font-black tracking-tighter">
                        {plan.price !== "Custom" ? `$${plan.price}` : plan.price}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                          / month
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-muted)] leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-[var(--color-border)] mb-8 opacity-50" />

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 group/item">
                        <div
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                            plan.isPopular
                              ? "bg-primary/20 text-primary group-hover/item:bg-primary group-hover/item:text-white"
                              : "bg-black/10 dark:bg-white/5 text-[var(--color-muted)]"
                          }`}
                        >
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-[var(--color-text)] opacity-70 group-hover/item:opacity-100 transition-opacity">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all text-xs ${
                      plan.isPopular
                        ? "bg-primary text-white shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95"
                        : "bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-card)] active:scale-95"
                    }`}
                    onClick={() => navigate("/login")}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Footer */}
      <section className="px-6 pb-20 md:pb-32 text-center">
        <div className="mx-auto max-w-5xl border-t border-[var(--color-border)] pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck size={28} className="text-primary" />
              <span className="font-black uppercase tracking-widest text-[9px]">PCI Compliant</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Globe size={28} className="text-primary" />
              <span className="font-black uppercase tracking-widest text-[9px]">Global Uplink</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Bot size={28} className="text-primary" />
              <span className="font-black uppercase tracking-widest text-[9px]">Neural Core</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Zap size={28} className="text-primary" />
              <span className="font-black uppercase tracking-widest text-[9px]">Turbo Latency</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}