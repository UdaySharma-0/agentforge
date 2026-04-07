const axios = require("axios");
const WhatsAppIntegration = require("../../models/WhatsAppIntegration");
const { decryptToken } = require("../../utils/tokenEncryption");

const META_API_VERSION = "v19.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * WhatsApp Service - Handles all Meta Cloud API interactions
 */
class WhatsAppService {
  /**
   * Send text message via Meta Cloud API
   *
   * @param {String} phone_number_id - Your WhatsApp phone number ID
   * @param {String} to - Recipient phone number (e.g., "919876543210" or "+919876543210")
   * @param {String} message - Message text to send
   * @returns {Object} { success: true, wamid: "...", timestamp: Date }
   * @throws {Error} If API call fails
   */
  async sendMessage(phone_number_id, to, message) {
    try {
      // Find integration to get access token
      const integration = await WhatsAppIntegration.findOne({
        phone_number_id,
        isActive: true,
      });

      if (!integration) {
        throw new Error(`WhatsApp integration not found for ${phone_number_id}`);
      }

      // Decrypt access token
      let accessToken;
      try {
        accessToken = decryptToken(integration.access_token);
      } catch (decryptError) {
        console.error(`[WhatsAppService] Token decryption failed: ${decryptError.message}`);
        throw new Error("Failed to decrypt WhatsApp access token. Please re-authenticate.");
      }

      // Clean phone number (Meta expects just digits)
      const cleanPhone = to.replace(/\D/g, "");

      console.log(
        `[WhatsAppService] Sending to ${cleanPhone} via ${phone_number_id}`
      );

      // Call Meta API
      const response = await axios.post(
        `${META_GRAPH_URL}/${phone_number_id}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: {
            preview_url: false,
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("[WhatsAppService] Send message response", {
        status: response.status,
        hasMessages: Array.isArray(response.data?.messages),
        contactCount: response.data?.contacts?.length || 0,
      });

      // Update metrics
      await WhatsAppIntegration.updateOne(
        { _id: integration._id },
        {
          $inc: { messagesSent: 1 },
          $set: { lastWebhookAt: new Date() },
        }
      ).catch((err) => {
        console.error(`[WhatsAppService] Metrics update failed: ${err.message}`);
      });

      const wamid = response.data.messages?.[0]?.id || "unknown";
      console.log(`[WhatsAppService] Message sent successfully. WAMID: ${wamid}`);

      return {
        success: true,
        wamid,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message;

      console.error(`[WhatsAppService] Send failed: ${errorMsg}`);

      // Update error tracking
      await WhatsAppIntegration.updateOne(
        { phone_number_id },
        {
          $set: {
            lastErrorAt: new Date(),
            lastErrorMessage: errorMsg.substring(0, 255),
          },
        }
      ).catch(() => {});

      throw new Error(`WhatsApp send error: ${errorMsg}`);
    }
  }

  /**
   * Find agent and integration by phone number ID
   *
   * @param {String} phone_number_id - WhatsApp phone number ID
   * @returns {Object} Integration document with populated agentId
   */
  async getAgentByPhone(phone_number_id) {
    try {
      const integration = await WhatsAppIntegration.findOne({
        phone_number_id,
        isActive: true,
      }).populate("agentId");

      if (!integration) {
        console.warn(`[WhatsAppService] No integration for phone: ${phone_number_id}`);
        return null;
      }

      return integration;
    } catch (error) {
      console.error(
        `[WhatsAppService] Failed to get agent by phone: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Get integration by phone number ID (even if inactive)
   * Used for webhook signature verification
   *
   * @param {String} phone_number_id - WhatsApp phone number ID
   * @returns {Object} Integration document
   */
  async getIntegrationByPhoneId(phone_number_id) {
    try {
      return await WhatsAppIntegration.findOne({
        phone_number_id,
      });
    } catch (error) {
      console.error(
        `[WhatsAppService] Failed to get integration: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Mark message as received (for analytics)
   *
   * @param {String} phone_number_id - WhatsApp phone number ID
   */
  async recordMessageReceived(phone_number_id) {
    try {
      await WhatsAppIntegration.updateOne(
        { phone_number_id },
        {
          $inc: { messagesReceived: 1 },
          $set: { lastWebhookAt: new Date() },
        }
      );
    } catch (error) {
      console.error(
        `[WhatsAppService] Failed to record received message: ${error.message}`
      );
    }
  }
}

module.exports = new WhatsAppService();
