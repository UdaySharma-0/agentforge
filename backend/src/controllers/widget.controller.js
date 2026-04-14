const Agent = require("../models/Agent");
const WidgetConfig = require("../models/WidgetConfig");
const { executeAgentChat } = require("../services/chatRuntime");
const { syncAgentStatus } = require("../utils/agentStatusSync");
const {
  colorsAreValid,
  getOriginFromRequest,
  isOriginAllowed,
  normalizeOrigin,
  normalizeWebsiteUrl,
  sanitizeGreetingLines,
} = require("../utils/widgetSecurity");

function getPublicBaseUrl(req) {
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.BACKEND_BASE_URL ||
    `${req.protocol}://${req.get("host")}`
  );
}

function buildPublicScriptUrl(req, agentId) {
  return `${getPublicBaseUrl(req)}/widget.js?agentId=${agentId}&v=1`;
}

function getAllowedWidgetStatuses() {
  return process.env.NODE_ENV === "production"
    ? ["active"]
    : ["active", "draft"];
}

function serializeWidgetConfig(config, req) {
  return {
    id: config._id,
    agentId: config.agentId,
    color: config.color,
    greeting: config.greeting,
    websiteUrl: config.websiteUrl,
    allowedOrigins: config.allowedOrigins,
    scriptUrl: buildPublicScriptUrl(req, config.agentId),
  };
}

async function getOwnedAgent(agentId, userId) {
  return Agent.findOne({
    _id: agentId,
    createdBy: userId,
  });
}

function resolveUserId(req) {
  return req.user?.id || req.user?.userId || req.user?._id;
}

async function getPublicWidgetConfig(agentId) {
  return WidgetConfig.findOne({ agentId });
}

function escapeForJs(value) {
  return JSON.stringify(value);
}

function escapeForHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function validatePublicRequest(req, res) {
  const { agentId } = req.query.agentId ? req.query : req.body;
  const config = await getPublicWidgetConfig(agentId);

  if (!config) {
    res.status(404).json({ valid: false, message: "Widget config not found" });
    return null;
  }

  const origin = getOriginFromRequest(req);
  if (!origin) {
    res.status(403).json({ valid: false, message: "Origin is required" });
    return null;
  }

  if (!isOriginAllowed(config, origin)) {
    res.status(403).json({ valid: false, message: "Origin not allowed" });
    return null;
  }

  const agent = await Agent.findOne({
    _id: config.agentId,
    createdBy: config.createdBy,
    status: { $in: getAllowedWidgetStatuses() },
  });

  if (!agent) {
    console.warn(
      "[Widget API] public request rejected: agent status not allowed",
      {
        agentId: config.agentId,
        allowedStatuses: getAllowedWidgetStatuses(),
      },
    );
    res
      .status(404)
      .json({ valid: false, message: "Agent not available for widget" });
    return null;
  }

  return { config, origin, agent };
}

