const User = require("../models/User");
const Agent = require("../models/Agent");
const Workflow = require("../models/Workflow");
const Log = require("../models/log");

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAgents = await Agent.countDocuments();
    const activeWorkflows = await Workflow.countDocuments({ isActive: true });
    const totalLogs = await Log.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAgents,
        activeWorkflows,
        totalLogs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
