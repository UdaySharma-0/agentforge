import apiClient from "./apiClient";

export async function getSettings() {
  const { data } = await apiClient.get("/settings/me");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.patch("/settings/profile", payload);
  return data;
}

export async function updatePreferences(payload) {
  const { data } = await apiClient.patch("/settings/preferences", payload);
  return data;
}

export async function changePassword(payload) {
  const { data } = await apiClient.post("/settings/change-password", payload);
  return data;
}
