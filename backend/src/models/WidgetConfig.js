const mongoose = require("mongoose");

const widgetConfigSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      default: "#6366F1",
    },
    greeting: {
      type: [String],
      default: [],
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    allowedOrigins: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

widgetConfigSchema.index({ agentId: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("WidgetConfig", widgetConfigSchema);
