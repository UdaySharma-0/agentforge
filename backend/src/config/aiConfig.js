const env = require("./env");

const aiConfig = {
  provider: env.AI_PROVIDER, // groq

  model: env.GROQ_MODEL,

//   systemPrompt: `
// You are an intelligent AI agent created using AgentForge.
// Follow the instructions strictly.
// Be helpful, accurate, and concise.
// `,

  temperature: 0.3,
  maxTokens: 500,
};

module.exports = aiConfig;
