const { supabase } = require("../config/supabase");
const { mapContentRow } = require("../utils/dbMappers");
const {
  generateInsights,
  generateScripts,
  parseStructuredResponse,
  normalizeInsightsOutput,
  normalizeScriptsOutput,
  getFallbackInsights,
  getFallbackScripts
} = require("./aiService");

const axios = require("axios");

async function fetchPosts(niche) {
  try {
    const query = niche || "viral marketing";
    const url = `https://www.reddit.com/r/all/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=10`;
    const response = await axios.get(url, { headers: { "User-Agent": "N8N Content Engine Bot 1.0" } });
    
    const posts = response.data?.data?.children || [];
    if (posts.length === 0) {
      throw new Error("No posts found for niche");
    }

    return posts.map(p => {
      const d = p.data;
      return {
        text: `${d.title}\n${d.selftext || ""}`.substring(0, 1000),
        likes: d.ups || 0,
        comments: d.num_comments || 0,
        shares: d.num_crossposts || 0
      };
    });
  } catch (error) {
    console.error("Reddit fetch failed, using fallback:", error.message);
    return [
      { text: "3 mistakes killing your growth", likes: 1200, comments: 110, shares: 95 },
      { text: "Do this before posting reels", likes: 980, comments: 85, shares: 120 },
      { text: "The hook formula creators ignore", likes: 1800, comments: 210, shares: 250 }
    ];
  }
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

function isMockLikeContent(item) {
  if (!item) return false;
  const text = JSON.stringify(item).toLowerCase();
  return text.includes("mock");
}

async function runPipeline({ user }) {
  const userId = user.id || user._id;
  const posts = await fetchPosts(user.niche);
  const normalized = normalizeData(posts);
  const scored = viralScoring(normalized);
  const top = selectTopContent(scored, 3);

  const { data: contentRows, error: bestError } = await supabase
    .from("contents")
    .select("*")
    .eq("user_id", userId)
    .limit(100);
  if (bestError) throw bestError;

  const bestPerforming = (contentRows || [])
    .map(mapContentRow)
    .filter((item) => !isMockLikeContent(item))
    .sort((a, b) => (b.performance?.views || 0) - (a.performance?.views || 0))
    .slice(0, 3);

  const insightsRaw = await generateInsights(top);
  const insightsFallback = getFallbackInsights(top);
  const insights = normalizeInsightsOutput(
    parseStructuredResponse(insightsRaw.raw, insightsFallback),
    insightsFallback
  );

  const generatedRaw = await generateScripts(insights, user.tone, user.niche, bestPerforming);
  const generatedFallback = getFallbackScripts(insights, user.tone, user.niche);
  const generated = normalizeScriptsOutput(
    parseStructuredResponse(generatedRaw.raw, generatedFallback),
    generatedFallback
  );

  const score = top.reduce((sum, p) => sum + p.score, 0) / (top.length || 1);
  const { data: insertedContent, error: insertError } = await supabase
    .from("contents")
    .insert({
      user_id: userId,
      source_posts: top,
      insights,
      hooks: generated.hooks || [],
      scripts: generated.scripts || [],
      captions: generated.captions || [],
      hashtags: generated.hashtags || [],
      performance: { likes: 0, views: 0, shares: 0, comments: 0 },
      score
    })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return mapContentRow(insertedContent);
}

module.exports = {
  fetchPosts,
  normalizeData,
  viralScoring,
  selectTopContent,
  runPipeline
};
