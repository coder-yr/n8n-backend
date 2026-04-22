function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    email: row.email,
    plan: row.plan,
    niche: row.niche,
    tone: row.tone,
    generationCount: row.generation_count,
    generationResetAt: row.generation_reset_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContentRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    sourcePosts: row.source_posts || [],
    insights: row.insights || {},
    hooks: row.hooks || [],
    scripts: row.scripts || [],
    captions: row.captions || [],
    hashtags: row.hashtags || [],
    performance: row.performance || { likes: 0, views: 0, shares: 0, comments: 0 },
    score: Number(row.score || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapScheduleRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    frequency: row.frequency,
    time: row.time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = { mapUserRow, mapContentRow, mapScheduleRow };