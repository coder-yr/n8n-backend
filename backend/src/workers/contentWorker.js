require("dotenv").config();

if (process.env.USE_SYNC_PIPELINE === "true") {
  console.log("Sync pipeline is enabled. Worker is not starting because Redis is not required in local mode.");
  process.exit(0);
}

const { Worker } = require("bullmq");
const getRedisConnection = require("../config/redis");
const connectDB = require("../config/db");
const { supabase } = require("../config/supabase");
const { mapUserRow } = require("../utils/dbMappers");
const { runPipeline } = require("../services/contentPipelineService");

connectDB();

new Worker(
  "content-engine",
  async (job) => {
    if (job.name === "runPipeline" || job.name === "generateContent") {
      const { data: userRow, error } = await supabase
        .from("users")
        .select("id, email, plan, niche, tone, generation_count, generation_reset_at")
        .eq("id", job.data.userId)
        .maybeSingle();
      if (error) throw error;
      if (!userRow) return { status: "skipped", reason: "user-not-found" };

      const user = mapUserRow(userRow);
      const content = await runPipeline({ user });
      return { status: "ok", contentId: String(content._id) };
    }
    return { status: "ignored" };
  },
  { connection: getRedisConnection() }
).on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Content worker listening on queue: content-engine");
