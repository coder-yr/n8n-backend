const { supabase } = require("../config/supabase");
const { mapContentRow } = require("../utils/dbMappers");

async function updateAnalytics(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const { contentId, likes = 0, views = 0, shares = 0, comments = 0 } = req.body;
    const { data, error } = await supabase
      .from("contents")
      .update({ performance: { likes, views, shares, comments } })
      .eq("id", contentId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Content not found" });
    res.json(mapContentRow(data));
  } catch (error) {
    next(error);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const userId = req.user.id || req.user._id;
    const { data, error } = await supabase.from("contents").select("*").eq("user_id", userId);
    if (error) throw error;
    const items = (data || []).map(mapContentRow);
    const summary = items.reduce(
      (acc, item) => {
        acc.likes += item.performance.likes || 0;
        acc.views += item.performance.views || 0;
        acc.shares += item.performance.shares || 0;
        acc.comments += item.performance.comments || 0;
        return acc;
      },
      { likes: 0, views: 0, shares: 0, comments: 0 }
    );

    const bestPerforming = [...items]
      .sort((a, b) => (b.performance.views || 0) - (a.performance.views || 0))
      .slice(0, 5);

    res.json({ summary, bestPerforming });
  } catch (error) {
    next(error);
  }
}

module.exports = { updateAnalytics, getAnalytics };
