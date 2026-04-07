const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const env = require("./config/env");
const app = require("./app");
const EmailPollingWorker = require("./workers/emailPollingWorker");

const PORT = process.env.PORT || 3000;

if (env.ENABLE_EMAIL_WORKER) {
  const emailWorker = new EmailPollingWorker(env.EMAIL_POLLING_INTERVAL);
  emailWorker.start();
}

// Start server
app.listen(PORT, () => {
  console.log(`AgentForge Backend running on port ${PORT}`);
});
