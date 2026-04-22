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
  let nicheContext = `Focus on the "${niche}" audience.`;
  if (niche.toLowerCase() === "developer") {
    nicheContext = `Audience: Developers & engineers.
Extract patterns around: coding mistakes, career growth, AI tools, debugging struggles, tech stack choices, imposter syndrome.
IGNORE patterns around generic life topics.`;
  } else if (niche.toLowerCase() === "startup") {
    nicheContext = `Audience: Startup founders & entrepreneurs.
Extract patterns around: failed launches, product-market fit, fundraising, building in public, user growth.
IGNORE patterns around generic motivation or lifestyle.`;
  } else if (niche.toLowerCase() === "marketing") {
    nicheContext = `Audience: Growth marketers & content creators.
Extract patterns around: algorithm changes, viral copywriting, ad performance, growth hacks, content strategy.
IGNORE patterns around generic inspiration or unrelated topics.`;
  }

  const prompt = `
You are a viral content strategist analyzing top-performing posts for a TECH audience.
${nicheContext}

Analyze these posts and identify:
1. Core content patterns that made them perform well in this niche.
2. Emotional triggers used (e.g., fear of falling behind, career urgency, FOMO).
3. Hook STYLES (not literal text), e.g., "negative hook", "curiosity gap", "contrarian take", "personal failure story".

Return strict JSON:
{
  "patterns": ["..."],
  "emotionalTriggers": ["..."],
  "hooks": ["..."]
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
