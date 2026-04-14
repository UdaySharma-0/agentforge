const Agent = require("../models/Agent");
const WidgetConfig = require("../models/WidgetConfig");
const EmailIntegration = require("../models/EmailIntegration");
const WhatsAppIntegration = require("../models/WhatsAppIntegration");

async function syncAgentStatus({ agentId, userId }) {
  if (!agentId || !userId) return null;

  const [hasWidget, hasEmail, hasWhatsApp] = await Promise.all([
    WidgetConfig.exists({ agentId, createdBy: userId }),
    EmailIntegration.exists({ agentId, businessId: userId, isActive: true }),
    WhatsAppIntegration.exists({ agentId, businessId: userId, isActive: true }),
  ]);

  const nextStatus = hasWidget || hasEmail || hasWhatsApp ? "active" : "draft";

  return Agent.findOneAndUpdate(
    { _id: agentId, createdBy: userId },
    { $set: { status: nextStatus } },
    { new: true },
  );
}

module.exports = {
  syncAgentStatus,
};
