import apiClient from "./apiClient";
import { API_BASE_URL } from "../utils/constants";

export const WIDGET_PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export async function getWidgetConfig(agentId) {
  console.log("[Widget] GET /api/widget/config/:agentId", { agentId });
  const { data } = await apiClient.get(`/widget/config/${agentId}`);
  console.log("[Widget] GET config response", data);
  return data;
}

export async function saveWidgetConfig(payload) {
  console.log("[Widget] POST /api/widget/config", payload);
  const { data } = await apiClient.post("/widget/config", payload);
  console.log("[Widget] POST config response", data);
  return data;
}

export async function deleteWidgetConfig(agentId) {
  console.log("[Widget] DELETE /api/widget/config/:agentId", { agentId });
  const { data } = await apiClient.delete(`/widget/config/${agentId}`);
  console.log("[Widget] DELETE config response", data);
  return data;
}

export async function validateWidgetOrigin(agentId, origin) {
  console.log("[Widget] GET /api/widget/validate", { agentId, origin });
  const { data } = await apiClient.get("/widget/validate", {
    params: { agentId, origin },
  });
  console.log("[Widget] GET validate response", data);
  return data;
}

export function buildWidgetScript({
  agentId,
  color,
  greeting = [],
}) {
  const safeGreeting = greeting.filter(Boolean).slice(0, 2);

  return `<script>
(function(){
  var origin = window.location.origin;
  var s = document.createElement("script");
  s.src = "${WIDGET_PUBLIC_BASE_URL}/widget.js?agentId=${agentId}&origin=" + encodeURIComponent(origin) + "&v=1";
  s.async = true;
  s.onload = function(){
    window.AgentForge.init({
      agentId: "${agentId}",
      theme: { primaryColor: "${color}" },
      greeting: ${JSON.stringify(safeGreeting)}
    });
  };
  function attachWidgetScript() {
    document.head.appendChild(s);
  }
  if (document.readyState === "complete") {
    attachWidgetScript();
  } else {
    window.addEventListener("load", attachWidgetScript, { once: true });
  }
})();
</script>`;
}
