const express = require("express");
const router = express.Router();

const workflowController = require("../controllers/workflow.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, workflowController.createWorkflow);
router.get(
  "/agent/:agentId",
  authMiddleware,
  workflowController.getWorkflowByAgent
);
router.post(
  "/run/:agentId",
  authMiddleware,
  workflowController.runWorkflow
);

module.exports = router;
