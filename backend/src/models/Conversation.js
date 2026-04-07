const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    customerId: {
      type: String,
      required: true,
      index: true
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    channel: {
      type: String,
      enum: ["whatsapp", "web", "api", "email", "chatbot"],
      default: "whatsapp"
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true
    },

    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

ConversationSchema.index({
  customerId: 1,
  agentId: 1,
  status: 1
});

module.exports = mongoose.model("Conversation", ConversationSchema);
