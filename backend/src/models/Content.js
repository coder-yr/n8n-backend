const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sourcePosts: { type: Array, default: [] },
    insights: { type: Object, default: {} },
    hooks: { type: [String], default: [] },
    scripts: { type: [String], default: [] },
    captions: { type: [String], default: [] },
    hashtags: { type: [String], default: [] },
    performance: {
      likes: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 }
    },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);
