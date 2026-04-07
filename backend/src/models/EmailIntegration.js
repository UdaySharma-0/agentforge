const mongoose = require("mongoose");

const EmailIntegrationSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    access_token: {
      type: String,
      required: true,
    },

    refresh_token: {
      type: String,
      required: true,
    },

    token_expiry: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    autoReply: {
      type: Boolean,
      default: true,
    },

    fallbackMessage: {
      type: String,
      default: null,
      trim: true,
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

EmailIntegrationSchema.index({
  businessId: 1,
  agentId: 1,
  isActive: 1,
});

EmailIntegrationSchema.index(
  {
    email: 1,
    agentId: 1,
  },
  {
    unique: true,
  },
);

EmailIntegrationSchema.index({
  isActive: 1,
  lastCheckedAt: 1,
});

module.exports = mongoose.model("EmailIntegration", EmailIntegrationSchema);
