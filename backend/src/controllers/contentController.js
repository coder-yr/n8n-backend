const { supabase } = require("../config/supabase");
const { enqueueRunPipeline, enqueueGenerateContent } = require("../queues/contentQueue");
const { enforcePlanLimit } = require("../services/limitService");
const { runPipeline } = require("../services/contentPipelineService");
const { mapContentRow } = require("../utils/dbMappers");

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function runContentEngine(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    await enforcePlanLimit(userId);

    // If queue processing is disabled, run synchronously for local convenience.
    if (process.env.USE_SYNC_PIPELINE === "true") {
      const content = await runPipeline({ user: req.user });
      return res.json({ status: "completed", content });
    }

    try {
      await enqueueRunPipeline({ userId: String(userId) });
      await enqueueGenerateContent({ userId: String(userId) });
      return res.json({ status: "queued", queue: "content-engine" });
    } catch (queueError) {
      queueError.statusCode = 503;
      queueError.message =
        "Queue service unavailable. Start Redis or set USE_SYNC_PIPELINE=true for local mode.";
      throw queueError;
    }
  } catch (error) {
    next(error);
  }
}

async function getContentHistory(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json((data || []).map(mapContentRow));
  } catch (error) {
    next(error);
  }
}

async function exportContentCsv(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    const items = (data || []).map(mapContentRow);
    const headers = ["createdAt", "hooks", "scripts", "captions", "hashtags", "score"];
    const rows = items.map((item) => {
      return [
        escapeCsv(item.createdAt),
        escapeCsv((item.hooks || []).join(" | ")),
        escapeCsv((item.scripts || []).join(" | ")),
        escapeCsv((item.captions || []).join(" | ")),
        escapeCsv((item.hashtags || []).join(" ")),
        escapeCsv(item.score)
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="content-history.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

module.exports = { runContentEngine, getContentHistory, exportContentCsv };
