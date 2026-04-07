const Log = require("../models/log");

exports.getLogs = async (req, res) => {
 const logs = await Log.find()
  .populate("agentId", "name")
  .sort({ createdAt: -1 });

  res.json({
    success: true,
    logs,
  });
};
