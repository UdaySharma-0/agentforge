const axios = require("axios");
const env = require("../config/env");
const Agent = require("../models/Agent");
const EmailIntegration = require("../models/EmailIntegration");
const { syncAgentStatus } = require("../utils/agentStatusSync");
const { encryptToken } = require("../utils/tokenEncryption");

async function exchangeGmailCode(req, res) {
  try {
    const { code, agentId, fallbackMessage } = req.body;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "OAuth code is required",
      });
    }

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: "agentId is required",
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      createdBy: userId,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found or you don't have permission",
      });
    }

    if (
      !env.GOOGLE_CLIENT_ID ||
      !env.GOOGLE_CLIENT_SECRET ||
      !env.GOOGLE_REDIRECT_URI
    ) {
      return res.status(500).json({
        success: false,
        message: "Google OAuth environment variables are not configured",
      });
    }

    console.log(
      `[EmailOAuth] Exchanging Gmail code for user ${userId}, agent ${agentId}`,
    );

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: env.GOOGLE_REDIRECT_URI,
      },
      {
        timeout: 10000,
      },
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!access_token || !refresh_token || !expires_in) {
      return res.status(400).json({
        success: false,
        message: "Failed to get Gmail access and refresh tokens",
      });
    }

    const profileResponse = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        timeout: 10000,
      },
    );

    const email = profileResponse.data?.emailAddress?.toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch connected Gmail address",
      });
    }

    const tokenExpiry = new Date(Date.now() + expires_in * 1000);
    const resolvedFallbackMessage =
      fallbackMessage?.trim() || env.EMAIL_FALLBACK_MESSAGE;

    const integration = await EmailIntegration.findOneAndUpdate(
      {
        agentId,
        email,
      },
      {
        $set: {
          businessId: userId,
          agentId,
          email,
          access_token: encryptToken(access_token),
          refresh_token: encryptToken(refresh_token),
          token_expiry: tokenExpiry,
          isActive: true,
          autoReply: true,
          fallbackMessage: resolvedFallbackMessage,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    await syncAgentStatus({ agentId, userId });

    return res.json({
      success: true,
      message: `Gmail connected successfully for ${email}`,
      data: {
        _id: integration._id,
        agentId: integration.agentId,
        businessId: integration.businessId,
        email: integration.email,
        isActive: integration.isActive,
        autoReply: integration.autoReply,
        fallbackMessage: integration.fallbackMessage,
        token_expiry: integration.token_expiry,
        lastCheckedAt: integration.lastCheckedAt,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      },
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    console.error("[EmailOAuth] Error:", errorMessage, error.response?.data);

    return res.status(500).json({
      success: false,
      message: `Gmail OAuth exchange failed: ${errorMessage}`,
    });
  }
}

module.exports = {
  exchangeGmailCode,
};
