const express = require("express");
const auth = require("../middlewares/auth.middleware");
const EmailIntegration = require("../models/EmailIntegration");
const { syncAgentStatus } = require("../utils/agentStatusSync");

const router = express.Router();

router.get("/integrations", auth, async (req, res) => {
  try {
    const businessId = req.user?.id || req.user?.userId || req.user?._id;
    const { agentId } = req.query;

    const query = {
      businessId,
      isActive: true,
    };

    if (agentId) {
      query.agentId = agentId;
    }

    const integrations = await EmailIntegration.find(query)
      .sort({ createdAt: -1 })
      .populate("agentId", "name");

    return res.json({
      success: true,
      data: integrations,
    });
  } catch (error) {
    console.error("[EmailRoutes] List integrations error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/integrations/:integrationId", auth, async (req, res) => {
  try {
    const businessId = req.user?.id || req.user?.userId || req.user?._id;
    const { integrationId } = req.params;

    const integration = await EmailIntegration.findById(integrationId);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Gmail integration not found",
      });
    }

    if (integration.businessId.toString() !== businessId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to disconnect this Gmail integration",
      });
    }

    await EmailIntegration.findByIdAndUpdate(
      integrationId,
      { isActive: false },
      { new: true },
    );

    await syncAgentStatus({
      agentId: integration.agentId,
      userId: businessId,
    });

    return res.json({
      success: true,
      message: "Gmail integration disconnected",
    });
  } catch (error) {
    console.error("[EmailRoutes] Disconnect integration error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
