const bcrypt = require("bcryptjs");
const { supabase } = require("../config/supabase");
const { mapUserRow } = require("../utils/dbMappers");
const { signToken } = require("../utils/jwt");

async function signup(req, res, next) {
  try {
    const { email, password, niche, tone, plan } = req.body;
    const { data: exists, error: existsError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .limit(1);
    if (existsError) throw existsError;
    if (exists?.length) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        password: hashed,
        niche: niche || "general",
        tone: tone || "professional",
        plan: plan || "free"
      })
      .select("*")
      .single();
    if (insertError) throw insertError;

    const user = mapUserRow(insertedUser);
    const token = signToken({ id: user.id });
    res.status(201).json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { data: userRow, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    if (!userRow) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, userRow.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const user = mapUserRow(userRow);
    const token = signToken({ id: user.id });
    res.json({
      token,
      user: { id: user.id, email: user.email, plan: user.plan, niche: user.niche, tone: user.tone }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
