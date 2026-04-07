const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const emailController = require("../controllers/email.controller");
const whatsappController = require("../controllers/whatsapp.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.get("/me", auth, authController.me);

router.post("/whatsapp/exchange-code", auth, whatsappController.exchangeWhatsAppCode);
router.post("/gmail/exchange-code", auth, emailController.exchangeGmailCode);

module.exports = router;
