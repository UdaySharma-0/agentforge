import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  Globe,
  Sparkles,
  Unplug,
  Code2,
  Save,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Spinner,
} from "../../components/ui";
import { useToast } from "../../components/ui/ToastProvider";
import {
  buildWidgetScript,
  deleteWidgetConfig,
  getWidgetConfig,
  saveWidgetConfig,
} from "../../services/widgetService";
import ColorPicker from "./ColorPicker";
import ScriptGeneratorModal from "./ScriptGeneratorModal";
import WidgetPreviewModal from "./WidgetPreviewModal";
import WidgetShellPreview from "./WidgetShellPreview";

// --- Helper for URL Normalization ---
function normalizePreviewUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Website URL is required");
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const parsed = new URL(candidate);
  if (!/^https?:$/.test(parsed.protocol))
    throw new Error("URL must start with http or https");
  parsed.hash = "";
  return parsed.toString();
}

export default function WidgetCustomizer({ agentId, onBack, onWidgetUpdated }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [copiedInline, setCopiedInline] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSavedConfig, setHasSavedConfig] = useState(false);

  const [form, setForm] = useState({
    color: "#6366F1",
    greetingLine1: "Hey there!",
    greetingLine2: "How can we help you?",
    websiteUrl: "",
  });

  // Load Initial Config
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        setLoading(true);
        const result = await getWidgetConfig(agentId);
        const config = result?.config;
        if (!isMounted) return;

        setHasSavedConfig(Boolean(config));
        if (config) {
          setForm({
            color: config.color || "#6366F1",
            greetingLine1: config.greeting?.[0] || "Hey there!",
            greetingLine2: config.greeting?.[1] || "How can we help you?",
            websiteUrl: config.websiteUrl || "",
          });
        }
      } catch (error) {
        if (isMounted)
          showToast(error.message || "Failed to load config.", {
            tone: "error",
          });
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [agentId, showToast]);

  const greeting = useMemo(
    () =>
      [form.greetingLine1.trim(), form.greetingLine2.trim()]
        .filter(Boolean)
        .slice(0, 2),
    [form.greetingLine1, form.greetingLine2],
  );

  const updateField = useCallback((key, value) => {
    setForm((curr) => ({ ...curr, [key]: value }));
    setFieldErrors((curr) => ({ ...curr, [key]: "" }));
  }, []);

  const validateForm = () => {
    const nextErrors = {};
    if (!form.websiteUrl.trim()) {
      nextErrors.websiteUrl = "Website URL is required";
    } else {
      try {
        normalizePreviewUrl(form.websiteUrl);
      } catch (e) {
        nextErrors.websiteUrl = e.message;
      }
    }
    if (!/^#[0-9A-F]{6}$/i.test(form.color))
      nextErrors.color = "Invalid hex color";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    setPreviewUrl(normalizePreviewUrl(form.websiteUrl));
    setIsPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setIsSaving(true);
      const payload = {
        agentId,
        color: form.color,
        greeting,
        websiteUrl: normalizePreviewUrl(form.websiteUrl),
      };

      const result = await saveWidgetConfig(payload);
      const config = result?.config;

      if (config) {
        setGeneratedScript(
          buildWidgetScript({
            agentId: agentId,
            color: config.color,
            greeting: config.greeting,
          }),
        );
        setHasSavedConfig(true);
        setIsScriptOpen(true);
        showToast("Widget configuration saved successfully.");
      }
    } catch (error) {
      showToast(error.message || "Save failed.", { tone: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopiedInline(true);
      setTimeout(() => setCopiedInline(false), 2000);
      showToast("Script copied!");
    } catch (e) {
      showToast("Copy failed.", { tone: "error" });
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Remove website chatbot?")) return;
    try {
      setIsDisconnecting(true);
      await deleteWidgetConfig(agentId);
      setHasSavedConfig(false);
      setGeneratedScript("");
      showToast("Widget disconnected.");
      onBack?.();
    } catch (e) {
      showToast("Disconnect failed.", { tone: "error" });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)]">
        <Spinner size="lg" className="mb-4" />
        <p className="text-sm font-medium">Fetching widget settings...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-2 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section: Changed to col on mobile, row on tablet+ */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-border)] pb-8">
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="group mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Channels
            </button>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
              Website Chatbot
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Manage how the AI agent appears on your storefront.
            </p>
          </div>

          {/* Buttons: Grid for mobile (2 columns) or flex for desktop */}
          <div className="grid grid-cols-2 sm:flex gap-3">
            <Button
              variant="secondary"
              onClick={handlePreview}
              leftIcon={<Eye className="h-4 w-4" />}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Live Simulator
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Save Changes
            </Button>
            {hasSavedConfig && (
              <Button
                variant="danger"
                onClick={handleDisconnect}
                isLoading={isDisconnecting}
                className="col-span-2 sm:w-auto"
              >
                <Unplug className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Informational Alert */}
        <div className="flex items-start gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 p-4 transition-colors">
          {/* Icon Container: Slightly more opaque in dark mode to pop */}
          <div className="shrink-0 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 p-2 text-indigo-600 dark:text-indigo-400">
            <Globe className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            {/* Title: Darker indigo for light mode visibility, lighter for dark mode */}
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              Integration Notice
            </p>

            {/* Subtext: Slate/Indigo mix for light mode, muted indigo for dark mode */}
            <p className="text-xs leading-relaxed text-indigo-700/80 dark:text-indigo-300/70">
              Changes apply instantly once embedded. Ensure your domain is
              authorized to prevent unauthorized usage.
            </p>
          </div>
        </div>

        {/* Main Grid: Stacked by default, 12-cols on XL */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Left Column: Form */}
          <div className="space-y-8 xl:col-span-7">
            <Card className="border-white/5 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-lg">Appearance & Brand</CardTitle>
                <CardDescription>
                  Customize the visual identity of your agent.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 md:space-y-10">
                {/* Color Section */}
                <section className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
                    Brand Primary Color
                  </label>
                  <div className="max-w-full overflow-hidden">
                    <ColorPicker
                      value={form.color}
                      onChange={(v) => updateField("color", v)}
                    />
                  </div>
                  {fieldErrors.color && (
                    <p className="text-xs text-rose-400">{fieldErrors.color}</p>
                  )}
                </section>

                {/* Greetings: 1 col mobile, 2 col md */}
                <section className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Greeting Header"
                    value={form.greetingLine1}
                    maxLength={60}
                    onChange={(e) =>
                      updateField("greetingLine1", e.target.value)
                    }
                    placeholder="Welcome!"
                  />
                  <Input
                    label="Subtext Message"
                    value={form.greetingLine2}
                    maxLength={80}
                    onChange={(e) =>
                      updateField("greetingLine2", e.target.value)
                    }
                    placeholder="How can we help?"
                  />
                </section>

                {/* URL Binding */}
                <section className="space-y-4">
                  <Input
                    label="Authorized Website URL"
                    value={form.websiteUrl}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                    placeholder="https://yourstore.com"
                    leftIcon={<Globe className="h-4 w-4" />}
                    error={fieldErrors.websiteUrl}
                    hint="Only requests from this domain will be accepted."
                  />
                </section>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={handlePreview}
                    className="w-full sm:w-auto"
                    leftIcon={<Eye className="h-4 w-4" />}
                  >
                    Try Now
                  </Button>
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="w-full sm:w-auto"
                  >
                    Confirm & Generate Script
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Script Section: Responsive buttons */}
            {generatedScript && (
              <Card className="border-emerald-500/20 bg-emerald-500/5 animate-in zoom-in-95 duration-300">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-emerald-100">
                        Embed Script Ready
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 sm:flex-none"
                        onClick={() => setIsScriptOpen(true)}
                      >
                        Full View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={handleInlineCopy}
                        leftIcon={
                          copiedInline ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )
                        }
                      >
                        {copiedInline ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <pre className="max-h-40 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-[10px] text-emerald-300/80">
                    {generatedScript}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Preview - Hidden on very small screens or made full width */}
          <aside className="xl:col-span-5">
            <div className="sticky top-8 space-y-4">
              <Card className="overflow-hidden border-[var(--color-border)] bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 shadow-sm dark:shadow-none">
                <CardHeader className="border-b border-[var(--color-border)] pb-4 bg-[var(--color-bg-secondary)]/30">
                  <CardTitle className="flex items-center gap-2 text-base text-[var(--color-text)]">
                    <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    Live Preview
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative flex h-[400px] md:h-[500px] flex-col items-center justify-center p-0 bg-[var(--color-bg)]">
                  {/* The radial gradient dots now adapt: indigo in dark mode, slate in light mode */}
                  <div className="absolute inset-0 opacity-[0.15] dark:opacity-20 bg-[radial-gradient(var(--color-muted)_1px,transparent_1px)] dark:bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />

                  <div className="z-10 w-full p-0.5 md:p-2">
                    <WidgetShellPreview
                      color={form.color}
                      greeting={greeting}
                      className="w-full"
                      compact="true"
                    />
                  </div>

                  <div className="absolute bottom-4 left-0 w-full text-center">
                    <p className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-widest">
                      Real-time visualization
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <WidgetPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        url={previewUrl}
        color={form.color}
        greeting={greeting}
      />

      <ScriptGeneratorModal
        isOpen={isScriptOpen}
        onClose={() => setIsScriptOpen(false)}
        script={generatedScript}
      />
    </>
  );
}
