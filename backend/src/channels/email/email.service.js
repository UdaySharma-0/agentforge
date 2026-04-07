const axios = require("axios");
const env = require("../../config/env");
const EmailIntegration = require("../../models/EmailIntegration");
const { encryptToken, decryptToken } = require("../../utils/tokenEncryption");

const GMAIL_API_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

class EmailService {
  async ensureValidToken(integration) {
    if (!integration?.token_expiry || integration.token_expiry <= new Date()) {
      return this.refreshAccessToken(integration);
    }

    return integration;
  }

  async refreshAccessToken(integration) {
    try {
      const refreshToken = decryptToken(integration.refresh_token);

      const response = await axios.post(
        GOOGLE_OAUTH_TOKEN_URL,
        {
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        },
        {
          timeout: 10000,
        },
      );

      const accessToken = response.data?.access_token;
      const expiresIn = response.data?.expires_in || 3600;

      if (!accessToken) {
        throw new Error("Google did not return a new access token");
      }

      const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      await EmailIntegration.updateOne(
        { _id: integration._id },
        {
          $set: {
            access_token: encryptToken(accessToken),
            token_expiry: tokenExpiry,
            isActive: true,
          },
        },
      );

      integration.access_token = encryptToken(accessToken);
      integration.token_expiry = tokenExpiry;

      return integration;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error_description ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;

      await EmailIntegration.updateOne(
        { _id: integration._id },
        {
          $set: {
            isActive: false,
          },
        },
      ).catch(() => {});

      throw new Error(`Failed to refresh Gmail token: ${errorMessage}`);
    }
  }

  async listUnreadMessages(integration, afterDate) {
    const activeIntegration = await this.ensureValidToken(integration);
    const accessToken = decryptToken(activeIntegration.access_token);
    const afterUnix = Math.floor((afterDate || new Date(0)).getTime() / 1000);
    const q = `is:unread after:${afterUnix}`;

    const response = await axios.get(`${GMAIL_API_BASE_URL}/messages`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q,
        maxResults: 25,
      },
      timeout: 10000,
    });

    return response.data?.messages || [];
  }

  async getMessage(integration, gmailMessageId) {
    const activeIntegration = await this.ensureValidToken(integration);
    const accessToken = decryptToken(activeIntegration.access_token);

    const response = await axios.get(
      `${GMAIL_API_BASE_URL}/messages/${gmailMessageId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          format: "full",
        },
        timeout: 10000,
      },
    );

    return response.data;
  }

  async markAsRead(integration, gmailMessageId) {
    const activeIntegration = await this.ensureValidToken(integration);
    const accessToken = decryptToken(activeIntegration.access_token);

    const response = await axios.post(
      `${GMAIL_API_BASE_URL}/messages/${gmailMessageId}/modify`,
      {
        removeLabelIds: ["UNREAD"],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    return response.data;
  }
}

module.exports = new EmailService();
