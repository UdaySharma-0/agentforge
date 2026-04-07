const express = require("express");
const router = express.Router();
const webhookController = require("./webhook.controller");
const auth = require("../../middlewares/auth.middleware");
const WhatsAppIntegration = require("../../models/WhatsAppIntegration");
const { encryptToken, decryptToken } = require("../../utils/tokenEncryption");

// ============================================
// 🔓 PUBLIC ROUTES (NO AUTH - Meta webhooks)
// ============================================

/**
 * GET /api/channels/whatsapp/webhook
 * Webhook verification from Meta
 */
router.get("/webhook", webhookController.handleWebhookVerification);

/**
 * POST /api/channels/whatsapp/webhook
 * Incoming messages from Meta
 */
router.post("/webhook", webhookController.handleIncomingMessage);

// ============================================
// 🔒 PROTECTED ROUTES (WITH AUTH)
// ============================================

/**
 * GET /api/channels/whatsapp/integrations
 * List all WhatsApp integrations for current business
 */
router.get("/integrations", auth, async (req, res) => {
  try {
    const businessId = req.user?.id || req.user?.userId || req.user?._id;

    if (!businessId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    const integrations = await WhatsAppIntegration.find({
      businessId,
    })
      .populate("agentId", "name description status")
      .select("-access_token -webhook_token") // Hide sensitive data
      .sort({ createdAt: -1 });

    console.log(
      `[WhatsAppRoutes] Listed ${integrations.length} integrations for business ${businessId}`
    );

    return res.json({
      success: true,
      data: integrations,
    });
  } catch (error) {
    console.error(
      `[WhatsAppRoutes] List integrations error: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/channels/whatsapp/integrations
 * Create/save new WhatsApp integration
 * Body: {
 *   agentId: "...",
 *   phone_number_id: "...",
 *   access_token: "...",
 *   waba_id: "...",
 *   phone_number: "+1234567890",
 *   webhook_token: "..."
 * }
 */
router.post("/integrations", auth, async (req, res) => {
  try {
    const businessId = req.user?.id || req.user?.userId || req.user?._id;
    const {
      agentId,
      phone_number_id,
      access_token,
      waba_id,
      phone_number,
      webhook_token,
    } = req.body;

    // Validation
    if (
      !agentId ||
      !phone_number_id ||
      !access_token ||
      !waba_id ||
      !phone_number ||
      !webhook_token
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: agentId, phone_number_id, access_token, waba_id, phone_number, webhook_token",
      });
    }

    // Check if phone already integrated
    const existing = await WhatsAppIntegration.findOne({
      phone_number_id,
    });

    if (existing && existing.businessId.toString() !== businessId) {
      return res.status(409).json({
        success: false,
        message: "This WhatsApp phone is already linked to another business",
      });
    }

    // Encrypt sensitive tokens before storing
    const encryptedAccessToken = encryptToken(access_token);
    const encryptedWebhookToken = encryptToken(webhook_token);

    // Create or update integration
    let integration;

    if (existing) {
      // Update existing
      integration = await WhatsAppIntegration.findByIdAndUpdate(
        existing._id,
        {
          agentId,
          access_token: encryptedAccessToken,
          waba_id,
          phone_number,
          webhook_token: encryptedWebhookToken,
          isActive: true,
        },
        { new: true }
      );
      console.log(
        `[WhatsAppRoutes] Updated integration for ${phone_number_id}`
      );
    } else {
      // Create new
      integration = await WhatsAppIntegration.create({
        businessId,
        agentId,
        phone_number_id,
        access_token: encryptedAccessToken,
        waba_id,
        phone_number,
        webhook_token: encryptedWebhookToken,
      });
      console.log(
        `[WhatsAppRoutes] Created new integration for ${phone_number_id}`
      );
    }

    // Populate agent for response
    await integration.populate("agentId", "name");

    return res.json({
      success: true,
      message: "WhatsApp integration saved successfully",
      data: integration,
    });
  } catch (error) {
    console.error(
      `[WhatsAppRoutes] Create integration error: ${error.message}`
    );

    // Handle unique constraint error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This WhatsApp phone number is already integrated",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * DELETE /api/channels/whatsapp/integrations/:integrationId
 * Disable/remove WhatsApp integration
 */
router.delete("/integrations/:integrationId", auth, async (req, res) => {
  try {
    const businessId = req.user?.id || req.user?.userId || req.user?._id;
    const { integrationId } = req.params;

    // Find and verify ownership
    const integration = await WhatsAppIntegration.findById(integrationId);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Integration not found",
      });
    }

    if (integration.businessId.toString() !== businessId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this integration",
      });
    }

    // Soft delete by marking inactive
    await WhatsAppIntegration.findByIdAndUpdate(
      integrationId,
      { isActive: false },
      { new: true }
    );

    console.log(
      `[WhatsAppRoutes] Disabled integration: ${integration.phone_number_id}`
    );

    return res.json({
      success: true,
      message: "WhatsApp integration disabled",
    });
  } catch (error) {
    console.error(
      `[WhatsAppRoutes] Delete integration error: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/channels/whatsapp/integrations/:integrationId
 * Get single integration (with webhook setup instructions)
 */
router.get("/integrations/:integrationId", auth, async (req, res) => {
  try {
    const businessId = req.user?.id || req.user?.userId || req.user?._id;
    const { integrationId } = req.params;

    const integration = await WhatsAppIntegration.findById(integrationId)
      .populate("agentId", "name description")
      .select("-access_token"); // Hide access token

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "Integration not found",
      });
    }

    if (integration.businessId.toString() !== businessId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this integration",
      });
    }

    // Generate webhook URL for Meta configuration
    const webhookUrl = `${process.env.BACKEND_BASE_URL || "https://your-domain.com"}/api/channels/whatsapp/webhook`;

    return res.json({
      success: true,
      data: {
        ...integration.toObject(),
        webhookSetup: {
          url: webhookUrl,
          verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "WEBHOOK_VERIFY_TOKEN",
          instruction: "Configure this webhook URL and verify token in your Meta Business Account dashboard",
        },
      },
    });
  } catch (error) {
    console.error(
      `[WhatsAppRoutes] Get integration error: ${error.message}`
    );
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
