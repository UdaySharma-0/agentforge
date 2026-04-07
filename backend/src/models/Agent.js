const mongoose = require("mongoose");

const agentDocumentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
      trim: true,
    },
    sourceType: {
      type: String,
      default: "upload",
      trim: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    purpose: {
      type: String,
      required: true,
    },

    instructions: {
      tone: {
        type: String,
        enum: ["formal", "friendly", "professional"],
      },
      responseLength: {
        type: String,
        enum: ["short", "medium", "detailed"],
      },
    },

    channels: {
      type: [String],
      default: [],
    },

    documents: {
      type: [agentDocumentSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "active", "inactive"], // ✅ FIX HERE
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    engine: {
      type: String,
      enum: ["node", "python"],
      default: "node",
    },

    memoryWindow: {
      type: Number,
      default: 5,
      min: 2,
      max: 10
    }

  },
  { timestamps: true },
);

module.exports = mongoose.model("Agent", agentSchema);
