import apiClient from "./apiClient";

/**
 * WhatsApp Integration Service
 * Handles all API calls for WhatsApp channel setup
 */

/**
 * Exchange OAuth code for access token
 * Called after user authorizes on Meta login page
 *
 * @param {String} code - OAuth code from Meta
 * @param {String} agentId - Agent to link WhatsApp to
 * @returns {Promise} { access_token, phone_number_id, waba_id, webhook_token, ... }
 */
export async function exchangeWhatsAppCode(code, agentId) {
  const { data } = await apiClient.post("/auth/whatsapp/exchange-code", {
    code,
    agentId,
  });
  return data;
}

/**
 * Save WhatsApp integration
 * Stores phone number, access token, etc. to database
 *
 * @param {Object} payload
 * @param {String} payload.agentId - Agent ObjectId
 * @param {String} payload.phone_number_id - Meta phone number ID
 * @param {String} payload.access_token - Meta access token
 * @param {String} payload.waba_id - WhatsApp Business Account ID
 * @param {String} payload.phone_number - Phone number (e.g., "+919876543210")
 * @param {String} payload.webhook_token - Random token for webhook verification
 * @returns {Promise} { success, data: integration }
 */
export async function saveWhatsAppIntegration(payload) {
  const { data } = await apiClient.post(
    "/channels/whatsapp/integrations",
    payload
  );
  return data;
}

/**
 * List all WhatsApp integrations for current user
 *
 * @returns {Promise} { success, data: [integrations] }
 */
export async function listWhatsAppIntegrations() {
  const { data } = await apiClient.get("/channels/whatsapp/integrations");
  return data;
}

/**
 * Get single WhatsApp integration with setup instructions
 *
 * @param {String} integrationId - Integration MongoDB ObjectId
 * @returns {Promise} { success, data: integration }
 */
export async function getWhatsAppIntegration(integrationId) {
  const { data } = await apiClient.get(
    `/channels/whatsapp/integrations/${integrationId}`
  );
  return data;
}

/**
 * Disable/remove WhatsApp integration
 * Does soft delete (sets isActive: false)
 *
 * @param {String} integrationId - Integration MongoDB ObjectId
 * @returns {Promise} { success, message }
 */
export async function disableWhatsAppIntegration(integrationId) {
  const { data } = await apiClient.delete(
    `/channels/whatsapp/integrations/${integrationId}`
  );
  return data;
}

export async function listEmailIntegrations(agentId) {
  const { data } = await apiClient.get("/channels/email/integrations", {
    params: agentId ? { agentId } : undefined,
  });
  return data;
}

export async function disableEmailIntegration(integrationId) {
  const { data } = await apiClient.delete(
    `/channels/email/integrations/${integrationId}`
  );
  return data;
}

export async function exchangeGmailCode(code, agentId, fallbackMessage) {
  const { data } = await apiClient.post("/auth/gmail/exchange-code", {
    code,
    agentId,
    fallbackMessage,
  });
  return data;
}

/**
 * Get Meta OAuth authorization URL
 * User is redirected to this URL to authorize WhatsApp access
 *
 * @returns {String} URL to redirect user to
 */
export function getMetaOAuthUrl() {
  const clientId = import.meta.env.VITE_META_APP_ID;
  const redirectUri = import.meta.env.VITE_WHATSAPP_CALLBACK_URL;
  const scopes = [
    "whatsapp_business_messaging",
    "whatsapp_business_management",
    "business_management",
  ];

  if (!clientId || !redirectUri) {
    console.error(
      "Missing VITE_META_APP_ID or VITE_WHATSAPP_CALLBACK_URL environment variables"
    );
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(","),
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

export function getGoogleOAuthUrl() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri =
    import.meta.env.VITE_GMAIL_CALLBACK_URL ||
    `${window.location.origin}/auth/gmail`;
  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  if (!clientId || !redirectUri) {
    console.error(
      "Missing VITE_GOOGLE_CLIENT_ID or VITE_GMAIL_CALLBACK_URL environment variables"
    );
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: scopes.join(" "),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Generate Meta App URL for webhook configuration
 * User uses this to manually set webhook in Meta dashboard
 *
 * @param {String} webhookUrl - Backend webhook URL
 * @param {String} verifyToken - Webhook verification token
 * @returns {String} Instructions text
 */
export function getWebhookSetupInstructions(webhookUrl, verifyToken) {
  return `
1. Go to your Meta Business Account Dashboard
2. Select your WhatsApp app
3. Go to Configuration
4. Under "Webhook URL", enter:
   ${webhookUrl}
5. Under "Verify Token", enter:
   ${verifyToken}
6. Click "Verify and Save"
7. Subscribe to: messages
  `;
}
