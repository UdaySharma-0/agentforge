const jwt = require("jsonwebtoken");

const revokedTokens = new Map();

function pruneExpiredTokens() {
  const now = Date.now();

  revokedTokens.forEach((expiresAt, token) => {
    if (expiresAt <= now) {
      revokedTokens.delete(token);
    }
  });
}

function getTokenExpiry(token) {
  const decoded = jwt.decode(token);

  if (decoded?.exp) {
    return decoded.exp * 1000;
  }

  return Date.now() + 60 * 60 * 1000;
}

function revokeToken(token) {
  if (!token) return;

  pruneExpiredTokens();
  revokedTokens.set(token, getTokenExpiry(token));
}

function isTokenRevoked(token) {
  if (!token) return false;

  pruneExpiredTokens();
  const expiresAt = revokedTokens.get(token);

  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    revokedTokens.delete(token);
    return false;
  }

  return true;
}

module.exports = {
  revokeToken,
  isTokenRevoked,
};
