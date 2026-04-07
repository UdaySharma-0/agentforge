import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import "@xyflow/react/dist/style.css";
import { Badge, Button } from "../../components/ui";
import { getWorkflowByAgent, saveWorkflow } from "../../services/workflowService";
import { useTheme } from "../../app/themeContext";
import { getStoredAgentId } from "../../utils/sessionStorage";

const NODE_META = {
  start: {
    label: "Start",
    color: "#16a34a",
    kind: "Start",
    description: "Entry point",
  },
  message: {
    label: "Message Node",
    color: "#0ea5e9",
    kind: "Message",
    description: "Send text response",
  },
  condition: {
    label: "Condition",
    color: "#f59e0b",
    kind: "Condition",
    description: "Branch by condition",
  },
  api_call: {
    label: "API Call",
    color: "#a855f7",
    kind: "API",
    description: "Call external service",
  },
  ai_node: {
    label: "AutonomousNode",
    color: "#6366f1",
    kind: "Autonomous",
    description: "AI reasoning step",
  },
  end: {
    label: "End",
    color: "#64748b",
    kind: "End",
    description: "Conversation end",
  },
};

const FLOW_LIST = ["Main", "Error", "Timeout", "Conversation End"];
const NODE_LIBRARY = ["start", "message", "condition", "api_call", "ai_node", "end"];

function createNode(type, position, idSeed) {
  const meta = NODE_META[type] || NODE_META.message;

  return {
    id: `${type}-${idSeed}`,
    type,
    position,
    data: {
      label: meta.label,
      nodeType: type,
      color: meta.color,
      instructions:
        type === "ai_node"
          ? "Use verified knowledge only. Ask clarifying questions when needed."
          : `${meta.description}.`,
      allowConversation: true,
    },
  };
}

function getDefaultWorkflow() {
  return {
    nodes: [
      createNode("start", { x: 160, y: 240 }, "seed-start"),
      createNode("ai_node", { x: 470, y: 220 }, "seed-ai"),
      createNode("end", { x: 810, y: 240 }, "seed-end"),
    ],
    edges: [
      {
        id: "e-start-ai",
        source: "start-seed-start",
        target: "ai_node-seed-ai",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
        style: { stroke: "#64748b", strokeWidth: 1.8 },
      },
    ],
  };
}

function getFallbackPosition(index) {
  const column = index % 3;
  const row = Math.floor(index / 3);

  return {
    x: 160 + (column * 280),
    y: 180 + (row * 140),
  };
}

function normalizeNode(node, index) {
  const fallbackType = node?.type || node?.data?.nodeType || "message";
  const meta = NODE_META[fallbackType] || NODE_META.message;
  const position = {
    x: Number.isFinite(node?.position?.x) ? node.position.x : getFallbackPosition(index).x,
    y: Number.isFinite(node?.position?.y) ? node.position.y : getFallbackPosition(index).y,
  };

  return {
    id: String(node?.id || `${fallbackType}-${index + 1}`),
    type: NODE_META[fallbackType] ? fallbackType : "message",
    position,
    data: {
      label: node?.data?.label || meta.label,
      nodeType: NODE_META[fallbackType] ? fallbackType : "message",
      color: node?.data?.color || meta.color,
      instructions: node?.data?.instructions || meta.description,
      allowConversation: node?.data?.allowConversation ?? true,
    },
  };
}

function sanitizeWorkflow(workflow) {
  if (!workflow || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) {
    return getDefaultWorkflow();
  }

  const nodes = workflow.nodes
    .filter((node) => node && typeof node === "object")
    .map((node, index) => normalizeNode(node, index));

  if (nodes.length === 0) {
    return getDefaultWorkflow();
  }

  const validNodeIds = new Set(nodes.map((node) => node.id));
  const edges = workflow.edges
    .filter((edge) =>
      edge &&
      typeof edge === "object" &&
      validNodeIds.has(edge.source) &&
      validNodeIds.has(edge.target),
    )
    .map((edge, index) => ({
      id: String(edge.id || `edge-${index + 1}`),
      source: edge.source,
      target: edge.target,
      type: edge.type || "smoothstep",
      animated: Boolean(edge.animated),
      markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: "#64748b" },
      style: edge.style || { stroke: "#64748b", strokeWidth: 1.8 },
    }));

  return { nodes, edges };
}

