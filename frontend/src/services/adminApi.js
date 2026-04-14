import apiClient from "./apiClient";

export async function getDashboardStats() {
  const { data } = await apiClient.get("/admin/dashboard");
  return data;
}

export async function getUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data;
}

export async function getAgents() {
  const { data } = await apiClient.get("/admin/agents");
  return data;
}

export async function getAnalytics() {
  const { data } = await apiClient.get("/admin/analytics");
  return data;
}

export async function updateUserRole(userId, role) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/role`, { role });
  return data;
}

export async function deleteAgentAdmin(agentId) {
  const { data } = await apiClient.delete(`/admin/agents/${agentId}`);
  return data;
}

export async function updateAgentStatus(agentId, status) {
  const { data } = await apiClient.patch(`/admin/agents/${agentId}/status`, {
    status,
  });
  return data;
}
