const express = require('express');
const { z } = require('zod');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPersonalizedRecommendations } = require('../personalization/engine');
const { updateProfileFromInteraction } = require('../personalization/engine');
const { generateRecommendationExplanation } = require('../ai/aiService');
const { safeJsonParse } = require('../ai/aiService');

const router = express.Router();
router.use(authenticate);

// GET /api/recommendations
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 12, category, offset = 0 } = req.query;

  const recommendations = await getPersonalizedRecommendations(req.user.id, {
    limit: Math.min(parseInt(limit), 50),
    category: category || null,
  });

  res.json({
    recommendations,
    total: recommendations.length,
    personalized: true,
  });
}));

// POST /api/recommendations/:id/feedback
router.post('/:id/feedback', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = z.object({
    action: z.enum(['like', 'dislike', 'save', 'complete', 'skip']),
  }).parse(req.body);

  // Verify content exists
  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) return res.status(404).json({ error: 'Content not found' });

  // Upsert feedback (one feedback action per content per user)
  await prisma.feedback.upsert({
    where: { userId_contentId_action: { userId: req.user.id, contentId: id, action } },
    create: { userId: req.user.id, contentId: id, action },
    update: { timestamp: new Date() },
  });

  // Map action to event type
  const eventMap = {
    like: 'LIKE',
    dislike: 'DISLIKE',
    save: 'SAVE',
    complete: 'COMPLETE',
    skip: 'SKIP',
  };

  // Update profile behavioral signals
  await updateProfileFromInteraction(req.user.id, eventMap[action], id);

  // Log interaction
  await prisma.interaction.create({
    data: {
      userId: req.user.id,
      contentId: id,
      eventType: eventMap[action],
      metadata: JSON.stringify({ action, contentCategory: content.category }),
    },
  });

  res.json({ message: `Feedback recorded: ${action}`, action, contentId: id });
}));

// GET /api/recommendations/:id/explain
router.get('/:id/explain', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) return res.status(404).json({ error: 'Content not found' });

  const profile = await prisma.userProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  // Calculate the breakdown for this specific item
  const { calculatePersonalizationScore } = require('../personalization/engine');
  const feedbackRecords = await prisma.feedback.findMany({
    where: { userId: req.user.id, contentId: id },
    select: { action: true },
  });
  const feedbackMap = {};
  feedbackRecords.forEach(f => { feedbackMap[id] = f.action; });

  const { score, breakdown } = calculatePersonalizationScore(content, profile, feedbackMap);

  // Generate AI explanation
  const { explanation, aiGenerated } = await generateRecommendationExplanation(
    content, profile, breakdown
  );

  res.json({
    contentId: id,
    title: content.title,
    personalizationScore: parseFloat(score.toFixed(3)),
    breakdown,
    explanation,
    aiGenerated,
  });
}));

// POST /api/recommendations/:id/action
router.post('/:id/action', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = z.object({
    action: z.enum(['click', 'view', 'start']),
  }).parse(req.body);

  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) return res.status(404).json({ error: 'Content not found' });

  const eventMap = { click: 'CLICK', view: 'VIEW', start: 'CLICK' };

  await prisma.interaction.create({
    data: {
      userId: req.user.id,
      contentId: id,
      eventType: eventMap[action],
      metadata: JSON.stringify({ action }),
    },
  });

  await updateProfileFromInteraction(req.user.id, eventMap[action], id);

  res.json({ message: 'Action recorded', action, contentId: id });
}));

module.exports = router;
