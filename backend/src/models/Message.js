const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"],
      required: true
    },

    content: {
      type: String,
      required: true
    },

    metadata: {
      source: {
        type: String,
        enum: ["llm", "kb", "tool", "user"],
        default: "llm"
      },
      tokens: Number,
      wamid: String,
      contact_name: String,
      phone_number_id: String,
      gmailMessageId: String,
      gmailThreadId: String,
      emailMessageId: String,
      from: String,
      subject: String,
      inReplyTo: String,
      references: String
    }
  },
  {
    timestamps: true
  }
);


MessageSchema.index({
  conversationId: 1,
  createdAt: -1
});

module.exports = mongoose.model("Message", MessageSchema);
