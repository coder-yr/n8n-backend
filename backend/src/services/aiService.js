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



async function generateContent(insights, userTone, niche, feedbackExamples = []) {
  let nicheFocus = `Focus on ${niche}.`;
  if (niche.toLowerCase() === "developer") {
    nicheFocus = `
Target Audience: Developers, engineers, and coders.
Pain Points to cover: bugs, burnout, career growth, learning the wrong stack, imposter syndrome, interview prep, open source.
Topics: coding problems, software architecture, AI tools for developers, GitHub, side projects, tech interviews.
AVOID: generic life advice, gossip, waiting, unrelated lifestyle topics.`;
  } else if (niche.toLowerCase() === "startup") {
    nicheFocus = `
Target Audience: Startup founders and early-stage entrepreneurs.
Pain Points to cover: no-code vs code debate, finding co-founders, raising a seed round, user acquisition, burnout, pivoting, failed launches.
Topics: startup struggles, product-market fit, fundraising, building in public, distribution over product.
AVOID: generic motivation, life quotes, unrelated lifestyle topics.`;
  } else if (niche.toLowerCase() === "marketing") {
    nicheFocus = `
Target Audience: Growth marketers, content creators, and digital marketers.
Pain Points to cover: algorithm changes, low reach, ad spend, content burnout, failing campaigns.
Topics: marketing growth hacks, SEO tricks, viral copywriting formulas, Instagram/TikTok algorithm, A/B testing.
AVOID: generic inspiration, gossip, unrelated lifestyle topics.`;
  }

  const prompt = `
You are a viral Instagram content creator for a TECH audience.
Target: developers, startup founders, and marketers.

Tone: ${userTone}
Niche: ${niche}
${nicheFocus}

Top performing examples for reference: ${JSON.stringify(feedbackExamples)}
Viral patterns to model: ${JSON.stringify(insights)}

RULES FOR HOOKS (strictly enforce all):
1. MAX 8 WORDS PER HOOK.
2. Must relate to: coding, startups, AI, dev careers, or marketing growth. NO generic life topics.
3. Trigger emotion: curiosity, fear of missing out, career urgency.
4. Sound like a viral reel, NOT a blog post or LinkedIn article.
5. BAD (NEVER USE): "Did you know...", "A study shows...", "Here are 5 tips...", "Waiting teaches you..."
6. GOOD (USE AS STYLE GUIDE): "You're learning the wrong tech stack", "This coding mistake kills your career", "Stop building projects like this", "AI replaced this job last week".

CONTENT RULES:
1. NEVER use placeholder text like "mock hook", "mock caption", or "#mock".
2. Generate content that is ready-to-post without editing.
3. Use developer/founder lingo naturally (e.g., "shipped", "MVP", "tech debt", "push to prod").

Return ONLY valid JSON, no extra text:
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
  callGroq,
  generateContent,
  extractJsonText,
  parseStructuredResponse,
  normalizeScriptsOutput,
  getFallbackScripts
};
