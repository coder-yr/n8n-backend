const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    niche: { type: String, default: "general" },
    tone: { type: String, default: "professional" },
    generationCount: { type: Number, default: 0 },
    generationResetAt: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
