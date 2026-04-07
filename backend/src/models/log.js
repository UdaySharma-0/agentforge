const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    userId: {
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
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      index: true,
    },
    channel: {
      type: String,
      enum: ["whatsapp", "web", "api", "email", "chatbot"],
      default: "chatbot",
      index: true,
    },
    input: {
      type: String,
      required: true,
      trim: true,
    },
    output: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["success", "failed", "pending"],
      default: "success",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

logSchema.index({ userId: 1, agentId: 1, createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
