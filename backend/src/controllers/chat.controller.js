const { executeAgentChat } = require("../services/chatRuntime");

exports.chatWithAgent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    const { agentId, message, customerId } = req.body;
    const channel = req.body.channel || req.query.channel || "chatbot";
    const result = await executeAgentChat({
      agentId,
      message,
      customerId,
      userId,
      channel,
      logUserId: userId,
    });

    return res.json({
      success: true,
      conversationId: result.conversationId,
      reply: result.reply,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
