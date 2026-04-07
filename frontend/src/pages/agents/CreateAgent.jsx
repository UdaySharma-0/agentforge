import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createAgentAction,
  fetchAgentById,
  updateAgentAction,
} from "../../app/agentSlice";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Spinner,
} from "../../components/ui";
import { useToast } from "../../components/ui/ToastProvider";
import { setStoredAgentId } from "../../utils/sessionStorage";
import { Rocket, Edit3, Fingerprint, Cpu, Database, Save, XCircle } from "lucide-react";

const initialForm = {
  name: "",
  description: "",
  purpose: "",
  status: "draft",
  engine: "node",
  memoryWindow: 5,
};

export default function CreateAgent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { selectedAgent, detailLoading, submitLoading, error } = useSelector(
    (state) => state.agents,
  );
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchAgentById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedAgent?._id === id) {
      setForm({
        name: selectedAgent.name || "",
        description: selectedAgent.description || "",
        purpose: selectedAgent.purpose || "",
        status: selectedAgent.status || "draft",
        engine: selectedAgent.engine || "node",
        memoryWindow: selectedAgent.memoryWindow || 5,
      });
    }
  }, [id, isEditMode, selectedAgent]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.purpose.trim()) {
      setFormError("Agent name and purpose are required.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      description: form.description.trim(),
      memoryWindow: Number(form.memoryWindow),
    };

    try {
      if (isEditMode) {
        const updated = await dispatch(updateAgentAction({ id, payload })).unwrap();
        setStoredAgentId(updated._id);
        showToast("Agent profile recalibrated successfully.");
        navigate(`/agents/${updated._id}`);
      } else {
        const created = await dispatch(createAgentAction(payload)).unwrap();
        setStoredAgentId(created._id);
        showToast("New agent initialized successfully.");
        navigate(`/agents/${created._id}`);
      }
    } catch (e) {}
  };

  if (isEditMode && detailLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Syncing Agent Data...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-4 md:px-8 md:pt-4">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            {isEditMode ? <Fingerprint size={14} /> : <Rocket size={14} />} 
            {isEditMode ? "Identity Modification" : "Neural Initialization"}
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--color-text)]">
            {isEditMode ? "Edit Profile" : "Create Agent"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Configure the fundamental logic and identity of your unit.
          </p>
        </div>
      </div>

      <Card className="feature-card border-none bg-gradient-to-br from-[var(--color-card)] to-transparent p-0 shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Identity Group */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Agent Name</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Zenitsu"
                  className="h-12 bg-[var(--color-bg)]/50 border-[var(--color-border)] rounded-xl focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Purpose</label>
                <Input
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="e.g. Thunder Breathing Expert"
                  className="h-12 bg-[var(--color-bg)]/50 border-[var(--color-border)] rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Operational Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all no-scrollbar"
                placeholder="Detail the unit's primary objectives and limitations..."
              />
            </div>

            {/* Technical Parameters */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] ml-1">
                  <Database size={12} /> Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] ml-1">
                  <Cpu size={12} /> Engine
                </label>
                <select
                  name="engine"
                  value={form.engine}
                  onChange={handleChange}
                  className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                >
                  <option value="node">Node.JS</option>
                  <option value="python">Python 3.x</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] ml-1 text-center block">Memory Window</label>
                <div className="flex h-12 items-center justify-center bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl px-4">
                  <input
                    type="number"
                    name="memoryWindow"
                    min={2}
                    max={10}
                    value={form.memoryWindow}
                    onChange={handleChange}
                    className="w-full bg-transparent text-center text-lg font-black text-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error Feedback */}
            {(formError || error) && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-400">
                <XCircle size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">{formError || error}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="h-12 px-8 rounded-xl border-[var(--color-border)] bg-transparent text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                onClick={() => navigate(isEditMode ? `/agents/${id}` : "/agents")}
              >
                Cancel Task
              </Button>
              <Button 
                type="submit" 
                isLoading={submitLoading}
                className="h-12 px-10 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-2"
              >
                <Save size={16} />
                {isEditMode ? "Save Calibration" : "Create Agent"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-center">
         <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--color-muted)] opacity-30">
           Neural Identity Protocol v4.0.2 • Agent Forge Core
         </p>
      </div>
    </div>
  );
}