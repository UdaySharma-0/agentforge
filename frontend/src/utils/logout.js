import { logout as logoutAction } from "../app/authSlice";
import { logoutUser } from "../services/authService";

const LOCAL_STORAGE_KEYS = [
  "token",
  "user",
  "gmail_agent_id",
  "whatsapp_agent_id",
  "gmail_integration_setup",
  "whatsapp_integration_setup",
];

const LOCAL_STORAGE_PREFIXES = [
  "agentforge:selected-agent",
  "agentforge:chat-history",
  "agentforge:chat-customer-id",
];

export function clearClientSession() {
  if (typeof window === "undefined") return;

  LOCAL_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  const storageKeys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key) storageKeys.push(key);
  }

  storageKeys.forEach((key) => {
    if (LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  });

  sessionStorage.clear();
}

export async function performLogout(dispatch) {
  let error = null;

  try {
    await logoutUser();
  } catch (requestError) {
    error = requestError;
    console.warn("Logout request failed, clearing local session anyway.", requestError);
  } finally {
    clearClientSession();
    dispatch(logoutAction());
  }

  return { error };
}
