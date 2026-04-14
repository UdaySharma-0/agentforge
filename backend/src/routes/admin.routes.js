const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");

const User = require("../models/User");
const Agent = require("../models/Agent");
const Workflow = require("../models/Workflow");
const Log = require("../models/log");

// 🔹 Admin Dashboard Stats
router.get("/dashboard", auth, admin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalAgents = await Agent.countDocuments();
  const totalWorkflows = await Workflow.countDocuments();
  const totalLogs = await Log.countDocuments();

  res.json({
    success: true,
    data: {
      totalUsers,
      totalAgents,
      totalWorkflows,
      totalLogs,
    },
  });
});

// 🔹 All Users
router.get("/users", auth, admin, async (req, res) => {
  const users = await User.find().select("-password");
res.json({ success: true, users });
});

router.patch("/users/:id/role", auth, admin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either user or admin",
      });
    }

    if (req.user.id === req.params.id && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot remove your own admin access",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 All Logs
router.get("/logs", auth, admin, async (req, res) => {
  const logs = await Log.find()
    .populate("agentId")
    .populate("userId")
    .sort({ createdAt: -1 });

  res.json({ success: true, logs });


});


// 🔹 All Agents (Admin)
router.get("/agents", auth, admin, async (req, res) => {
  try {
    const agents = await Agent.find()
      .populate("createdBy", "email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// 🔹 Delete Agent (Admin)
router.delete("/agents/:id", auth, admin, async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// 🔹 Update Agent Status (Admin)
router.patch("/agents/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 All Workflows (Admin)
router.get("/workflows", auth, admin, async (req, res) => {
  try {
    const workflows = await Workflow.find()
      .populate("agentId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      workflows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 Toggle Workflow Active Status (Admin)
router.patch("/workflows/:id/status", auth, admin, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    workflow.isActive = !workflow.isActive;
    await workflow.save();

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 Delete Workflow (Admin)
router.delete("/workflows/:id", auth, admin, async (req, res) => {
  try {
    await Workflow.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 Admin Analytics
router.get("/analytics", auth, admin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const agentsCount = await Agent.countDocuments();
    const workflowsCount = await Workflow.countDocuments();
    const logsCount = await Log.countDocuments();

    res.json({
      success: true,
      data: {
        usersCount,
        agentsCount,
        workflowsCount,
        logsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;
