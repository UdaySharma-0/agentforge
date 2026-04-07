const axios = require("axios");
const Agent = require("../models/Agent");

const META_API_VERSION = "v19.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const DEFAULT_WHATSAPP_REDIRECT_URI = "http://localhost:5173/auth/whatsapp";

async function resolveWhatsAppBusinessAccount(accessToken) {
  const businessesResponse = await axios.get(
    `${META_GRAPH_URL}/me/businesses`,
    {
      params: {
        fields: "id,name,owned_whatsapp_business_accounts{id,name}",
        access_token: accessToken,
      },
      timeout: 10000,
    }
  );

  const businesses = businessesResponse.data?.data || [];

  console.log("[WhatsAppOAuth] Business lookup response", {
    businessCount: businesses.length,
  });

  for (const business of businesses) {
    const ownedWabas = business.owned_whatsapp_business_accounts?.data || [];

    if (ownedWabas.length > 0) {
      const selectedWaba = ownedWabas[0];

      console.log("[WhatsAppOAuth] Selected WABA from business", {
        businessId: business.id,
        businessName: business.name || null,
        wabaId: selectedWaba.id,
        wabaName: selectedWaba.name || null,
      });

      return selectedWaba.id;
    }
  }

  return null;
}

/**
 * Exchange OAuth code for access token
 * Frontend redirects user to Meta login, gets code back
 * This endpoint exchanges code for permanent access token
 *
 * Flow:
 * 1. Frontend opens: https://www.facebook.com/v18.0/dialog/oauth
 *    ?client_id=YOUR_APP_ID
 *    &redirect_uri=YOUR_FRONTEND_URL/auth/whatsapp
 *    &response_type=code
 *    &scopes=whatsapp_business_messaging,whatsapp_business_management,business_management
 *
 * 2. User logs in with Meta account
 * 3. User grants permission
 * 4. Redirected to: YOUR_FRONTEND_URL/auth/whatsapp?code=CODE
 *
 * 5. Frontend calls this endpoint:
 *    POST /api/auth/whatsapp/exchange-code
 *    { code, agentId }
 *
 * 6. Backend exchanges code for access_token
 * 7. Returns phone_number_id, waba_id, etc.
 * 8. Frontend passes these to POST /api/channels/whatsapp/integrations
 */
async function exchangeWhatsAppCode(req, res) {
  try {
    const { code, agentId } = req.body;
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const redirectUri =
      process.env.WHATSAPP_OAUTH_REDIRECT_URI ||
      DEFAULT_WHATSAPP_REDIRECT_URI;
    const webhookToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

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

    console.log(
      `[WhatsAppOAuth] OAuth code received for user=${userId}, agent=${agentId}, code_length=${code.length}`
    );

    const tokenResponse = await axios.post(
      `${META_GRAPH_URL}/oauth/access_token`,
      {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      },
      {
        timeout: 10000,
      }
    );

    console.log("[WhatsAppOAuth] Token exchange response", {
      status: tokenResponse.status,
      hasAccessToken: Boolean(tokenResponse.data?.access_token),
      expiresIn: tokenResponse.data?.expires_in ?? null,
      tokenType: tokenResponse.data?.token_type ?? null,
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Failed to get access token from Meta",
      });
    }

    console.log("[WhatsAppOAuth] Access token exchange succeeded");

    const wabaId = await resolveWhatsAppBusinessAccount(accessToken);

    if (!wabaId) {
      return res.status(400).json({
        success: false,
        message: "Failed to find a WhatsApp Business Account linked to this Meta user",
        hint: "Make sure the Meta login grants whatsapp_business_management and business_management, and that the account owns a WhatsApp Business Account",
      });
    }

    console.log(`[WhatsAppOAuth] WABA lookup succeeded: ${wabaId}`);

    const phoneNumbersResponse = await axios.get(
      `${META_GRAPH_URL}/${wabaId}/phone_numbers?access_token=${accessToken}`,
      { timeout: 10000 }
    );

    const phoneNumbers = phoneNumbersResponse.data.data || [];

    if (phoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No phone numbers found for this WhatsApp Business Account",
        instruction:
          "Please add a phone number in your Meta Business Account first",
      });
    }

    const phoneData = phoneNumbers[0];
    const phoneNumberId = phoneData.id;
    const phoneNumber = phoneData.phone_number;
    const displayName = phoneData.display_phone_number;

    console.log(
      `[WhatsAppOAuth] Phone number lookup succeeded: ${displayName} (ID: ${phoneNumberId})`
    );

    return res.json({
      success: true,
      data: {
        access_token: accessToken,
        phone_number_id: phoneNumberId,
        phone_number: phoneNumber,
        display_phone_number: displayName,
        waba_id: wabaId,
        webhook_token: webhookToken,
        message: `Successfully linked WhatsApp number: ${displayName}`,
      },
    });
  } catch (error) {
    console.error(
      `[WhatsAppOAuth] Error: ${error.message}`,
      error.response?.data
    );

    if (error.response?.status === 400) {
      const metaError = error.response.data?.error?.message || error.message;
      return res.status(400).json({
        success: false,
        message: `Meta API error: ${metaError}`,
        debug: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      hint: `Check your META_APP_ID, META_APP_SECRET, and WHATSAPP_OAUTH_REDIRECT_URI (fallback: ${DEFAULT_WHATSAPP_REDIRECT_URI})`,
    });
  }
}

module.exports = {
  exchangeWhatsAppCode,
};
