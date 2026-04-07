const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const Agent = require("../models/Agent");
const Workflow = require("../models/Workflow");
const Log = require("../models/log");

// 🔥 Dashboard summary API
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const agentIds = await Agent.find({ createdBy: userId }).distinct("_id");

    const totalAgents = await Agent.countDocuments({
      createdBy: userId,
    });

    const activeWorkflows = await Workflow.countDocuments({
      agentId: { $in: agentIds },
      isActive: true,
    });

    const totalLogs = await Log.countDocuments({
      userId,
    });

    res.json({
      success: true,
      data: {
        totalAgents,
        activeWorkflows,
        totalLogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Dashboard data fetch failed",
    });
  }
});

// 🔥 Recent activity API
router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const recentAgents = await Agent.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name status createdAt");

    const recentLogs = await Log.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("agentId", "name");

    res.json({
      success: true,
      data: {
        recentAgents,
        recentLogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Recent dashboard data fetch failed",
    });
  }
});


module.exports = router;
