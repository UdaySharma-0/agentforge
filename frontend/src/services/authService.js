import apiClient from "./apiClient";

export async function loginUser(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export const loginApi = loginUser;

export async function loginWithGoogle(credential) {
  const { data } = await apiClient.post("/auth/google", { credential });
  return data;
}

export async function registerUser(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function logoutUser() {
  const { data } = await apiClient.post(
    "/logout",
    {},
    {
      timeout: 800,
    },
  );

  return data;
}
