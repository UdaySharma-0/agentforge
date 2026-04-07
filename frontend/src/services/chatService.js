import apiClient from "./apiClient";

export async function sendChatMessage(payload) {
  const { data } = await apiClient.post("/chat", payload);
  return data;
}
