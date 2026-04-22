const { isDbConnected } = require("../config/db");

async function getStatus(req, res) {
  const dbConnected = await isDbConnected();
  res.json({
    ok: true,
    service: "AI Viral Content Engine API",
    dbConnected,
    timestamp: new Date().toISOString()
  });
}

module.exports = { getStatus };
