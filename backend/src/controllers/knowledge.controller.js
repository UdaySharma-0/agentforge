const Agent = require("../models/Agent");
const env = require("../config/env");

function getAiServiceEndpoint(path) {
  const baseUrl = env.AI_AGENT_SERVICE_URL.replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

async function ensureOwnedAgent(agentId, userId) {
  const agent = await Agent.findOne({
    _id: agentId,
    createdBy: userId,
  });

  if (!agent) {
    const error = new Error("Agent not found");
    error.statusCode = 404;
    throw error;
  }

  return agent;
}

async function parseProxyResponse(response, fallbackMessage) {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || data?.detail || fallbackMessage);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

exports.scrapeWebsite = async (req, res) => {
  try {
    const { agentId, url } = req.body;

    if (!agentId || !url) {
      return res.status(400).json({
        success: false,
        message: "agentId and url are required",
      });
    }

    await ensureOwnedAgent(agentId, req.user.id);

    const response = await fetch(getAiServiceEndpoint("/api/scrape-website"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentId, url }),
    });

    const data = await parseProxyResponse(response, "Website scrape failed");
    return res.json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { agentId, fileName, fileContentBase64, mimeType } = req.body;

    if (!agentId || !fileName || !fileContentBase64) {
      return res.status(400).json({
        success: false,
        message: "agentId, fileName, and fileContentBase64 are required",
      });
    }

    const agent = await ensureOwnedAgent(agentId, req.user.id);

    const fileBuffer = Buffer.from(fileContentBase64, "base64");
    const formData = new FormData();

    formData.append("agentId", agentId);
    formData.append(
      "file",
      new Blob([fileBuffer], {
        type: mimeType || "application/octet-stream",
      }),
      fileName,
    );

    const response = await fetch(getAiServiceEndpoint("/api/upload-document"), {
      method: "POST",
      body: formData,
    });

    const data = await parseProxyResponse(response, "Document upload failed");

    const documentEntry = {
      fileName,
      mimeType: mimeType || "application/octet-stream",
      sourceType: "document",
    };

    agent.documents.push(documentEntry);
    await agent.save();

    const savedDocument = agent.documents[agent.documents.length - 1];

    return res.json({
      ...data,
      document: savedDocument,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.saveManualText = async (req, res) => {
  try {
    const { agentId, text } = req.body;

    if (!agentId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "agentId and text are required",
      });
    }

    await ensureOwnedAgent(agentId, req.user.id);

    const response = await fetch(getAiServiceEndpoint("/api/manual-text"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentId, text }),
    });

    const data = await parseProxyResponse(response, "Manual knowledge save failed");
    return res.json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getKnowledgeByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    await ensureOwnedAgent(agentId, req.user.id);

    const response = await fetch(getAiServiceEndpoint(`/api/knowledge/agent/${agentId}`), {
      method: "GET",
    });

    const data = await parseProxyResponse(response, "Knowledge lookup failed");
    return res.json(data);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
