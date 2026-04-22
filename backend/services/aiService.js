const axios = require("axios");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return "No GROQ_API_KEY configured. This is a mock fallback response.";
  }

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
      }
    }
  );

  return response.data.choices?.[0]?.message?.content || "";
}

async function generateInsights(posts) {
  const prompt = `
You are a viral strategist. Analyze these viral posts and return JSON with:
patterns (array), emotionalTriggers (array), hooks (array).
Posts: ${JSON.stringify(posts).slice(0, 6000)}
`;
  const text = await callGroq(prompt);
  return { raw: text };
}

async function generateScripts(insights, userTone, niche, feedbackExamples = []) {
  const prompt = `
You are a short-form content writer.
Tone: ${userTone}
Niche: ${niche}
Top performing examples: ${JSON.stringify(feedbackExamples).slice(0, 3000)}
Insights: ${JSON.stringify(insights).slice(0, 3000)}
Return JSON with keys: hooks (5), scripts (5), captions (5), hashtags (15).
`;
  const text = await callGroq(prompt);
  return { raw: text };
}

module.exports = { generateInsights, generateScripts };
