import { useEffect, useMemo, useRef, useState } from "react";
import { SendHorizontal, Trash2, Bot, User, Sparkles, Terminal, Command } from "lucide-react";
import { Button, Spinner } from "../../components/ui";
import { sendChatMessage } from "../../services/chatService";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgents } from "../../app/agentSlice";
import {
  getChatHistoryKey,
  getCustomerId,
  getStoredAgentId,
  setStoredAgentId,
} from "../../utils/sessionStorage";

function createMessage(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export default function ChatConsole() {
  const dispatch = useDispatch();
  const agents = useSelector((state) => state.agents.list || []);
  const [selectedAgentId, setSelectedAgentId] = useState(() =>
    getStoredAgentId(),
  );
  const historyKey = useMemo(
    () => getChatHistoryKey(selectedAgentId),
    [selectedAgentId],
  );
  const endRef = useRef(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState(() => {
    const raw = localStorage.getItem(historyKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const raw = localStorage.getItem(historyKey);
    if (!raw) {
      setMessages([]);
      return;
    }

    try {
      setMessages(JSON.parse(raw));
    } catch {
      setMessages([]);
    }
  }, [historyKey]);

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    if (agents.length === 0) {
      setSelectedAgentId("");
      setStoredAgentId("");
      return;
    }

    const hasCurrentSelection = agents.some(
      (agent) => agent._id === selectedAgentId,
    );
    if (hasCurrentSelection) return;

    const fallbackAgentId = agents[0]?._id || "";
    setSelectedAgentId(fallbackAgentId);
    setStoredAgentId(fallbackAgentId);
  }, [agents, selectedAgentId]);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages));
  }, [historyKey, messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!selectedAgentId) {
      setError("No agent selected. Create or open an agent first.");
      return;
    }

    setError("");
    setInput("");

    const userMessage = createMessage("user", text);
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const data = await sendChatMessage({
        agentId: selectedAgentId,
        message: text,
        customerId: getCustomerId(),
        channel: "chatbot",
      });

      const reply = data.reply || "No response from agent.";
      const assistantMessage = createMessage("assistant", reply);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (requestError) {
      setError(requestError.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(historyKey);
    setError("");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      <div className="mb-6 flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            <Terminal size={14} /> Master Console
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--color-text)]">
            Neural Intercept
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
              <Bot size={14} />
            </div>
            <select
              value={selectedAgentId || ""}
              onChange={(e) => {
                setSelectedAgentId(e.target.value);
                setStoredAgentId(e.target.value);
                setError("");
              }}
              className="h-10 w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] pl-9 pr-10 text-xs font-bold uppercase tracking-widest text-[var(--color-text)] outline-none ring-primary/20 transition-all focus:ring-4 sm:w-64"
            >
              <option value="" disabled>
                Select Unit
              </option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name || "Unnamed Unit"}
                </option>
              ))}
            </select>
          </div>
            <Button
            variant="ghost"
            onClick={() => { if(confirm("Purge local logs?")) setMessages([]); }}
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 hover:text-rose-500"
          >
            <Trash2 size={14} className="mr-2" /> Purge Logs
          </Button>
        </div>
      </div>

      <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-4 py-3 text-center text-sm text-[var(--color-muted)]">
              Start chatting with your agent. User messages appear on the right,
              AI replies on the left.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                    message.role === "user"
                      ? "rounded-br-md bg-[#6366F1] text-white"
                      : "rounded-bl-md border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-text)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}

          {loading ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-[var(--color-border)] bg-[var(--color-input-bg)] px-4 py-3 text-sm text-[var(--color-muted)]">
                <Spinner size="sm" />
                AI is typing...
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 sm:px-6">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message AgentForge AI..."
              className="max-h-36 min-h-11 w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-input-text)] placeholder:text-[var(--color-muted)] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40"
            />

            <Button
              onClick={handleSend}
              isLoading={loading}
              leftIcon={<SendHorizontal size={15} />}
            >
              Send
            </Button>
          </div>

          {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
