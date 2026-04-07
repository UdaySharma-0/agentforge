const Workflow = require("../models/Workflow");
const Agent = require("../models/Agent");
const { runAgentNode } = require("./agentEngine");
const { createLog } = require("../utils/logger");

function getNodeType(node) {
  return String(node?.type || node?.data?.nodeType || "").toLowerCase();
}

async function executeWorkflow({ agentId, message, userId, channel = "chatbot" }) {
  // 1️⃣ Active workflow fetch
  const workflow = await Workflow.findOne({
    agentId,
    isActive: true,
  });

  if (!workflow) {
    throw new Error("Active workflow not found");
  }

  // 2️⃣ Agent fetch
  const agent = await Agent.findById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }

  let currentData = message;

  // 3️⃣ Execute nodes in sequence
  for (const node of workflow.nodes) {
    const nodeType = getNodeType(node);

    if (nodeType === "input" || nodeType === "start") {
      currentData = message;
    }

    if (nodeType === "agent" || nodeType === "ai_node") {
      currentData = await runAgentNode({
        input: currentData,
        agent,
        channel,
      });
    }

    if (nodeType === "output" || nodeType === "end") {
      break;
    }
  }

  // 4️⃣ Save log
  await createLog({
    userId,
    agentId,
    workflowId: workflow._id,
    channel,
    input: message,
    output: currentData,
    status: "success",
  });

  return currentData;
}

module.exports = { executeWorkflow };
