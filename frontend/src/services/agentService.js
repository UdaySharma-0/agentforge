import apiClient from "./apiClient";

export async function getAgents() {
  const { data } = await apiClient.get("/agents");
  return data;
}

export async function getAgentById(id) {
  const { data } = await apiClient.get(`/agents/${id}`);
  return data;
}

export async function createAgent(payload) {
  const { data } = await apiClient.post("/agents", payload);
  return data;
}

export async function updateAgent(id, payload) {
  const { data } = await apiClient.put(`/agents/${id}`, payload);
  return data;
}

export async function deleteAgent(id) {
  const { data } = await apiClient.delete(`/agents/${id}`);
  return data;
}

// Backward-compatible export for existing consumers.
export async function chatWithAgent(payload) {
  const { data } = await apiClient.post("/chat", payload);
  return data;
}
