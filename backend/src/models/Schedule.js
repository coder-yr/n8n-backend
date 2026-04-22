const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    frequency: { type: String, enum: ["daily"], default: "daily" },
    time: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
