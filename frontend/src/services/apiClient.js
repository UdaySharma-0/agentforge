import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const LOGIN_ROUTE = "/login";

function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_ROUTE) return;
  window.location.assign(LOGIN_ROUTE);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    if (response?.data?.success === false) {
      const message = response.data.message || "Request failed";
      return Promise.reject(new Error(message));
    }

    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredToken();
      redirectToLogin();
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
