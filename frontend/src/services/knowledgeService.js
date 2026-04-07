import apiClient from "./apiClient";

export async function getKnowledge(agentId) {
  const { data } = await apiClient.get(`/knowledge/agent/${agentId}`);
  return data;
}

export async function updateKnowledge(agentId, payload) {
  const { data } = await apiClient.put(`/agents/${agentId}`, payload);
  return data;
}

export async function scrapeKnowledgeWebsite(payload) {
  const { data } = await apiClient.post("/knowledge/scrape-website", payload);
  return data;
}

export async function uploadKnowledgeDocument(payload) {
  const { data } = await apiClient.post("/knowledge/upload-document", payload);
  return data;
}

export async function saveManualKnowledge(payload) {
  const { data } = await apiClient.post("/knowledge/manual-text", payload);
  return data;
}
