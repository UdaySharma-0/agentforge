const { parseWhatsAppWebhook } = require("./whatsapp.parser");
const whatsappService = require("./whatsapp.service");
const { processMessage } = require("../../core/messageProcessor");
const Message = require("../../models/Message");

/**
 * GET: Webhook Verification
 * Meta sends a challenge code to verify our endpoint
 */
async function handleWebhookVerification(req, res) {
  try {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const verify_token = req.query["hub.verify_token"];
    const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    console.log("[WebhookController] Webhook verification hit", {
      mode,
      hasChallenge: Boolean(challenge),
      tokenMatch: verify_token === WEBHOOK_VERIFY_TOKEN,
    });

    if (mode === "subscribe" && verify_token === WEBHOOK_VERIFY_TOKEN) {
      console.log("[WebhookController] Webhook verified successfully");
      return res.status(200).send(challenge);
    }

    console.warn("[WebhookController] Webhook verification failed");
    return res.sendStatus(403);
  } catch (error) {
    console.error(`[WebhookController] Verification error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * POST: Receive Incoming Messages
 * This is where WhatsApp messages arrive from Meta
 * Must always return 200 OK to avoid Meta retries
 */
async function handleIncomingMessage(req, res) {
  try {
    console.log("[WebhookController] Incoming message payload summary", {
      object: req.body?.object || null,
      entryCount: Array.isArray(req.body?.entry) ? req.body.entry.length : 0,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[WebhookController] Incoming message payload raw=${JSON.stringify(req.body).slice(0, 2000)}`
      );
    }

    res.status(200).json({ received: true });

    const parsed = parseWhatsAppWebhook(req.body);

    if (!parsed) {
      console.log(
        "[WebhookController] Skipped non-message event (status update, etc.)"
      );
      return;
    }

    const { wamid, from, text, phone_number_id, contact_name } = parsed;

    console.log(`[WebhookController] Incoming: ${from} -> "${text.substring(0, 100)}"`);

    const integration = await whatsappService.getAgentByPhone(phone_number_id);

    if (!integration) {
      console.warn(
        `[WebhookController] No agent found for phone: ${phone_number_id}`
      );
      return;
    }

    const existingMessage = await Message.findOne({
      "metadata.wamid": wamid,
    });

    if (existingMessage) {
      console.log(`[WebhookController] Duplicate message ignored: ${wamid}`);
      return;
    }

    const customerId = `wa-${from}`;

    console.log(
      `[WebhookController] Processing: customerId=${customerId}, agentId=${integration.agentId._id}`
    );

    const result = await processMessage({
      agentId: integration.agentId._id,
      customerId,
      message: text,
      channel: "whatsapp",
      businessId: integration.businessId,
      metadata: {
        wamid,
        contact_name,
        phone_number_id,
      },
    });

    console.log(
      `[WebhookController] Message processed: ${result.conversationId}`
    );

    sendReplyAsync(phone_number_id, from, result.reply).catch((err) => {
      console.error(`[WebhookController] Failed to send reply: ${err.message}`);
    });

    await whatsappService.recordMessageReceived(phone_number_id);
  } catch (error) {
    console.error(`[WebhookController] Error: ${error.message}`, error);
  }
}

async function sendReplyAsync(phone_number_id, to, message) {
  try {
    await whatsappService.sendMessage(phone_number_id, to, message);
    console.log(`[WebhookController] Reply sent to ${to}`);
  } catch (error) {
    console.error(
      `[WebhookController] Failed to send reply to ${to}: ${error.message}`
    );
  }
}

module.exports = {
  handleWebhookVerification,
  handleIncomingMessage,
};
