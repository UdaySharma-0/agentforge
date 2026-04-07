import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgentById, fetchAgents } from "../../app/agentSlice";
import {
  getKnowledge,
  saveManualKnowledge,
  scrapeKnowledgeWebsite,
  uploadKnowledgeDocument,
} from "../../services/knowledgeService";
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
import { getStoredAgentId } from "../../utils/sessionStorage";

export default function AgentKnowledge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const agentId = useMemo(
    () => id || getStoredAgentId(),
    [id],
  );

  const { list, listLoading, selectedAgent, detailLoading, error } = useSelector(
    (state) => state.agents,
  );
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeMessage, setKnowledgeMessage] = useState("");
  const [savedManualPreview, setSavedManualPreview] = useState("");

  const routeAgentExists = useMemo(
    () => !id || list.some((agent) => agent._id === id),
    [id, list],
  );

  const setKnowledgeFeedback = (message = "") => {
    setKnowledgeMessage(message);
  };

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    if (agentId && (!id || routeAgentExists)) {
      dispatch(fetchAgentById(agentId));
    }
  }, [agentId, dispatch, id, routeAgentExists]);

  useEffect(() => {
    if (selectedAgent?._id === agentId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebsiteUrl("");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setManualText("");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedManualPreview("");
  }, [agentId, selectedAgent]);

  useEffect(() => {
    if (!agentId) return undefined;

    let ignore = false;

    const loadKnowledge = async () => {
      try {
        const data = await getKnowledge(agentId);
        if (ignore) return;
        const preview = data.manualText?.preview || "";
        setSavedManualPreview(preview);
        setManualText(preview);
      } catch {
        if (!ignore) {
          setSavedManualPreview("");
        }
      }
    };

    loadKnowledge();

    return () => {
      ignore = true;
    };
  }, [agentId]);

  const handleScrapeWebsite = async () => {
    const url = websiteUrl.trim();

    if (!agentId || !url) {
      setKnowledgeFeedback("Enter a website URL before scraping.");
      return;
    }

    try {
      setKnowledgeLoading(true);
      setKnowledgeFeedback("");

      const data = await scrapeKnowledgeWebsite({
        agentId,
        url,
      });

      setKnowledgeFeedback(
        `Website scraped successfully. Added ${data.chunks_added || 0} chunks.`,
      );
      showToast(
        `Website scraped successfully. Added ${data.chunks_added || 0} chunks.`,
      );
      setWebsiteUrl("");
    } catch (requestError) {
      setKnowledgeFeedback(requestError.message || "Website scrape failed.");
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = String(reader.result || "");
        const [, base64 = ""] = result.split(",");
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

  const handleUploadDocument = async () => {
    if (!agentId || !selectedFile) {
      setKnowledgeFeedback("Choose a document before uploading.");
      return;
    }

    try {
      setKnowledgeLoading(true);
      setKnowledgeFeedback("");

      const fileContentBase64 = await fileToBase64(selectedFile);
      const data = await uploadKnowledgeDocument({
        agentId,
        fileName: selectedFile.name,
        fileContentBase64,
        mimeType: selectedFile.type,
      });

      await dispatch(fetchAgentById(agentId)).unwrap();

      setKnowledgeFeedback(
        `Document uploaded successfully. Added ${data.chunksCreated || 0} chunks.`,
      );
      showToast(
        `Document uploaded successfully. Added ${data.chunksCreated || 0} chunks.`,
      );
      setSelectedFile(null);
    } catch (requestError) {
      setKnowledgeFeedback(requestError.message || "Document upload failed.");
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const handleSaveManualKnowledge = async () => {
    const text = manualText.trim();

    if (!agentId || !text) {
      setKnowledgeFeedback("Enter manual knowledge before saving.");
      return;
    }

    try {
      setKnowledgeLoading(true);
      setKnowledgeFeedback("");

      const data = await saveManualKnowledge({
        agentId,
        text,
      });

      setSavedManualPreview(text);
      setKnowledgeFeedback(
        `Manual knowledge saved successfully. Added ${data.chunksCreated || 0} chunks.`,
      );
      showToast(
        `Manual knowledge saved successfully. Added ${data.chunksCreated || 0} chunks.`,
      );
      navigate(`/agents/${agentId}/knowledge`);
    } catch (requestError) {
      setKnowledgeFeedback(requestError.message || "Manual knowledge save failed.");
    } finally {
      setKnowledgeLoading(false);
    }
  };

  if (!agentId) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-[var(--color-muted)]">
            Select an agent first, then configure knowledge.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (id && !listLoading && !routeAgentExists) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-rose-400">
            This agent is not available for the current account.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (detailLoading) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-muted)]">
        <Spinner />
        Loading agent knowledge...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Agent Knowledge</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Add websites, documents, and manual text to the agent knowledge base.
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Knowledge Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Knowledge URL"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://docs.yourcompany.com"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleScrapeWebsite}
              isLoading={knowledgeLoading}
            >
              Scrape Website
            </Button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Upload Document
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-input-text)] file:mr-3 file:rounded-md file:border-0 file:bg-[#6366F1] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleUploadDocument}
                isLoading={knowledgeLoading}
              >
                Upload Document
              </Button>
              {selectedFile ? (
                <p className="text-xs text-[var(--color-muted)]">{selectedFile.name}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Manual Knowledge
            </label>
            <textarea
              rows={8}
              value={manualText}
              onChange={(event) => setManualText(event.target.value)}
              placeholder="Paste product FAQs, policy details, and operating context..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-input-text)] placeholder:text-[var(--color-muted)] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40"
            />
            {savedManualPreview ? (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Existing manual knowledge is loaded for editing and will be replaced on save.
              </p>
            ) : null}
          </div>

          {knowledgeMessage ? (
            <p
              className={`text-sm ${
                knowledgeMessage.toLowerCase().includes("failed") ||
                knowledgeMessage.toLowerCase().includes("enter") ||
                knowledgeMessage.toLowerCase().includes("choose")
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              {knowledgeMessage}
            </p>
          ) : null}
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveManualKnowledge} isLoading={knowledgeLoading}>
              Save Knowledge
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/agents/${agentId}/knowledge`)}
            >
              Back to Knowledge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
