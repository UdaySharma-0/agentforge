require("dotenv").config();

const requiredEnv = ["JWT_SECRET"];
const missingRequiredEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingRequiredEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingRequiredEnv.join(", ")}`,
  );
}

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // ================= DATABASE =================
  // MONGO_URI:
  //   process.env.MONGO_URI ||
  MONGO_URI: process.env.MONGO_URI,

  // ================= JWT =================
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "70d",
  GOOGLE_OAUTH_CLIENT: process.env.GOOGLE_OAUTH_CLIENT,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  AI_PROVIDER: process.env.AI_PROVIDER || "groq",
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  AI_AGENT_SERVICE_URL:
    process.env.AI_AGENT_SERVICE_URL || "http://127.0.0.1:8000",

  // ================= EMAIL =================
  EMAIL_FROM: process.env.EMAIL_FROM,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:5173/auth/gmail",
  EMAIL_POLLING_INTERVAL: parseInt(
    process.env.EMAIL_POLLING_INTERVAL || "60000",
    10,
  ),
  EMAIL_FALLBACK_MESSAGE:
    process.env.EMAIL_FALLBACK_MESSAGE ||
    "Thank you for reaching out. We will get back to you soon.",
  ENABLE_EMAIL_WORKER: process.env.ENABLE_EMAIL_WORKER === "true",

  // ================= WHATSAPP (FUTURE) =================
  TWILIO_SID: process.env.TWILIO_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
};

module.exports = env;
