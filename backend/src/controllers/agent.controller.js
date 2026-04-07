const Agent = require("../models/Agent");
const { normalizeAgent, normalizeInstructions } = require("../utils/agentConfig");

// ==================================================
// CREATE AGENT (BASIC / FORM BASED)
// ==================================================
exports.createAgent = async (req, res) => {
  try {
    const { name, purpose, description, instructions, channels, memoryWindow, engine, status } =
      req.body;

    if (!name || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Agent name and purpose are required",
      });
    }

    const agent = await Agent.create({
      name,
      purpose,
      description,
      instructions: normalizeInstructions(instructions),
      channels,
      memoryWindow,
      engine: engine || "node",
      status: status || "draft",
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      agent: normalizeAgent(agent.toObject()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================================================
// GET ALL AGENTS (USER WISE)
// ==================================================
exports.getMyAgents = async (req, res) => {
  try {
    const agents = await Agent.find({
      createdBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agents.length,
      agents: agents.map((agent) => normalizeAgent(agent.toObject())),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================================================
// GET AGENT BY ID
// ==================================================
exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json({
      success: true,
      agent: normalizeAgent(agent.toObject()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================================================
// UPDATE AGENT
// ==================================================
exports.updateAgent = async (req, res) => {
  try {
    const updatePayload = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updatePayload, "instructions")) {
      updatePayload.instructions = normalizeInstructions(updatePayload.instructions);
    }

    const agent = await Agent.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updatePayload,
      { new: true }
    );

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json({
      success: true,
      agent: normalizeAgent(agent.toObject()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================================================
// DELETE AGENT
// ==================================================
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================================================
// FINAL AGENT SAVE (WIZARD COMPLETE)
// ==================================================
exports.createFullAgent = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, description, purpose, behavior, workflow, engine, instructions, memoryWindow, status } =
      req.body;

    if (!name || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Name and purpose are required",
      });
    }

    const agent = await Agent.create({
      name,
      description,
      purpose,
      workflow,
      engine: engine || "node",
      memoryWindow,
      instructions: normalizeInstructions(instructions || behavior),
      createdBy: userId,
      status: status || "draft",
    });

    res.status(201).json({
      success: true,
      agent: normalizeAgent(agent.toObject()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
