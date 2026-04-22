const { Queue } = require("bullmq");
const getRedisConnection = require("../config/redis");

let contentQueue;

function getQueue() {
  if (!contentQueue) {
    contentQueue = new Queue("content-engine", { connection: getRedisConnection() });
  }
  return contentQueue;
}

async function enqueueRunPipeline(data) {
  return getQueue().add("runPipeline", data, { removeOnComplete: true, attempts: 2 });
}

async function enqueueGenerateContent(data) {
  return getQueue().add("generateContent", data, { removeOnComplete: true, attempts: 2 });
}

module.exports = { getQueue, enqueueRunPipeline, enqueueGenerateContent };
