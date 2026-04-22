const { supabase } = require("../config/supabase");
const { mapScheduleRow } = require("../utils/dbMappers");

async function upsertSchedule(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const { frequency, time } = req.body;
    const { data, error } = await supabase
      .from("schedules")
      .upsert({ user_id: userId, frequency, time }, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;
    res.json(mapScheduleRow(data));
  } catch (error) {
    next(error);
  }
}

async function getSchedule(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    res.json(mapScheduleRow(data));
  } catch (error) {
    next(error);
  }
}

module.exports = { upsertSchedule, getSchedule };
