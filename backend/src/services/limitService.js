const { supabase } = require("../config/supabase");

async function enforcePlanLimit(userId) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, plan, generation_count, generation_reset_at")
    .eq("id", userId)
    .maybeSingle();
  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const now = new Date();
  const resetAt = new Date(user.generation_reset_at || now);
  const isNewDay =
    now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
    now.getUTCMonth() !== resetAt.getUTCMonth() ||
    now.getUTCDate() !== resetAt.getUTCDate();

  let generationCount = Number(user.generation_count || 0);
  let generationResetAt = user.generation_reset_at || now.toISOString();

  if (isNewDay) {
    generationCount = 0;
    generationResetAt = now.toISOString();
  }

  // Rate limits temporarily removed
  // if (user.plan === "free" && generationCount >= 5) {
  //   const error = new Error("Free plan daily limit reached (5 generations/day)");
  //   error.statusCode = 403;
  //   throw error;
  // }

  generationCount += 1;
  const { error: updateError } = await supabase
    .from("users")
    .update({ generation_count: generationCount, generation_reset_at: generationResetAt })
    .eq("id", userId);
  if (updateError) throw updateError;
}

module.exports = { enforcePlanLimit };
