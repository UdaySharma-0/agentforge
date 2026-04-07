const SESSION_AGENT_KEY_PREFIX = "agentforge:selected-agent";
const SESSION_CHAT_HISTORY_KEY_PREFIX = "agentforge:chat-history";
const SESSION_CUSTOMER_ID_KEY_PREFIX = "agentforge:chat-customer-id";

function decodeJwtPayload(token) {
  try {
    const [, payload = ""] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

export function getSessionScope() {
  if (typeof window === "undefined") return "server";

  const token = localStorage.getItem("token");
  if (!token) return "guest";

  const payload = decodeJwtPayload(token);
  const identity =
    payload?.id ||
    payload?.userId ||
    payload?._id ||
    payload?.email ||
    payload?.sub;

  if (identity) {
    return String(identity);
  }

  return token.slice(-12);
}

function getScopedKey(prefix) {
  return `${prefix}:${getSessionScope()}`;
}

export function getStoredAgentId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(getScopedKey(SESSION_AGENT_KEY_PREFIX)) || "";
}

export function setStoredAgentId(agentId) {
  if (typeof window === "undefined") return;

  const key = getScopedKey(SESSION_AGENT_KEY_PREFIX);
  if (agentId) {
    localStorage.setItem(key, agentId);
    return;
  }

  localStorage.removeItem(key);
}

export function getChatHistoryKey(agentId) {
  return `${getScopedKey(SESSION_CHAT_HISTORY_KEY_PREFIX)}:${agentId || "no-agent"}`;
}

export function getCustomerId() {
  if (typeof window === "undefined") return "web-server";

  const key = getScopedKey(SESSION_CUSTOMER_ID_KEY_PREFIX);
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const generated = `web-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, generated);
  return generated;
}