function loadWorkflow(storageKey) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return getDefaultWorkflow();

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
      return sanitizeWorkflow(parsed);
    }

    return getDefaultWorkflow();
  } catch {
    return getDefaultWorkflow();
  }
}

function StartEndNode({ data, type, selected }) {
  const isStart = type === "start";
  const accent = data?.color || "#64748b";

  return (
    <div
      className={`relative min-w-[130px] rounded-2xl border px-5 py-3 text-center shadow-lg ${
        selected
          ? "border-indigo-400 ring-2 ring-indigo-500/35"
          : "border-[var(--color-border)]"
      } ${isStart ? "bg-emerald-600/10 dark:bg-emerald-950/70" : "bg-[var(--color-card)]"}`}
      style={{ borderColor: selected ? undefined : accent }}
    >
      {!isStart ? (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: "#64748b", width: 9, height: 9 }}
        />
      ) : null}

      <p className="text-lg font-semibold text-[var(--color-text)]">{data?.label || "Node"}</p>

      {isStart ? (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: "#22c55e", width: 9, height: 9 }}
        />
      ) : null}
    </div>
  );
}

function CardNode({ data, type, selected }) {
  const accent = data?.color || "#6366f1";
  const meta = NODE_META[type] || NODE_META.ai_node;

  return (
    <div
      className={`relative w-[320px] rounded-2xl border bg-[var(--color-card)] p-3 text-left shadow-2xl ${
        selected
          ? "border-indigo-400 ring-2 ring-indigo-500/35"
          : "border-[var(--color-border)]"
      }`}
      style={{ boxShadow: `0 0 0 1px ${selected ? "transparent" : accent}33` }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#64748b", width: 9, height: 9 }}
      />

      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
          {meta.kind}
        </p>
        <span className="rounded-full bg-[var(--color-hover)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
          Node
        </span>
      </div>

      <h4 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{data?.label || meta.label}</h4>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/70 p-2.5">
        <p className="line-clamp-3 text-sm text-[var(--color-muted)]">{data?.instructions || meta.description}</p>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-2.5 py-1.5">
        <p className="text-sm text-[var(--color-text)]">Search Knowledge</p>
        <span className="rounded-full bg-[var(--color-hover)] px-2 py-0.5 text-xs text-[var(--color-muted)]">All</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: accent, width: 9, height: 9 }}
      />
    </div>
  );
}

const nodeTypes = {
  start: StartEndNode,
  end: StartEndNode,
  message: CardNode,
  condition: CardNode,
  api_call: CardNode,
  ai_node: CardNode,
};

