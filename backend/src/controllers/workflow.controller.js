const Workflow = require("../models/Workflow");
const Agent = require("../models/Agent");
const { executeWorkflow } = require("../services/workflowEngine");

async function ensureOwnedAgent(agentId, userId) {
  const agent = await Agent.findOne({
    _id: agentId,
    createdBy: userId,
  });

  if (!agent) {
    const error = new Error("Agent not found");
    error.statusCode = 404;
    throw error;
  }

  return agent;
}

// 🔹 CREATE / SAVE WORKFLOW
exports.createWorkflow = async (req, res) => {
  try {
    const { agentId, nodes, edges } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "agentId is required",
      });
    }

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({
        success: false,
        message: "nodes and edges must be arrays",
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      createdBy: req.user.id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    // Keep one active workflow per agent and update it on each save.
    const workflow = await Workflow.findOneAndUpdate(
      { agentId, isActive: true },
      { $set: { nodes, edges } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET WORKFLOW BY AGENT
exports.getWorkflowByAgent = async (req, res) => {
  try {
    await ensureOwnedAgent(req.params.agentId, req.user.id);

    const workflow = await Workflow.findOne({
      agentId: req.params.agentId,
      isActive: true,
    });

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// 🔹 EXECUTE WORKFLOW
exports.runWorkflow = async (req, res) => {
  try {
    const { input } = req.body;
    const channel = req.body.channel || req.query.channel || "chatbot";

    await ensureOwnedAgent(req.params.agentId, req.user.id);

    const workflow = await Workflow.findOne({
      agentId: req.params.agentId,
      isActive: true,
    });

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const result = await executeWorkflow({
      agentId: req.params.agentId,
      message: input,
      userId: req.user.id,
      channel,
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
