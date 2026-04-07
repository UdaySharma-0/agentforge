const express = require("express");
const auth = require("../middlewares/auth.middleware");
const settingsController = require("../controllers/settings.controller");

const router = express.Router();

router.get("/me", auth, settingsController.getSettings);
router.patch("/profile", auth, settingsController.updateProfile);
router.patch("/preferences", auth, settingsController.updatePreferences);
router.post("/change-password", auth, settingsController.changePassword);

module.exports = router;
