const express = require("express");
const router = express.Router();
const { chatWithAgent } = require("../controllers/chat.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, chatWithAgent);

module.exports = router;
