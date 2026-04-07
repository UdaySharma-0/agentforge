const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Log = require("../models/log");
const { runAgentNode } = require("../services/agentEngine");
const { v4: uuidv4 } = require("uuid");
const Agent = require("../models/Agent");
const Workflow = require("../models/Workflow");

/**
 * ⭐ CORE MESSAGE PROCESSOR - Channel Agnostic
 *
 * This function is the heart of the system. It:
 * 1. Finds or creates a conversation
 * 2. Saves the user message
 * 3. Calls the agent engine
 * 4. Saves the assistant response
 * 5. Creates a log entry
 *
 * Works for ANY channel: web, whatsapp, telegram, instagram, etc.
 *
 * @param {Object} params
 * @param {String} params.agentId - MongoDB ObjectId of the agent
 * @param {String} params.customerId - Unique customer identifier (e.g., "wa-919876543210", "web-user@email.com")
 * @param {String} params.message - The user's message text
 * @param {String} params.channel - Channel name (default: "chatbot")
 * @param {String} params.businessId - MongoDB ObjectId of the business owner
 * @param {Object} params.metadata - Additional metadata (e.g., wamid, contact_name)
 *
 * @returns {Object} { success, conversationId, reply, userMessageId, assistantMessageId }
 * @throws {Error} If agent not found, database error, or LLM service error
 */
async function processMessage({
  agentId,
  customerId,
  message,
  channel = "chatbot",
  businessId,
  metadata = {},
}) {
  try {
    if (!agentId || !customerId || !message) {
      throw new Error("agentId, customerId, and message are required");
    }

    // ✅ STEP 1: Find or create conversation
    let conversation = await Conversation.findOne({
      customerId,
      agentId,
      status: "active",
    });

    if (!conversation) {
      conversation = await Conversation.create({
        conversationId: `conv_${uuidv4()}`,
        customerId,
        agentId,
        businessId,
        channel,
      });
      console.log(
        `[messageProcessor] Created new conversation: ${conversation.conversationId}`
      );
    }

    // ✅ STEP 2: Save user message
    const userMessage = await Message.create({
      conversationId: conversation.conversationId,
      role: "user",
      content: message,
      metadata: {
        source: metadata.source || "user",
        ...metadata,
      },
    });

    console.log(
      `[messageProcessor] Saved user message for ${conversation.conversationId}`
    );

    // ✅ STEP 3: Fetch agent and run agent node
    const agent = await Agent.findById(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const runtimeAgent =
      agent.engine === "python"
        ? agent
        : { ...agent.toObject(), engine: "python" };

    // Run agent (handles both node and python engines)
    let agentResponse = await runAgentNode({
      input: message,
      agent: runtimeAgent,
      conversationId: conversation.conversationId,
      channel,
    });

    // Sanitize response
    const reply =
      typeof agentResponse === "string" && agentResponse.trim()
        ? agentResponse
        : "I could not generate a reply right now.";

    // ✅ STEP 4: Save assistant message
    const assistantMessage = await Message.create({
      conversationId: conversation.conversationId,
      role: "assistant",
      content: reply,
      metadata: {
        source: "llm",
      },
    });

    console.log(
      `[messageProcessor] Saved assistant message for ${conversation.conversationId}`
    );

    // ✅ STEP 5: Log and update conversation (async, non-blocking)
    const workflow = await Workflow.findOne({
      agentId,
      isActive: true,
    }).catch(() => null); // Silently fail if no workflow

    Promise.all([
      Log.create({
        userId: businessId,
        agentId,
        workflowId: workflow?._id,
        input: message,
        output: reply,
        status: "success",
        metadata: {
          channel,
          customerId,
          conversationId: conversation.conversationId,
        },
      }),
      Conversation.updateOne(
        { _id: conversation._id },
        { $set: { lastMessageAt: new Date() } }
      ),
    ]).catch((err) => {
      console.error(
        `[messageProcessor] Non-critical persistence error: ${err.message}`
      );
    });

    return {
      success: true,
      conversationId: conversation.conversationId,
      reply,
      userMessageId: userMessage._id,
      assistantMessageId: assistantMessage._id,
    };
  } catch (error) {
    console.error(`[messageProcessor] Error: ${error.message}`, error);
    throw error;
  }
}

module.exports = { processMessage };
