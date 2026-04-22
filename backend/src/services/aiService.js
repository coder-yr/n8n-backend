const axios = require("axios");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function extractJsonText(raw) {
  if (typeof raw !== "string") return "";

  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1).trim();
  }

  return raw.trim();
}

function toArray(value, fallback) {
  if (Array.isArray(value) && value.length) return value;
  return fallback;
}

function normalizeInsightsOutput(parsed, fallback = {}) {
  return {
    patterns: toArray(parsed?.patterns, fallback.patterns || []),
    emotionalTriggers: toArray(parsed?.emotionalTriggers, fallback.emotionalTriggers || []),
    hooks: toArray(parsed?.hooks, fallback.hooks || [])
  };
}

function normalizeScriptsOutput(parsed, fallback = {}) {
  return {
    hooks: toArray(parsed?.hooks, fallback.hooks || []),
    scripts: toArray(parsed?.scripts, fallback.scripts || []),
    captions: toArray(parsed?.captions, fallback.captions || []),
    hashtags: toArray(parsed?.hashtags, fallback.hashtags || [])
  };
}

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    const error = new Error("GROQ_API_KEY is missing. Add a valid key in backend/.env.");
    error.statusCode = 500;
    throw error;
  }

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    return response.data.choices?.[0]?.message?.content || "{}";
  } catch (err) {
    const message =
      err.response?.data?.error?.message || err.message || "Groq request failed unexpectedly";
    const error = new Error(`Groq API error: ${message}`);
    error.statusCode = 502;
    throw error;
  }
}

async function generateInsights(posts) {
  const prompt = `
Analyze viral post patterns and return strict JSON:
{
  "patterns": ["..."],
  "emotionalTriggers": ["..."],
  "hooks": ["..."]
}
Posts: ${JSON.stringify(posts)}
`;
  return { raw: await callGroq(prompt) };
}

async function generateScripts(insights, userTone, niche, feedbackExamples = []) {
  const prompt = `
Generate short-form content based on insights.
Tone: ${userTone}
Niche: ${niche}
Top performing examples: ${JSON.stringify(feedbackExamples)}
Insights: ${JSON.stringify(insights)}
Return strict JSON:
{
  "hooks": ["..."],
  "scripts": ["..."],
  "captions": ["..."],
  "hashtags": ["#..."]
}
`;
  return { raw: await callGroq(prompt) };
}

function parseStructuredResponse(raw, fallback = {}) {
  try {
    const parsed = JSON.parse(extractJsonText(raw));
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function getFallbackInsights(posts = []) {
  const topText = posts?.[0]?.text || "High-performing viral post";
  return {
    patterns: [topText],
    emotionalTriggers: ["curiosity", "urgency"],
    hooks: ["Stop scrolling if you want faster growth."]
  };
}

function getFallbackScripts(insights = {}, userTone = "professional", niche = "general") {
  const primaryHook = insights.hooks?.[0] || `Here's a ${userTone} content idea for ${niche}.`;
  return {
    hooks: [primaryHook],
    scripts: [`Use this ${userTone} script to create a strong ${niche} post.`],
    captions: [`A ${userTone} caption for ${niche} creators.`],
    hashtags: ["#viral", `#${String(niche).toLowerCase().replace(/\s+/g, "")}`]
  };
}

module.exports = {
  generateInsights,
  generateScripts,
  extractJsonText,
  parseStructuredResponse,
  normalizeInsightsOutput,
  normalizeScriptsOutput,
  getFallbackInsights,
  getFallbackScripts
};
