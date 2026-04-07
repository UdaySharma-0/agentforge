const express = require("express");
const router = express.Router();

const agentController = require("../controllers/agent.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ==================================================
// 🔹 BASIC AGENT CRUD ROUTES
// ==================================================

// Create basic agent
router.post("/", authMiddleware, agentController.createAgent);

// Get all agents (user wise)
router.get("/", authMiddleware, agentController.getMyAgents);

// 🔥 IMPORTANT:
// /full route MUST be before /:id
// warna Express ise :id samajh lega
// ==================================================

// Final wizard save (STEP 24)
router.post("/full", authMiddleware, agentController.createFullAgent);

// Get agent by id
router.get("/:id", authMiddleware, agentController.getAgentById);

// Update agent
router.put("/:id", authMiddleware, agentController.updateAgent);

// Delete agent
router.delete("/:id", authMiddleware, agentController.deleteAgent);

module.exports = router;
