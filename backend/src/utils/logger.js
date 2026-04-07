const Log = require("../models/log");

async function createLog(data) {
  try {
    await Log.create(data);
  } catch (err) {
    console.error("Log error:", err.message);
  }
}

module.exports = { createLog };
