const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { revokeToken } = require("../utils/tokenBlacklist");

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createAuthResponse = (user) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );

  return {
    success: true,
    token,
    user: serializeUser(user),
  };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json(createAuthResponse(user));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const { data: googleProfile } = await axios.get(
      "https://oauth2.googleapis.com/tokeninfo",
      {
        params: { id_token: credential },
      }
    );

    const validIssuer =
      googleProfile.iss === "https://accounts.google.com" ||
      googleProfile.iss === "accounts.google.com";

    if (!validIssuer) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token issuer",
      });
    }

    if (
      env.GOOGLE_OAUTH_CLIENT &&
      googleProfile.aud !== env.GOOGLE_OAUTH_CLIENT
    ) {
      return res.status(401).json({
        success: false,
        message: "Google token audience mismatch",
      });
    }

    if (googleProfile.email_verified !== "true") {
      return res.status(401).json({
        success: false,
        message: "Google account email is not verified",
      });
    }

    let user = await User.findOne({ email: googleProfile.email });

    if (!user) {
      const generatedPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      user = await User.create({
        name: googleProfile.name || googleProfile.email.split("@")[0],
        email: googleProfile.email,
        password: hashedPassword,
      });
    }

    res.json(createAuthResponse(user));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.response?.data?.error_description || error.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (token) {
      revokeToken(token);
    }

    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
    };

    res.clearCookie("token", cookieOptions);
    res.clearCookie("jwt", cookieOptions);
    res.clearCookie("authToken", cookieOptions);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
