const { callGroq, parseStructuredResponse } = require("./aiService");

function toArray(value, fallback) {
  if (Array.isArray(value) && value.length) return value;
  return fallback;
}

function normalizeInsightsOutput(parsed, fallback = {}) {
  return {
    patterns: toArray(parsed?.patterns, fallback.patterns || []),
    emotionalTriggers: toArray(parsed?.emotionalTriggers, fallback.emotionalTriggers || []),
    hooks: toArray(parsed?.hooks, fallback.hooks || []) // these are hook styles
  };
}

function getFallbackInsights(posts = []) {
  const topText = posts?.[0]?.text || "High-performing viral post";
  return {
    patterns: [topText],
    emotionalTriggers: ["curiosity", "urgency"],
    hooks: ["curiosity gap", "bold claim", "step-by-step tutorial"]
  };
}

async function analyzeViralPosts(posts, niche) {
  const prompt = `
Analyze these top performing viral posts in the "${niche}" niche. 
Identify the core content patterns, underlying emotional triggers, and specific hook styles that made them successful.

Return strict JSON:
{
  "patterns": ["..."],
  "emotionalTriggers": ["..."],
  "hooks": ["..."] // List the hook STYLES (e.g. "curiosity gap", "negative hook"), not the literal text
}
Posts: ${JSON.stringify(posts)}
`;
  const raw = await callGroq(prompt);
  const fallback = getFallbackInsights(posts);
  return normalizeInsightsOutput(parseStructuredResponse(raw, fallback), fallback);
}

module.exports = {
  analyzeViralPosts,
  normalizeInsightsOutput,
  getFallbackInsights
};
