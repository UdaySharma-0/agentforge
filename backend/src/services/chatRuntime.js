const { v4: uuidv4 } = require("uuid");
const Agent = require("../models/Agent");
const Workflow = require("../models/Workflow");
const Log = require("../models/log");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { runAgentNode } = require("./agentEngine");

const AI_NODE_TYPES = new Set([
  "agent",
  "ai_node",
  "autonomousnode",
  "autonomous_node",
]);

function isAiNode(node) {
  const nodeType = String(
    node?.type || node?.data?.nodeType || ""
  ).toLowerCase();
  return AI_NODE_TYPES.has(nodeType);
}

async function executeAgentChat({
  agentId,
  message,
  customerId,
  userId,
  channel = "web",
  requireActiveAgent = false,
  logUserId = null,
}) {
  const inputText = typeof message === "string" ? message.trim() : "";

  if (!customerId) {
    const error = new Error("customerId is required");
    error.status = 400;
    throw error;
  }

  if (!agentId || !inputText) {
    const error = new Error("agentId and message are required");
    error.status = 400;
    throw error;
  }

  const agentQuery = { _id: agentId, createdBy: userId };
  if (requireActiveAgent) agentQuery.status = "active";

  const agent = await Agent.findOne(agentQuery);
  if (!agent) {
    const error = new Error("Agent not found");
    error.status = 404;
    throw error;
  }

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
      businessId: agent.createdBy,
      channel,
    });
  }

  const workflow = await Workflow.findOne({ agentId, isActive: true });
  const aiNodes = Array.isArray(workflow?.nodes)
    ? workflow.nodes.filter(isAiNode)
    : [];

  const runtimeAgent =
    agent.engine === "python"
      ? agent
      : { ...agent.toObject(), engine: "python" };

  // FIX: Pass channel into runAgentNode so it travels all the way to
  // buildAgentConfig → runPythonAI → kb_engine.py.
  // Previously channel was available here but never forwarded downstream.

  let currentData = inputText;
  if (aiNodes.length === 0) {
    currentData = await runAgentNode({
      input: currentData,
      agent: runtimeAgent,
      conversationId: conversation.conversationId,
      channel, // FIX: added
    });
  } else {
    for (const _node of aiNodes) {
      currentData = await runAgentNode({
        input: currentData,
        agent: runtimeAgent,
        conversationId: conversation.conversationId,
        channel, // FIX: added
      });
    }
  }

  const reply =
    typeof currentData === "string" && currentData.trim()
      ? currentData
      : "I could not generate a reply right now.";

  try {
    const persistenceTasks = [
      Message.insertMany([
        {
          conversationId: conversation.conversationId,
          role: "user",
          content: inputText,
        },
        {
          conversationId: conversation.conversationId,
          role: "assistant",
          content: reply,
        },
      ]),
      Conversation.updateOne(
        { _id: conversation._id },
        { $set: { lastMessageAt: new Date() } }
      ),
    ];

    if (logUserId) {
      persistenceTasks.push(
        Log.create({
          userId: logUserId,
          agentId,
          workflowId: workflow?._id,
          channel,
          input: inputText,
          output: reply,
          status: "success",
        })
      );
    }

    await Promise.all(persistenceTasks);
  } catch (persistError) {
    console.error("Chat persistence warning:", persistError.message);
  }

  return {
    success: true,
    conversationId: conversation.conversationId,
    reply,
    agent,
  };
}

module.exports = { executeAgentChat };
