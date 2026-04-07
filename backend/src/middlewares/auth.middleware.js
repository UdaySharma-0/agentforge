const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { isTokenRevoked } = require("../utils/tokenBlacklist");

const  authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (isTokenRevoked(token)) {
      return res.status(401).json({ message: "Token has been logged out" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // user info attach
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
