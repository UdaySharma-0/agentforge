const crypto = require("crypto");

/**
 * Safely parse Meta Cloud API webhook payload
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-example
 *
 * @param {Object} body - Raw request body from Meta
 * @returns {Object|null} Parsed message data or null if not a message event
 */
function parseWhatsAppWebhook(body) {
  try {
    // Meta sends array of entries
    if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
      console.log("[WhatsAppParser] No entries in payload");
      return null;
    }

    const entry = body.entry[0];
    if (!entry.changes || !Array.isArray(entry.changes)) {
      console.log("[WhatsAppParser] No changes in entry");
      return null;
    }

    const change = entry.changes[0];
    if (!change.value) {
      console.log("[WhatsAppParser] No value in change");
      return null;
    }

    const value = change.value;
    const metadata = value.metadata || {};
    const messages = value.messages || [];
    const contacts = value.contacts || [];
    const statuses = value.statuses || []; // Delivery/read receipts

    // Not a message event - could be delivery receipt, read receipt, etc.
    if (messages.length === 0) {
      console.log(
        `[WhatsAppParser] Skipping non-message event. Statuses: ${statuses.length}`
      );
      return null;
    }

    const message = messages[0];

    // Only handle text messages for MVP
    if (message.type !== "text") {
      console.log(`[WhatsAppParser] Skipping non-text message type: ${message.type}`);
      return null;
    }

    // Extract text
    if (!message.text || !message.text.body) {
      console.log("[WhatsAppParser] Message has no text body");
      return null;
    }

    const contact = contacts[0] || {};

    const parsed = {
      wamid: message.id, // Unique message ID (for deduplication)
      from: message.from, // Sender's phone number (without +)
      text: message.text.body,
      timestamp: parseInt(message.timestamp), // Unix timestamp
      phone_number_id: metadata.phone_number_id, // Our phone number ID
      contact_name: contact.profile?.name || "Unknown",

      // For future extensions (media, location, etc.)
      messageType: message.type,
      rawMessage: message, // Keep full message for debugging
    };

    console.log(`[WhatsAppParser] Parsed message from ${parsed.from}: "${parsed.text.substring(0, 50)}..."`);
    return parsed;
  } catch (error) {
    console.error(`[WhatsAppParser] Parse error: ${error.message}`);
    return null;
  }
}

/**
 * Verify webhook signature (Meta security requirement)
 * All incoming webhooks are signed with your token
 *
 * @param {String} rawBody - Raw request body (must be string, not parsed JSON)
 * @param {String} signature - x-hub-signature-256 header value (e.g., "sha256=abc123...")
 * @param {String} webhook_token - Your webhook token from environment
 * @returns {Boolean} true if signature is valid
 */
function verifyWebhookSignature(rawBody, signature, webhook_token) {
  if (!signature || !webhook_token) {
    console.warn("[WhatsAppParser] Signature or webhook_token missing");
    return false;
  }

  try {
    // Signature format: "sha256=abc123"
    const expectedSignature = crypto
      .createHmac("sha256", webhook_token)
      .update(rawBody)
      .digest("hex");

    const sig = signature.split("=")[1];
    const isValid = sig === expectedSignature;

    if (!isValid) {
      console.warn("[WhatsAppParser] Invalid signature");
    }

    return isValid;
  } catch (error) {
    console.error(`[WhatsAppParser] Signature verification error: ${error.message}`);
    return false;
  }
}

module.exports = {
  parseWhatsAppWebhook,
  verifyWebhookSignature,
};
