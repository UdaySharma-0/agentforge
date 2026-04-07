const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const knowledgeController = require("../controllers/knowledge.controller");

router.get("/agent/:agentId", auth, knowledgeController.getKnowledgeByAgent);
router.post("/scrape-website", auth, knowledgeController.scrapeWebsite);
router.post("/upload-document", auth, knowledgeController.uploadDocument);
router.post("/manual-text", auth, knowledgeController.saveManualText);

module.exports = router;
