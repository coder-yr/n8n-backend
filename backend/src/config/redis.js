const IORedis = require("ioredis");

let connection;

function getRedisConnection() {
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null
    });
  }
  return connection;
}

module.exports = getRedisConnection;
