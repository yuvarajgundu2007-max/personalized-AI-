const express = require('express');
const { z } = require('zod');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateChatResponse, safeJsonParse } = require('../ai/aiService');

const router = express.Router();
router.use(authenticate);

const chatSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(20).optional().default([]),
});

// POST /api/ai/chat
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, history } = chatSchema.parse(req.body);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const recentInteractions = await prisma.interaction.findMany({
    where: { userId: req.user.id },
    include: { content: { select: { title: true, category: true } } },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });

  const { message: response, aiGenerated } = await generateChatResponse(
    message, profile, recentInteractions, history
  );

  // Log chat interaction
  await prisma.interaction.create({
    data: {
      userId: req.user.id,
      eventType: 'CHAT',
      metadata: JSON.stringify({ messageLength: message.length, aiGenerated }),
    },
  });

  res.json({
    message: response,
    aiGenerated,
    timestamp: new Date().toISOString(),
  });
}));

// POST /api/ai/personalize — generate fresh AI personalization summary
router.post('/personalize', asyncHandler(async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const interests = safeJsonParse(profile.interests, []);
  const likedCategories = safeJsonParse(profile.likedCategories, {});
  const completedItems = safeJsonParse(profile.completedItems, []);

  const topCategory = Object.entries(likedCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)[0];

  const summary = `You are a ${profile.skillLevel} learner focused on ${profile.goal}. ` +
    `Your top interests are ${interests.slice(0, 3).join(', ')}. ` +
    `${topCategory ? `You've shown strong engagement with ${topCategory} content. ` : ''}` +
    `You've completed ${completedItems.length} activities with an engagement score of ${profile.engagementScore.toFixed(0)}/100.`;

  await prisma.userProfile.update({
    where: { userId: req.user.id },
    data: { personalizationSummary: summary },
  });

  res.json({ summary, message: 'Personalization updated' });
}));

module.exports = router;
