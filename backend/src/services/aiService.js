const Groq = require("groq-sdk");
const env = require("../config/env");
const axios = require("axios");

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});


async function runPythonAI(agentConfig, message, conversationId) {
  console.log({agent_config: agentConfig,message,conversationId,})
  const baseOrEndpoint = env.AI_AGENT_SERVICE_URL.replace(/\/$/, "");
  const endpoint = /\/run-agent$/i.test(baseOrEndpoint)
    ? baseOrEndpoint
    : `${baseOrEndpoint}/api/run-agent`;

  try {
    const res = await axios.post(
      endpoint,
      {
        agent_config: agentConfig,
        message,
        conversationId,
      },
      {
        timeout: 45000,
      }
    );

    return res?.data?.reply || "No response from AI agent service.";
  } catch (error) {
    const details =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error.message;

    console.error("Python AI service error:", details);
    throw new Error(`Python AI service unavailable: ${details}`);
  }
}

// module.exports = { runAI, runPythonAI };


async function runAI(prompt) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Answer clearly and in simple language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: env.GROQ_MODEL || "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 300,
    });

    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI ERROR FULL:", error);
    return "AI service error.";
  }
}

module.exports = { runAI, runPythonAI };
