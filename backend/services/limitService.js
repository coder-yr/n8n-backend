const User = require("../models/User");

async function enforcePlanLimit(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const resetAt = new Date(user.generationResetAt || now);
  const isNewDay =
    now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
    now.getUTCMonth() !== resetAt.getUTCMonth() ||
    now.getUTCDate() !== resetAt.getUTCDate();

  if (isNewDay) {
    user.generationCount = 0;
    user.generationResetAt = now;
  }

  if (user.plan === "free" && user.generationCount >= 5) {
    throw new Error("Free plan daily limit reached (5 generations/day)");
  }

  user.generationCount += 1;
  await user.save();
  return user;
}

module.exports = { enforcePlanLimit };
