const { runAI, runPythonAI } = require("./aiService");
const { buildAgentConfig } = require("../utils/agentConfig");

// FIX: Accept channel in the destructured arguments and pass it to
// buildAgentConfig so kb_engine.py knows which channel this request
// is coming from (whatsapp / email / web / chatbot).
//
// Defaults to "chatbot" if not provided so existing callers don't break.

async function runAgentNode({ input, agent, conversationId, channel = "chatbot" }) {
  if (agent.engine === "python") {
    return await runPythonAI(
      buildAgentConfig(agent, channel), // FIX: pass channel here
      input,
      conversationId
    );
  }
}

module.exports = { runAgentNode };