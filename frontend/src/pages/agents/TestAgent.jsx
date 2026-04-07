import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SendHorizontal, ArrowLeft, Bot, User, Sparkles } from "lucide-react";
import { chatWithAgent } from "../../services/agentService";
import { Button, Spinner } from "../../components/ui";
import { useSelector, useDispatch } from "react-redux";
import { fetchAgents } from "../../app/agentSlice";
import { getStoredAgentId } from "../../utils/sessionStorage";

export default function TestAgent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const agentId = useMemo(() => id || getStoredAgentId(), [id]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const scrollRef = useRef(null);

  const agents = useSelector((state) => state.agents.list || []);
  const currentAgent = useMemo(() => agents.find(a => a._id === agentId), [agents, agentId]);

  useEffect(() => { dispatch(fetchAgents()); }, [dispatch]);
  useEffect(() => {
    if (chats.length === 0 && !loading) return;
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chats, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    const text = message.trim();
    setChats(prev => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);
    try {
      const data = await chatWithAgent({ agentId, message: text, customerId: "web-tester", channel: "chatbot" });
      setChats(prev => [...prev, { role: "agent", text: data.reply }]);
    } catch (e) {
      setChats(prev => [...prev, { role: "agent", text: "Error: Could not connect to the neural link." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex w-full flex-col items-center px-4 py-2 sm:px-6">
      
      {/* 1. Header & Navigation */}
      <header className="mb-8 flex w-full max-w-4xl items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition-transform active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{currentAgent?.name || "Agent Fushiguru"}</h1>
              <span className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                <Sparkles size={10} /> {currentAgent?.model || "Llama 4"}
              </span>
            </div>
          </div>
        </div>

      </header>

      {/* 2. Chat Canvas */}
      <main className="relative flex min-h-[65vh] w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
        
        {/* Messages List */}
        <div className="chat-scrollbar flex-1 overflow-y-auto p-6 space-y-8 max-h-[400px]">
          {chats.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 opacity-30">
              <div className="rounded-full border-2 border-dashed border-[var(--color-muted)] p-8">
                <Bot size={48} />
              </div>
              <p className="text-sm font-medium tracking-widest uppercase">Initializing Agentic Session</p>
            </div>
          ) : (
            chats.map((chat, i) => (
              <div key={i} className={`flex w-full animate-in slide-in-from-bottom-2 ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[85%] ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm`}>
                    {chat.role === "user" ? <User size={14} /> : <Bot size={14} className="text-indigo-500" />}
                  </div>
                  <div className={`rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                    chat.role === "user" 
                      ? "bg-[var(--color-bubble-user)] text-[var(--color-text)] border border-[var(--color-border)] rounded-tr-none" 
                      : "bg-[var(--color-bubble-agent)] text-[var(--color-text)] border border-[var(--color-border)] rounded-tl-none"
                  }`}>
                    {chat.text}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-3 px-2 italic text-[var(--color-muted)]">
              <Spinner size="sm" /> <span className="text-xs tracking-widest uppercase font-semibold">Agent Thinking...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* 3. Futuristic Input Bar */}
        <div className="border-t border-[var(--color-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-xl">
          <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 transition-all">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask AgentForge anything..."
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-[var(--color-muted)]"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-lg shadow-indigo-500/40 hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all"
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
        Powered by AgentForge Neural Engine 4.0
      </footer>
    </div>
  );
}
