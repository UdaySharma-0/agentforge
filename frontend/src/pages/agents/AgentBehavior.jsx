import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgentById, updateAgentAction } from "../../app/agentSlice";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Spinner,
} from "../../components/ui";
import { getStoredAgentId } from "../../utils/sessionStorage";
import { BrainCircuit, ArrowLeft, Save, Sparkles, CheckCircle2 } from "lucide-react";

const toneValues = ["friendly", "formal", "professional"];
const responseLengths = ["short", "medium", "detailed"];

export default function AgentBehavior() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const agentId = useMemo(() => id || getStoredAgentId(), [id]);
  const { selectedAgent, detailLoading, submitLoading, error } = useSelector(
    (state) => state.agents,
  );

  const [tone, setTone] = useState("friendly");
  const [responseLength, setResponseLength] = useState("medium");
  const [memoryWindow, setMemoryWindow] = useState(5);

  useEffect(() => {
    if (agentId) dispatch(fetchAgentById(agentId));
  }, [agentId, dispatch]);

  useEffect(() => {
    if (!selectedAgent || selectedAgent._id !== agentId) {
      setTone("friendly"); setResponseLength("medium"); setMemoryWindow(5);
      return;
    }
    setTone(selectedAgent.instructions?.tone || "friendly");
    setResponseLength(selectedAgent.instructions?.responseLength || "medium");
    setMemoryWindow(selectedAgent.memoryWindow || 5);
  }, [agentId, selectedAgent]);

  const handleSave = async () => {
    if (!agentId) return;
    try {
      await dispatch(updateAgentAction({
          id: agentId,
          payload: { memoryWindow: Number(memoryWindow), instructions: { tone, responseLength } },
      })).unwrap();
      navigate(`/agents/${agentId}`);
    } catch (e) {}
  };

  if (detailLoading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header - More Elegant */}
      <div className="mb-8 flex items-end justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
            <Sparkles className="h-4 w-4" /> 
            <span>AI Personality Core</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Behavior Settings
          </h1>
        </div>
        <button 
          onClick={() => navigate(`/agents/${agentId}`)}
          className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Tone Selection (Takes 5/12 of width) */}
        <div className="lg:col-span-5 space-y-4">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] px-1">
            Tone & Persona
          </label>
          <div className="flex flex-col gap-3">
            {toneValues.map((item) => (
              <button
                key={item}
                onClick={() => setTone(item)}
                className={`group relative flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                  tone === item 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                  : "border-[var(--color-border)] bg-[var(--color-card)]/50 hover:border-[var(--color-muted)]"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-semibold capitalize ${tone === item ? "text-primary" : "text-[var(--color-text)]"}`}>
                    {item}
                  </span>
                  <span className="text-[11px] text-[var(--color-muted)]">Set agent to a {item} interaction style.</span>
                </div>
                {tone === item && <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in duration-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Verbosity & Memory (Takes 7/12 of width) */}
        <div className="lg:col-span-7 space-y-8">
          <section className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] px-1">
              Response Verbosity
            </label>
            <div className="flex p-1.5 bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)]">
              {responseLengths.map((item) => (
                <button
                  key={item}
                  onClick={() => setResponseLength(item)}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                    responseLength === item 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="p-6 rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-card)] to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">Context Memory</h3>
                  <p className="text-xs text-[var(--color-muted)]">Past messages to remember</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min="2"
                  max="10"
                  value={memoryWindow}
                  onChange={(e) => setMemoryWindow(e.target.value)}
                  className="w-16 h-12 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-center text-xl font-bold text-primary outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Action Footer integrated into the right column to save space */}
          <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-border)]/50">
            <Button 
              onClick={handleSave} 
              isLoading={submitLoading}
              className="flex-[2] bg-primary hover:brightness-110 text-white h-12 rounded-2xl font-bold shadow-xl shadow-primary/10 gap-2"
            >
              <Save className="h-4 w-4" /> Update Behavior
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1 h-12 rounded-2xl border-[var(--color-border)] bg-transparent hover:bg-white/5"
              onClick={() => navigate(`/agents/${agentId}`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
      
      {error && <div className="mt-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">{error}</div>}
    </div>
  );
}