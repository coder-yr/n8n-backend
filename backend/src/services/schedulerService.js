const cron = require("node-cron");
const { supabase } = require("../config/supabase");
const { enqueueRunPipeline, enqueueGenerateContent } = require("../queues/contentQueue");

function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}`;

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("user_id")
        .eq("frequency", "daily")
        .eq("time", current);
      if (error) throw error;

      for (const schedule of schedules || []) {
        await enqueueRunPipeline({ userId: String(schedule.user_id) });
        await enqueueGenerateContent({ userId: String(schedule.user_id) });
      }
    } catch (error) {
      console.error("Scheduler tick failed:", error.message);
    }
  });
}

module.exports = { startScheduler };
