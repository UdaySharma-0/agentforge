const env = require("../config/env");

function normalizeOrigin(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Origin is required");
  }

  const parsed = new URL(input.trim());

  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Only http and https origins are allowed");
  }

  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";

  return parsed.origin;
}

function normalizeWebsiteUrl(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("Website URL is required");
  }

  const rawValue = input.trim();
  const parsed = new URL(rawValue);

  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Website URL must use http or https");
  }

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("Website URL must use https in production");
  }

  parsed.hash = "";

  const allowedOrigins = new Set([parsed.origin]);

  if (env.NODE_ENV !== "production") {
    const devOrigins = [
      env.CORS_ORIGIN,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

    for (const devOrigin of devOrigins) {
      try {
        allowedOrigins.add(normalizeOrigin(devOrigin));
      } catch {
        // ignore invalid optional dev origins
      }
    }
  }

  return {
    websiteUrl: parsed.toString().replace(/\/$/, ""),
    allowedOrigin: parsed.origin,
    allowedOrigins: Array.from(allowedOrigins),
  };
}

function sanitizeGreetingLines(lines = []) {
  return (Array.isArray(lines) ? lines : [])
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .slice(0, 2)
    .map((line) => line.slice(0, 120));
}

function colorsAreValid(color) {
  return typeof color === "string" && /^#[0-9A-Fa-f]{6}$/.test(color.trim());
}

function getOriginFromRequest(req) {
  const candidates = [
    req.query.origin,
    req.headers["x-agentforge-origin"],
    req.body?.origin,
    req.headers.origin,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return normalizeOrigin(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

function isDevelopmentLocalOrigin(origin) {
  if (env.NODE_ENV === "production" || !origin) {
    return false;
  }

  try {
    const parsed = new URL(origin);
    return parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function isOriginAllowed(config, origin) {
  if (isDevelopmentLocalOrigin(origin)) {
    return true;
  }

  return Boolean(
    config &&
      origin &&
      Array.isArray(config.allowedOrigins) &&
      config.allowedOrigins.includes(origin),
  );
}

module.exports = {
  colorsAreValid,
  getOriginFromRequest,
  isDevelopmentLocalOrigin,
  isOriginAllowed,
  normalizeOrigin,
  normalizeWebsiteUrl,
  sanitizeGreetingLines,
};
