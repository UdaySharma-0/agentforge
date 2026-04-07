const mongoose = require("mongoose");

const WhatsAppIntegrationSchema = new mongoose.Schema(
  {
    // Business & Agent mapping
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Business owner (using User model)
      required: true,
      index: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    // Meta Cloud API credentials
    phone_number_id: {
      type: String,
      required: true,
      unique: true, // Each phone links to ONE agent
      index: true,
    },

    access_token: {
      type: String,
      required: true,
      // NOTE: In production, encrypt this using crypto or AWS Secrets Manager
      // For now, store as-is, but mark environment variable as sensitive
    },

    waba_id: {
      type: String,
      required: true, // WhatsApp Business Account ID
    },

    phone_number: {
      type: String,
      required: true, // e.g., "+1234567890"
    },

    webhook_token: {
      type: String,
      required: true, // For webhook signature verification
    },

    // Status tracking
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Analytics
    messagesSent: {
      type: Number,
      default: 0,
    },

    messagesReceived: {
      type: Number,
      default: 0,
    },

    lastWebhookAt: {
      type: Date,
      default: null,
    },

    // Error tracking
    lastErrorAt: {
      type: Date,
      default: null,
    },

    lastErrorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound index for quick lookups
WhatsAppIntegrationSchema.index({
  businessId: 1,
  agentId: 1,
  isActive: 1,
});

module.exports = mongoose.model(
  "WhatsAppIntegration",
  WhatsAppIntegrationSchema
);
