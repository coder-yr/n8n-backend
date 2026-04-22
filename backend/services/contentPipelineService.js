const Content = require("../models/Content");
const { generateInsights, generateScripts } = require("./aiService");

async function fetchPosts() {
  return [
    { text: "3 mistakes killing your growth", likes: 1200, comments: 110, shares: 95 },
    { text: "Do this before posting reels", likes: 980, comments: 85, shares: 120 },
    { text: "The hook formula creators ignore", likes: 1800, comments: 210, shares: 250 }
  ];
}

function normalizeData(posts) {
  return posts.map((post) => ({
    ...post,
    likes: Number(post.likes || 0),
    comments: Number(post.comments || 0),
    shares: Number(post.shares || 0)
  }));
}

function viralScoring(posts) {
  return posts.map((post) => ({
    ...post,
    score: post.likes * 0.5 + post.comments * 0.2 + post.shares * 0.3
  }));
}

function selectTopContent(posts, limit = 5) {
  return [...posts].sort((a, b) => b.score - a.score).slice(0, limit);
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function runPipeline({ user }) {
  const posts = await fetchPosts();
  const normalized = normalizeData(posts);
  const scored = viralScoring(normalized);
  const top = selectTopContent(scored, 3);

  const bestPerforming = await Content.find({ userId: user._id })
    .sort({ "performance.views": -1 })
    .limit(3)
    .lean();

  const insightsRaw = await generateInsights(top);
  const insights = safeJsonParse(insightsRaw.raw, { patterns: [], emotionalTriggers: [], hooks: [] });

  const generatedRaw = await generateScripts(insights, user.tone, user.niche, bestPerforming);
  const generated = safeJsonParse(generatedRaw.raw, {
    hooks: [],
    scripts: [],
    captions: [],
    hashtags: []
  });

  const score = top.reduce((sum, p) => sum + p.score, 0) / (top.length || 1);
  const content = await Content.create({
    userId: user._id,
    sourcePosts: top,
    insights,
    hooks: generated.hooks || [],
    scripts: generated.scripts || [],
    captions: generated.captions || [],
    hashtags: generated.hashtags || [],
    score
  });

  return content;
}

module.exports = {
  fetchPosts,
  normalizeData,
  viralScoring,
  selectTopContent,
  runPipeline
};
