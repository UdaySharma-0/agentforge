const bcrypt = require("bcryptjs");
const User = require("../models/User");

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function normalizePreferences(preferences = {}) {
  return {
    timezone: typeof preferences.timezone === "string" ? preferences.timezone : "",
  };
}

exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role preferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: serializeUser(user),
      preferences: normalizePreferences(user.preferences),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load settings",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim()?.toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    }).select("_id");

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email address is already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, email } },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email role preferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: serializeUser(user),
      preferences: normalizePreferences(user.preferences),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const timezone = typeof req.body?.preferences?.timezone === "string"
      ? req.body.preferences.timezone.trim()
      : "";

    if (timezone.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Timezone is too long",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "preferences.timezone": timezone,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email role preferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: normalizePreferences(user.preferences),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update preferences",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const currentPassword = req.body?.currentPassword || "";
    const newPassword = req.body?.newPassword || "";
    const confirmPassword = req.body?.confirmPassword || "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};
