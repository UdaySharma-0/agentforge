import apiClient from "./apiClient";

export async function createWorkflow(payload) {
  const { data } = await apiClient.post("/workflows", payload);
  return data;
}

export const saveWorkflow = createWorkflow;

export async function getWorkflowByAgent(agentId) {
  const { data } = await apiClient.get(`/workflows/agent/${agentId}`);
  return data;
}

export async function runWorkflow(agentId, payload) {
  const { data } = await apiClient.post(`/workflows/run/${agentId}`, payload);
  return data;
}