function WorkflowEditorCanvas({ agentId }) {
  const { theme } = useTheme();
  const activeAgentId = useMemo(
    () => agentId || getStoredAgentId() || "",
    [agentId],
  );
  const storageKey = `agentforge:workflow:${activeAgentId || "global"}`;
  const initialState = useMemo(() => loadWorkflow(storageKey), [storageKey]);

  const [nodes, setNodes] = useState(initialState.nodes);
  const [edges, setEdges] = useState(initialState.edges);
  const [selectedNodeId, setSelectedNodeId] = useState(initialState.nodes[1]?.id || null);
  const [savedAt, setSavedAt] = useState("");
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const nodeIdRef = useRef(initialState.nodes.length + 1);
  const { screenToFlowPosition } = useReactFlow();

  const flowChrome = useMemo(() => {
    // Keep the canvas UI readable in both themes.
    // Using explicit colors here is safer than relying on CSS vars inside ReactFlow internals.
    if (theme === "light") {
      return {
        backgroundGrid: "#cbd5e1", // slate-300
        overlayMask: "rgba(248,250,252,0.75)", // light surface mask
        chromeBgClass: "!bg-white",
        chromeBorderClass: "!border-slate-200",
      };
    }

    return {
      backgroundGrid: "#1f2937", // slate-800
      overlayMask: "rgba(2,6,23,0.7)", // near --color-topbar for dark
      chromeBgClass: "!bg-slate-900",
      chromeBorderClass: "!border-slate-700",
    };
  }, [theme]);

  const getNextNodeSeed = useCallback(() => {
    const next = nodeIdRef.current;
    nodeIdRef.current += 1;
    return next;
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );

  const workflowPayload = useMemo(
    () => ({
      version: 1,
      agentId: activeAgentId || null,
      savedAt: new Date().toISOString(),
      nodes,
      edges,
    }),
    [activeAgentId, edges, nodes],
  );

  const workflowJson = useMemo(() => JSON.stringify(workflowPayload, null, 2), [workflowPayload]);

  const onNodesChange = useCallback((changes) => {
    setNodes((current) => applyNodeChanges(changes, current));

    const removed = changes.find((change) => change.type === "remove" && change.id === selectedNodeId);
    if (removed) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const onEdgesChange = useCallback(
    (changes) => setEdges((current) => applyEdgeChanges(changes, current)),
    [],
  );

  const onConnect = useCallback(
    (connection) => {
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: false,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
            style: { stroke: "#64748b", strokeWidth: 1.8 },
          },
          current,
        ),
      );
    },
    [],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/agentforge-node");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = createNode(type, position, `${type}-${getNextNodeSeed()}`);
      setNodes((current) => [...current, newNode]);
      setSelectedNodeId(newNode.id);
    },
    [getNextNodeSeed, screenToFlowPosition],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDragStart = (event, type) => {
    event.dataTransfer.setData("application/agentforge-node", type);
    event.dataTransfer.effectAllowed = "move";
  };

  const addNodeQuick = (type) => {
    const offset = nodes.length * 28;
    const newNode = createNode(
      type,
      { x: 320 + offset, y: 170 + (offset % 120) },
      `${type}-${getNextNodeSeed()}`,
    );

    setNodes((current) => [...current, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const updateSelectedNode = (patch) => {
    if (!selectedNodeId) return;

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, ...patch } }
          : node,
      ),
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;

    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId,
      ),
    );
    setSelectedNodeId(null);
  };

  const saveJson = () => {
    localStorage.setItem(storageKey, workflowJson);
  };

  const saveToMongo = async () => {
    setSaveError("");
    setSaveMessage("");

    if (!activeAgentId) {
      setSaveError("Select an agent first. Workflow save requires a valid agentId.");
      return;
    }

    try {
      setSavingWorkflow(true);

      await saveWorkflow({
        agentId: activeAgentId,
        nodes,
        edges,
      });

      saveJson();
      setSavedAt(new Date().toLocaleTimeString());
      setSaveMessage("Workflow saved to MongoDB.");
    } catch (error) {
      setSaveError(error.message || "Failed to save workflow.");
    } finally {
      setSavingWorkflow(false);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([workflowJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `workflow-${agentId || "global"}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!activeAgentId) return;

    let isMounted = true;

    const loadFromBackend = async () => {
      try {
        setLoadingWorkflow(true);
        setSaveError("");
        setSaveMessage("");

        const data = await getWorkflowByAgent(activeAgentId);
        const backendWorkflow = data?.workflow;

        if (!isMounted || !backendWorkflow) return;

        if (Array.isArray(backendWorkflow.nodes) && Array.isArray(backendWorkflow.edges)) {
          const sanitizedWorkflow = sanitizeWorkflow(backendWorkflow);

          setNodes(sanitizedWorkflow.nodes);
          setEdges(sanitizedWorkflow.edges);
          setSelectedNodeId(sanitizedWorkflow.nodes[0]?.id || null);
          nodeIdRef.current = sanitizedWorkflow.nodes.length + 1;

          localStorage.setItem(
            storageKey,
            JSON.stringify({
              nodes: sanitizedWorkflow.nodes,
              edges: sanitizedWorkflow.edges,
            }),
          );
        }
      } catch (error) {
        if (!isMounted) return;
        setSaveError(error.message || "Failed to load workflow.");
      } finally {
        if (isMounted) setLoadingWorkflow(false);
      }
    };

    loadFromBackend();

    return () => {
      isMounted = false;
    };
  }, [activeAgentId, storageKey]);

  return (
    <div className="grid min-h-[calc(100vh-10.5rem)] grid-cols-1 gap-3 lg:h-[calc(100vh-10.5rem)] lg:min-h-[680px] lg:grid-cols-[240px_minmax(0,1fr)_330px]">
      <aside className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] lg:min-h-0">
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Workflows</h2>
        </div>

        <div className="border-b border-[var(--color-border)] p-3">
          <Button className="w-full" leftIcon={<Plus size={14} />}>
            Create Workflow
          </Button>
          <div className="mt-3 space-y-1.5">
            {FLOW_LIST.map((flow, index) => (
              <button
                key={flow}
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  index === 0
                    ? "bg-[var(--color-hover)] text-[var(--color-text)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
                }`}
              >
                {flow}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Add Nodes</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1 lg:space-y-1.5">
            {NODE_LIBRARY.map((type) => {
              const meta = NODE_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  draggable
                  onDragStart={(event) => onDragStart(event, type)}
                  onDoubleClick={() => addNodeQuick(type)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-left transition hover:border-indigo-500/60 hover:bg-[var(--color-hover)]"
                >
                  <p className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{type}</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{meta.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] lg:min-h-0">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Workflow Editor</h2>
            <p className="text-xs text-[var(--color-muted)]">Drag from left panel, connect nodes, inspect on right panel</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!activeAgentId ? (
              <span className="text-xs text-amber-400">No agent selected</span>
            ) : null}
            {loadingWorkflow ? (
              <span className="text-xs text-sky-400">Loading workflow...</span>
            ) : null}
            {savedAt ? <span className="text-xs text-emerald-400">Saved {savedAt}</span> : null}
            <Button
              size="sm"
              leftIcon={<Save size={14} />}
              onClick={saveToMongo}
              isLoading={savingWorkflow}
            >
              Save Workflow
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download size={14} />}
              onClick={downloadJson}
            >
              Export
            </Button>
          </div>
        </div>

        {(saveError || saveMessage) ? (
          <div className="border-b border-[var(--color-border)] px-4 py-2">
            {saveError ? (
              <p className="text-xs text-rose-400">{saveError}</p>
            ) : (
              <p className="text-xs text-emerald-400">{saveMessage}</p>
            )}
          </div>
        ) : null}

        <div
          className="h-[55vh] min-h-[420px] w-full sm:h-[60vh] lg:h-[calc(100%-69px)]"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
            }}
          >
            <Background color={flowChrome.backgroundGrid} gap={18} size={1.2} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => node.data?.color || "#6366f1"}
              maskColor={flowChrome.overlayMask}
              className={flowChrome.chromeBgClass}
            />
            <Controls className={`${flowChrome.chromeBgClass} !border ${flowChrome.chromeBorderClass}`} />
          </ReactFlow>
        </div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] lg:min-h-0">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Inspector</h2>
          {selectedNode ? (
            <Badge variant="primary">{selectedNode.type}</Badge>
          ) : (
            <Badge>None</Badge>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 lg:h-[calc(100%-62px)] lg:max-h-none">
          {!selectedNode ? (
            <p className="text-sm text-[var(--color-muted)]">Select a node on canvas to edit settings.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Label
                </label>
                <input
                  value={selectedNode.data?.label || ""}
                  onChange={(event) => updateSelectedNode({ label: event.target.value })}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-input-text)] focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Instructions
                </label>
                <textarea
                  rows={7}
                  value={selectedNode.data?.instructions || ""}
                  onChange={(event) =>
                    updateSelectedNode({ instructions: event.target.value })
                  }
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-input-text)] focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5">
                <label className="flex items-center justify-between text-sm text-[var(--color-text)]">
                  Allow conversation
                  <input
                    type="checkbox"
                    checked={Boolean(selectedNode.data?.allowConversation)}
                    onChange={(event) =>
                      updateSelectedNode({ allowConversation: event.target.checked })
                    }
                    className="h-4 w-4 accent-indigo-500"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5">
                <p className="text-sm text-[var(--color-text)]">Advanced Settings</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">Node ID: {selectedNode.id}</p>
              </div>

              <Button
                variant={theme == 'dark'? "dangerDark" : "dangerLight"}
                className="w-full"
                leftIcon={<Trash2 size={14} />}
                onClick={deleteSelectedNode}
              >
                Delete Node
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function WorkflowEditor() {
  const { id } = useParams();

  return (
    <ReactFlowProvider>
      <WorkflowEditorCanvas key={id || "global"} agentId={id} />
    </ReactFlowProvider>
  );
}
