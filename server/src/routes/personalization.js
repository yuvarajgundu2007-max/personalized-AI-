const express = require('express');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getBehavioralSummary } = require('../personalization/engine');
const { generatePersonalizationInsights, safeJsonParse } = require('../ai/aiService');

const router = express.Router();
router.use(authenticate);

// GET /api/personalization/profile — full personalization profile
router.get('/profile', asyncHandler(async (req, res) => {
  const summary = await getBehavioralSummary(req.user.id);
  if (!summary) return res.status(404).json({ error: 'Profile not found' });
  res.json(summary);
}));

// GET /api/personalization/insights — AI-generated insights
router.get('/insights', asyncHandler(async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const recentInteractions = await prisma.interaction.findMany({
    where: { userId: req.user.id },
    include: { content: { select: { category: true, type: true } } },
    orderBy: { timestamp: 'desc' },
    take: 20,
  });

  let insights;
  const cachedInsight = await prisma.aiInsight.findFirst({
    where: {
      userId: req.user.id,
      type: 'behavioral_summary',
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  const cached = cachedInsight ? safeJsonParse(cachedInsight.content, null) : null;

  if (cached && cached.behavioralSummary) {
    // Only use the cache when it contains a valid insights payload
    insights = { ...cached, cached: true };
  } else {
    insights = await generatePersonalizationInsights(profile, recentInteractions);

    // Cache the insights
    await prisma.aiInsight.create({
      data: {
        userId: req.user.id,
        type: 'behavioral_summary',
        content: JSON.stringify(insights),
        metadata: JSON.stringify({ interactionCount: recentInteractions.length }),
      },
    });
  }

  res.json({ insights });
}));

// POST /api/personalization/refresh — force refresh insights
router.post('/refresh', asyncHandler(async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const recentInteractions = await prisma.interaction.findMany({
    where: { userId: req.user.id },
    include: { content: { select: { category: true, type: true } } },
    orderBy: { timestamp: 'desc' },
    take: 20,
  });

  const insights = await generatePersonalizationInsights(profile, recentInteractions);

  // Save new insights
  await prisma.aiInsight.create({
    data: {
      userId: req.user.id,
      type: 'behavioral_summary',
      content: JSON.stringify(insights),
      metadata: JSON.stringify({ refreshed: true, interactionCount: recentInteractions.length }),
    },
  });

  res.json({ insights, message: 'Insights refreshed' });
}));

// GET /api/personalization/analytics — for progress page
router.get('/analytics', asyncHandler(async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
  });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  // Activity over the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const interactions = await prisma.interaction.findMany({
    where: { userId: req.user.id, timestamp: { gte: sevenDaysAgo } },
    include: { content: { select: { category: true, type: true } } },
    orderBy: { timestamp: 'asc' },
  });

  // Aggregate by day
  const dayMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dayMap[key] = { date: key, interactions: 0, completions: 0 };
  }

  interactions.forEach(interaction => {
    const key = interaction.timestamp.toISOString().split('T')[0];
    if (dayMap[key]) {
      dayMap[key].interactions += 1;
      if (interaction.eventType === 'COMPLETE') dayMap[key].completions += 1;
    }
  });

  const activityData = Object.values(dayMap);

  // Category distribution
  const catMap = {};
  interactions.forEach(i => {
    if (i.content?.category) {
      catMap[i.content.category] = (catMap[i.content.category] || 0) + 1;
    }
  });

  const categoryData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Feedback stats
  const allFeedback = await prisma.feedback.findMany({
    where: { userId: req.user.id },
    select: { action: true },
  });

  const feedbackStats = { like: 0, dislike: 0, complete: 0, save: 0, skip: 0 };
  allFeedback.forEach(f => { feedbackStats[f.action] = (feedbackStats[f.action] || 0) + 1; });

  const completedItems = safeJsonParse(profile.completedItems, []);
  const totalContent = await prisma.content.count();

  res.json({
    analytics: {
      engagementScore: profile.engagementScore,
      streak: profile.streak,
      completionRate: totalContent > 0 ? (completedItems.length / totalContent * 100).toFixed(1) : 0,
      totalInteractions: await prisma.interaction.count({ where: { userId: req.user.id } }),
      totalCompletions: completedItems.length,
      totalSaved: safeJsonParse(profile.savedItems, []).length,
      activityData,
      categoryData,
      feedbackStats,
    },
  });
}));

module.exports = router;
