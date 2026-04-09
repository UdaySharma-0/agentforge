const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const env = require("./config/env");
const authController = require("./controllers/auth.controller");

const authRoutes = require("./routes/auth.routes");
const agentRoutes = require("./routes/agent.routes");
const workflowRoutes = require("./routes/workflow.routes");
const chatRoutes = require("./routes/chat.routes");
const logRoutes = require("./routes/log.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const knowledgeRoutes = require("./routes/knowledge.routes");
const settingsRoutes = require("./routes/settings.routes");
const whatsappRoutes = require("./channels/whatsapp/whatsapp.routes");
const widgetRoutes = require("./routes/widget.routes");
const emailRoutes = require("./routes/email.routes");


const app = express();
app.set("trust proxy", 1);
const DEFAULT_WHATSAPP_REDIRECT_URI = "http://localhost:5173/auth/whatsapp";

// 🔹 Connect Database
connectDB();

// 🔹 Middleware
app.use(
  cors((req, callback) => {
    const isPublicWidgetEndpoint =
      req.path === "/api/widget/validate" || req.path === "/api/widget/chat";

    callback(null, {
      origin: isPublicWidgetEndpoint ? true : env.CORS_ORIGIN,
      credentials: !isPublicWidgetEndpoint,
    });
  }),
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// 🔹 Routes
app.post("/api/logout", authController.logout);

app.get("/auth/whatsapp", (req, res) => {
  const redirectBase =
    process.env.WHATSAPP_OAUTH_REDIRECT_URI || DEFAULT_WHATSAPP_REDIRECT_URI;
  const queryString = req.originalUrl.includes("?")
    ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
    : "";

  console.log("[App] Redirecting legacy WhatsApp callback", {
    from: req.originalUrl,
    to: `${redirectBase}${queryString}`,
  });

  return res.redirect(`${redirectBase}${queryString}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/logs", require("./routes/log.routes"));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/channels/whatsapp", whatsappRoutes);
app.use("/api/channels/email", emailRoutes);
app.use("/", widgetRoutes);



// 🔥 CHAT ROUTE (IMPORTANT)
app.use("/api/chat", chatRoutes);

// 🔹 Test route
app.get("/", (req, res) => {
  res.json({ message: "AgentForge Backend Running 🚀" });
});

module.exports = app;
