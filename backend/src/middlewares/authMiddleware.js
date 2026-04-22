const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");
const { mapUserRow } = require("../utils/dbMappers");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: userRow, error } = await supabase
      .from("users")
      .select("id, email, plan, niche, tone, generation_count, generation_reset_at, created_at, updated_at")
      .eq("id", decoded.id)
      .maybeSingle();
    if (error) throw error;
    if (!userRow) return res.status(401).json({ message: "Unauthorized" });

    req.user = mapUserRow(userRow);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
