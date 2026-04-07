const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const widgetController = require("../controllers/widget.controller");

const router = express.Router();

router.get("/api/widget/config/:agentId", authMiddleware, widgetController.getWidgetConfig);
router.post("/api/widget/config", authMiddleware, widgetController.saveWidgetConfig);
router.delete("/api/widget/config/:agentId", authMiddleware, widgetController.deleteWidgetConfig);

router.get("/api/widget/validate", widgetController.validateWidgetOrigin);
router.get("/widget.js", widgetController.serveWidgetLoader);
router.get("/chat-ui", widgetController.serveChatUi);
router.post("/api/widget/chat", widgetController.chatWithWidget);

module.exports = router;