exports.getWidgetConfig = async (req, res) => {
  try {
    console.log("[Widget API] GET config request", {
      agentId: req.params.agentId,
      userId: resolveUserId(req),
    });
    const userId = resolveUserId(req);
    const agent = await getOwnedAgent(req.params.agentId, userId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    const config = await WidgetConfig.findOne({
      agentId: req.params.agentId,
      createdBy: userId,
    });

    return res.json({
      success: true,
      config: config ? serializeWidgetConfig(config, req) : null,
    });
  } catch (error) {
    console.error("[Widget API] GET config failed", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.saveWidgetConfig = async (req, res) => {
  try {
    const { agentId, color, greeting, websiteUrl } = req.body;
    const userId = resolveUserId(req);

    console.log("[Widget API] POST config request", {
      agentId,
      userId,
      color,
      greeting,
      websiteUrl,
    });

    const agent = await getOwnedAgent(agentId, userId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    if (!colorsAreValid(color)) {
      return res.status(400).json({
        success: false,
        message: "Color must be a valid 6-digit hex value",
      });
    }

    const normalizedGreeting = sanitizeGreetingLines(greeting);
    const {
      websiteUrl: normalizedUrl,
      allowedOrigin,
      allowedOrigins,
    } = normalizeWebsiteUrl(websiteUrl);

    const config = await WidgetConfig.findOneAndUpdate(
      {
        agentId,
        createdBy: userId,
      },
      {
        $set: {
          color: color.trim(),
          greeting: normalizedGreeting,
          websiteUrl: normalizedUrl,
          allowedOrigins:
            Array.isArray(allowedOrigins) && allowedOrigins.length
              ? allowedOrigins
              : [allowedOrigin],
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    await syncAgentStatus({ agentId, userId });

    return res.json({
      success: true,
      config: serializeWidgetConfig(config, req),
    });
  } catch (error) {
    console.error("[Widget API] POST config failed", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteWidgetConfig = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    const { agentId } = req.params;

    const agent = await getOwnedAgent(agentId, userId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found",
      });
    }

    const deletedConfig = await WidgetConfig.findOneAndDelete({
      agentId,
      createdBy: userId,
    });

    if (!deletedConfig) {
      return res.status(404).json({
        success: false,
        message: "Widget config not found",
      });
    }

    await syncAgentStatus({ agentId, userId });

    return res.json({
      success: true,
      message: "Website Chatbot disconnected",
    });
  } catch (error) {
    console.error("[Widget API] DELETE config failed", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.validateWidgetOrigin = async (req, res) => {
  try {
    const { agentId, origin } = req.query;

    console.log("[Widget API] VALIDATE request", { agentId, origin });

    if (!agentId || !origin) {
      return res
        .status(400)
        .json({ valid: false, message: "agentId and origin are required" });
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const config = await getPublicWidgetConfig(agentId);

    if (!config) {
      return res.json({ valid: false });
    }

    const agent = await Agent.findOne({
      _id: config.agentId,
      createdBy: config.createdBy,
      status: { $in: getAllowedWidgetStatuses() },
    });

    if (!agent) {
      console.warn("[Widget API] VALIDATE rejected: agent status not allowed", {
        agentId: config.agentId,
        allowedStatuses: getAllowedWidgetStatuses(),
      });
      return res.json({ valid: false });
    }

    return res.json({
      valid: isOriginAllowed(config, normalizedOrigin),
    });
  } catch (error) {
    console.error("[Widget API] VALIDATE failed", error);
    return res.status(400).json({
      valid: false,
      message: error.message,
    });
  }
};

exports.serveWidgetLoader = async (req, res) => {
  try {
    const { agentId, origin } = req.query;

    console.log("[Widget API] GET /widget.js", { agentId, origin });

    if (!agentId || !origin) {
      return res
        .status(400)
        .type("application/javascript")
        .send(
          "console.warn('AgentForge widget requires agentId and origin.');",
        );
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const config = await getPublicWidgetConfig(agentId);
    const allowed =
      config &&
      isOriginAllowed(config, normalizedOrigin) &&
      (await Agent.exists({
        _id: config.agentId,
        createdBy: config.createdBy,
        status: { $in: getAllowedWidgetStatuses() },
      }));

    if (!allowed) {
      console.warn("[Widget API] GET /widget.js rejected", {
        agentId,
        origin: normalizedOrigin,
        allowedStatuses: getAllowedWidgetStatuses(),
      });
      return res
        .status(403)
        .type("application/javascript")
        .send(
          "console.warn('AgentForge widget is not allowed for this origin.');",
        );
    }

    const apiBase = getPublicBaseUrl(req);
    const script = `
(function () {
  var scriptTag = document.currentScript;
  var params = new URL(scriptTag ? scriptTag.src : window.location.href).searchParams;
  var agentId = params.get("agentId");
  var version = params.get("v") || "1";
  var scriptOrigin = params.get("origin");
  var state = {
    config: {
      agentId: agentId,
      primaryColor: ${escapeForJs(config.color || "#6366F1")},
      greeting: ${escapeForJs(config.greeting || [])},
      origin: scriptOrigin
    },
    validated: false,
    isOpen: false,
    iframeReady: false,
    iframe: null,
    root: null
  };

  function validateAndMount() {
    if (!agentId || !scriptOrigin) {
      console.warn("AgentForge widget missing agentId or origin.");
      return;
    }

    var validateUrl = ${escapeForJs(`${apiBase}/api/widget/validate`)} + "?agentId=" + encodeURIComponent(agentId) + "&origin=" + encodeURIComponent(scriptOrigin);
    fetch(validateUrl, { credentials: "omit" })
      .then(function (response) { return response.json(); })
      .then(function (payload) {
        if (!payload || payload.valid !== true) {
          console.warn("AgentForge widget validation failed.");
          return;
        }

        state.validated = true;
        mountLauncher();
      })
      .catch(function () {
        console.warn("AgentForge widget validation failed.");
      });
  }

  function mountLauncher() {
    if (state.root || !state.validated) return;

    var root = document.createElement("div");
    root.style.position = "fixed";
    root.style.right = "24px";
    root.style.bottom = "24px";
    root.style.width = "320px";
    root.style.maxWidth = "calc(100vw - 32px)";
    root.style.height = "560px";
    root.style.zIndex = "2147483000";
    root.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";
    root.style.pointerEvents = "none";

    var panel = document.createElement("div");
    panel.style.position = "absolute";
    panel.style.right = "0";
    panel.style.bottom = "76px";
    panel.style.width = "320px";
    panel.style.maxWidth = "calc(100vw - 32px)";
    panel.style.borderRadius = "20px";
    panel.style.background = "#ffffff";
    panel.style.boxShadow = "0 24px 64px rgba(15, 23, 42, 0.24)";
    panel.style.border = "1px solid rgba(148, 163, 184, 0.25)";
    panel.style.overflow = "hidden";
    panel.style.pointerEvents = "auto";
    panel.style.opacity = "0";
    panel.style.visibility = "hidden";
    panel.style.transform = "translateY(18px) scale(0.98)";
    panel.style.transformOrigin = "bottom right";
    panel.style.transition = "opacity 180ms ease, transform 220ms ease, visibility 220ms ease";

    var iframe = document.createElement("iframe");
    iframe.title = "AgentForge chat widget";
    iframe.style.width = "100%";
    iframe.style.height = "480px";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.background = "#ffffff";
    iframe.src = ${escapeForJs(`${apiBase}/chat-ui`)} + "?agentId=" + encodeURIComponent(agentId) + "&origin=" + encodeURIComponent(scriptOrigin) + "&v=" + encodeURIComponent(version);
    iframe.addEventListener("load", function () {
      state.iframeReady = true;
      postConfig();
    });

    panel.appendChild(iframe);

    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Open AgentForge chat");
    button.style.width = "64px";
    button.style.height = "64px";
    button.style.position = "absolute";
    button.style.right = "0";
    button.style.bottom = "0";
    button.style.border = "0";
    button.style.borderRadius = "999px";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 20px 45px rgba(15, 23, 42, 0.26)";
    button.style.background = state.config.primaryColor;
    button.style.color = "#ffffff";
    button.style.fontSize = "28px";
    button.style.pointerEvents = "auto";
    button.style.transition = "transform 220ms ease, box-shadow 220ms ease, background-color 180ms ease";
    button.textContent = "✦";
    button.addEventListener("click", function () {
      var nextOpen = !state.isOpen;
      setOpen(nextOpen);
      if (nextOpen) {
        postConfig();
      }
    });

    function syncLayout() {
      var isMobile = window.innerWidth <= 640;
      var edgeOffset = isMobile ? 12 : 24;
      var buttonSize = isMobile ? 58 : 64;
      var panelGap = isMobile ? 10 : 12;
      var panelWidth = isMobile ? Math.min(window.innerWidth - 24, 360) : 320;
      var panelHeight = isMobile
        ? Math.max(380, Math.min(window.innerHeight - 96, 520))
        : 480;

      root.style.right = edgeOffset + "px";
      root.style.bottom = edgeOffset + "px";
      root.style.width = panelWidth + "px";
      root.style.maxWidth = "calc(100vw - " + edgeOffset * 2 + "px)";
      root.style.height = panelHeight + buttonSize + panelGap + "px";

      panel.style.width = panelWidth + "px";
      panel.style.maxWidth = root.style.maxWidth;
      panel.style.height = panelHeight + "px";
      panel.style.bottom = buttonSize + panelGap + "px";
      panel.style.borderRadius = (isMobile ? 18 : 20) + "px";

      iframe.style.height = panelHeight + "px";

      button.style.width = buttonSize + "px";
      button.style.height = buttonSize + "px";
      button.style.fontSize = isMobile ? "26px" : "28px";
    }

    function setOpen(nextOpen) {
      state.isOpen = nextOpen;
      panel.style.opacity = nextOpen ? "1" : "0";
      panel.style.visibility = nextOpen ? "visible" : "hidden";
      panel.style.transform = nextOpen ? "translateY(0) scale(1)" : "translateY(18px) scale(0.98)";
      button.style.transform = nextOpen ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)";
      button.style.boxShadow = nextOpen
        ? "0 24px 56px rgba(15, 23, 42, 0.32)"
        : "0 20px 45px rgba(15, 23, 42, 0.26)";
    }

    root.appendChild(panel);
    root.appendChild(button);
    document.body.appendChild(root);

    syncLayout();
    setOpen(false);
    window.addEventListener("resize", syncLayout);

    state.root = root;
    state.iframe = iframe;
  }

  function postConfig() {
    if (!state.iframe || !state.iframeReady) return;
    state.iframe.contentWindow.postMessage({
      type: "agentforge:init",
      payload: state.config
    }, "*");
  }

  window.AgentForge = window.AgentForge || {};
  window.AgentForge.init = function (config) {
    config = config || {};
    var theme = config.theme || {};
    var greeting = Array.isArray(config.greeting) ? config.greeting : [];

    state.config = {
      agentId: config.agentId || state.config.agentId,
      primaryColor: theme.primaryColor || state.config.primaryColor,
      greeting: greeting.length ? greeting : state.config.greeting,
      origin: window.location.origin
    };

    if (state.root) {
      var button = state.root.querySelector("button");
      if (button) {
        button.style.background = state.config.primaryColor;
      }
      postConfig();
    }
  };

  if (document.readyState === "complete") {
    validateAndMount();
  } else {
    window.addEventListener("load", validateAndMount, { once: true });
  }
})();
`.trim();

    return res
      .status(200)
      .type("application/javascript")
      .set("Cache-Control", "public, max-age=300")
      .send(script);
  } catch (_error) {
    console.error("[Widget API] GET /widget.js failed", _error);
    return res
      .status(500)
      .type("application/javascript")
      .send("console.warn('AgentForge widget failed to load.');");
  }
};

exports.serveChatUi = async (req, res) => {
  try {
    console.log("[Widget API] GET /chat-ui", {
      agentId: req.query.agentId,
      origin: req.query.origin,
    });
    const validated = await validatePublicRequest(req, res);
    if (!validated) return;

    const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AgentForge Chat</title>
    <style>
      :root {
        --af-primary: ${escapeForHtml(validated.config.color || "#6366F1")};
        --af-primary-glow: ${escapeForHtml(validated.config.color || "#6366F1")}33;
        --af-text-main: #1e293b;
        --af-text-muted: #64748b;
        --af-bg-glass: rgba(255, 255, 255, 0.85);
        --af-border: rgba(226, 232, 240, 0.8);
      }

      * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }

      body {
        margin: 0;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background: transparent; /* Allows parent glass effect to shine */
        color: var(--af-text-main);
        height: 100vh;
        overflow: hidden;
      }

      .shell {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--af-bg-glass);
        backdrop-filter: blur(12px);
      }

      /* Header Styling */
      .header {
        padding: 20px;
        background: linear-gradient(135deg, var(--af-primary) 0%, #4f46e5 100%);
        color: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        position: relative;
        z-index: 10;
      }

      .header h1 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      .header p {
        margin: 4px 0 0;
        font-size: 13px;
        opacity: 0.85;
      }

      /* Message Area */
      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        scroll-behavior: smooth;
      }

      /* Scrollbar Styling */
      .messages::-webkit-scrollbar { width: 5px; }
      .messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

      /* Bubbles */
      .bubble {
        max-width: 85%;
        padding: 12px 16px;
        font-size: 14.5px;
        line-height: 1.5;
        position: relative;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .bubble.bot {
        align-self: flex-start;
        background: #ffffff;
        color: var(--af-text-main);
        border-radius: 4px 16px 16px 16px;
        border: 1px solid var(--af-border);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      }

      .bubble.user {
        align-self: flex-end;
        background: var(--af-primary);
        color: #fff;
        border-radius: 16px 16px 4px 16px;
        box-shadow: 0 4px 12px var(--af-primary-glow);
      }

      /* Composer / Input Area */
      .composer {
        padding: 16px 20px 20px;
        background: #fff;
        border-top: 1px solid var(--af-border);
      }

      .input-container {
        display: flex;
        align-items: center;
        background: #f1f5f9;
        border-radius: 24px;
        padding: 4px 6px 4px 16px;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      .input-container:focus-within {
        background: #fff;
        border-color: var(--af-primary);
        box-shadow: 0 0 0 3px var(--af-primary-glow);
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 10px 0;
        font-size: 14px;
        outline: none;
        color: var(--af-text-main);
      }

      button {
        height: 36px;
        width: 36px;
        border: 0;
        border-radius: 50%;
        background: var(--af-primary);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }

      button:hover { transform: scale(1.05); }
      button:active { transform: scale(0.95); }

      .hint {
        margin-top: 10px;
        font-size: 11px;
        text-align: center;
        color: var(--af-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }

      @media (max-width: 520px) {
        .header { padding: 16px; }
        .messages { padding: 15px; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="header">
        <h1>AgentForge Assistant</h1>
        <p id="greeting">Online & ready to help.</p>
      </div>
      <div class="messages" id="messages"></div>
      <div class="composer">
        <form id="chat-form">
          <div class="input-container">
            <input id="message-input" type="text" maxlength="1000" placeholder="Type a message..." autocomplete="off" />
            <button type="submit" aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </form>
        <div class="hint">⚡ Powered by AgentForge AI</div>
      </div>
    </div>
        <script>
      (function () {
        var state = {
          agentId: ${escapeForJs(String(validated.config.agentId))},
          parentOrigin: ${escapeForJs(validated.origin)},
          customerId: "web_" + Math.random().toString(36).slice(2),
          greeting: ${escapeForJs(validated.config.greeting || [])}
        };
        var messagesEl = document.getElementById("messages");
        var greetingEl = document.getElementById("greeting");
        var formEl = document.getElementById("chat-form");
        var inputEl = document.getElementById("message-input");

        function addMessage(content, role) {
          var bubble = document.createElement("div");
          bubble.className = "bubble " + role;
          bubble.textContent = content;
          messagesEl.appendChild(bubble);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        function renderGreeting() {
          greetingEl.textContent = state.greeting.filter(Boolean).join(" ") || "Ask anything to get started.";
          if (state.greeting[0]) addMessage(state.greeting[0], "bot");
          if (state.greeting[1]) addMessage(state.greeting[1], "bot");
        }

        window.addEventListener("message", function (event) {
          if (!event.data || event.data.type !== "agentforge:init") return;
          var payload = event.data.payload || {};
          if (payload.primaryColor) {
            document.documentElement.style.setProperty("--af-primary", payload.primaryColor);
          }
          if (Array.isArray(payload.greeting)) {
            state.greeting = payload.greeting.filter(Boolean).slice(0, 2);
            messagesEl.innerHTML = "";
            renderGreeting();
          }
          if (payload.origin) {
            state.parentOrigin = payload.origin;
          }
        });

        formEl.addEventListener("submit", function (event) {
          event.preventDefault();
          var message = inputEl.value.trim();
          if (!message) return;

          addMessage(message, "user");
          inputEl.value = "";

          fetch(${escapeForJs(`${getPublicBaseUrl(req)}/api/widget/chat`)}, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-agentforge-origin": state.parentOrigin
            },
            body: JSON.stringify({
              agentId: state.agentId,
              message: message,
              customerId: state.customerId,
              origin: state.parentOrigin
            })
          })
            .then(function (response) { return response.json(); })
            .then(function (payload) {
              addMessage(payload.reply || "I could not generate a reply right now.", "bot");
            })
            .catch(function () {
              addMessage("Sorry, something went wrong. Please try again.", "bot");
            });
        });

        renderGreeting();
      })();
    </script>
  </body>
</html>
    `.trim();

    return res.status(200).type("text/html").send(html);
  } catch (error) {
    console.error("[Widget API] GET /chat-ui failed", error);
    return res.status(500).send(error.message);
  }
};

exports.chatWithWidget = async (req, res) => {
  try {
    console.log("[Widget API] POST /api/widget/chat", {
      agentId: req.body?.agentId,
      customerId: req.body?.customerId,
      origin: req.body?.origin || req.headers["x-agentforge-origin"],
      hasMessage: Boolean(req.body?.message),
    });
    const validated = await validatePublicRequest(req, res);
    if (!validated) return;

    const result = await executeAgentChat({
      agentId: req.body.agentId,
      message: req.body.message,
      customerId: req.body.customerId,
      userId: validated.config.createdBy,
      channel: "web",
      requireActiveAgent: process.env.NODE_ENV === "production",
    });

    return res.json({
      success: true,
      conversationId: result.conversationId,
      reply: result.reply,
    });
  } catch (error) {
    console.error("[Widget API] POST /api/widget/chat failed", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
