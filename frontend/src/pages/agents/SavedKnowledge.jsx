import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Bot,
  Database,
  Edit3,
  ExternalLink,
  File,
  FileText,
  Globe,
  Plus,
  Search,
} from "lucide-react";
import { fetchAgentById, fetchAgents } from "../../app/agentSlice";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from "../../components/ui";
import { getKnowledge } from "../../services/knowledgeService";

export default function SavedKnowledge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const agentId = useMemo(() => id || null, [id]);
  const { list, listLoading, selectedAgent, detailLoading, error } = useSelector(
    (state) => state.agents,
  );
  const [knowledgeData, setKnowledgeData] = useState({
    websites: [],
    documents: [],
    manualText: {
      exists: false,
      chunkCount: 0,
      preview: "",
    },
  });
  const routeAgentExists = useMemo(
    () => !id || list.some((agent) => agent._id === id),
    [id, list],
  );

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    if (agentId && routeAgentExists) {
      dispatch(fetchAgentById(agentId));
    }
  }, [agentId, dispatch, routeAgentExists]);

  useEffect(() => {
    if (!agentId || (id && !routeAgentExists)) {
      return undefined;
    }

    let ignore = false;

    const loadKnowledge = async () => {
      try {
        const data = await getKnowledge(agentId);
        if (!ignore) {
          setKnowledgeData({
            websites: data.websites || [],
            documents: data.documents || [],
            manualText: data.manualText || {
              exists: false,
              chunkCount: 0,
              preview: "",
            },
          });
        }
      } catch {
        if (!ignore) {
          setKnowledgeData({
            websites: [],
            documents: [],
            manualText: {
              exists: false,
              chunkCount: 0,
              preview: "",
            },
          });
        }
      }
    };

    loadKnowledge();

    return () => {
      ignore = true;
    };
  }, [agentId, id, routeAgentExists]);

  const addKnowledgePath = agentId
    ? `/agents/${agentId}/knowledge/add`
    : "/agents/knowledge/add";

  if (!agentId) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="space-y-4 py-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Knowledge Base
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Open an agent first to view its saved knowledge.
            </p>
          </div>
          <Button onClick={() => navigate("/agents")}>Go to Agents</Button>
        </CardContent>
      </Card>
    );
  }

  if (detailLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center gap-3 text-slate-500">
        <Spinner className="h-6 w-6 border-blue-500" />
        <span className="text-lg font-medium">Loading knowledge base...</span>
      </div>
    );
  }

  if (id && !listLoading && !routeAgentExists) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="space-y-4 py-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Knowledge Base
            </h1>
            <p className="mt-2 text-sm text-rose-400">
              This agent is not available for the current account.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/agents")}>
            Back to Agents
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedAgent) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="space-y-4 py-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">
              Knowledge Base
            </h1>
            <p className="mt-2 text-sm text-rose-400">
              {error || "We couldn't load this agent's knowledge."}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/agents")}>
            Back to Agents
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Managing information for{" "}
            <span className="font-semibold text-blue-500">
              {selectedAgent.name || "Agent"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => navigate("/agents")}>
          <div className="flex items-center gap-2">
            <Bot size={18} />
            Agents
          </div>
        </Button>
        <Button onClick={() => navigate(addKnowledgePath)}>
          <div className="flex items-center gap-2">
            <Plus size={18} />
            Add Knowledge
          </div>
        </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161a1f]">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                  <Globe size={20} />
                </div>
                <CardTitle className="text-lg dark:text-white">
                  Scraped Websites
                </CardTitle>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {knowledgeData.websites.length} Sources
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 ">
            {knowledgeData.websites.length > 0 ? (
              <div className="space-y-3">
                {knowledgeData.websites.map((site, index) => (
                  <div
                    key={`${site.url}-${index}`}
                    className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-blue-200 dark:border-slate-800 dark:bg-[#1c2128] dark:hover:border-blue-500/30"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                        {site.url}
                      </p>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-500"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No websites have been added for this agent yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161a1f]">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
                  <FileText size={20} />
                </div>
                <CardTitle className="text-lg dark:text-white">
                  Knowledge Documents
                </CardTitle>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {knowledgeData.documents.length} Files
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {knowledgeData.documents.length > 0 ? (
              <div className="space-y-3">
                {knowledgeData.documents.map((file) => (
                  <div
                    key={file.sourceName}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#1c2128]"
                  >
                    <div className="flex items-center gap-3">
                      <File size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {file.sourceName}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400">
                          {file.chunkCount} chunks
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(addKnowledgePath)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500"
                      aria-label={`Edit ${file.sourceName}`}
                    >
                      <Edit3 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No uploaded documents have been added for this agent yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-[#161a1f] md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                <Database size={20} />
              </div>
              <CardTitle className="text-lg dark:text-white">
                Manual Context
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(addKnowledgePath)}
              className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
            >
              <Edit3 size={16} className="mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#1c2128]">
              <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">
                {knowledgeData.manualText.preview ||
                  "No manual knowledge provided for this agent."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Search className="mb-2 h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
