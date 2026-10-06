const express = require('express');
const { z } = require('zod');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { safeJsonParse } = require('../ai/aiService');

const router = express.Router();
router.use(authenticate);

const preferencesSchema = z.object({
  goal: z.enum(['learn-ai', 'learn-programming', 'improve-career', 'prepare-interviews', 'build-startup', 'improve-productivity', 'improve-communication', 'general']).optional(),
  interests: z.array(z.string()).min(1).max(10).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferredStyle: z.enum(['short', 'detailed', 'visual', 'practical', 'challenge']).optional(),
  availableTime: z.enum(['15min', '30min', '1hr', '2hr+']).optional(),
  pausePersonalization: z.boolean().optional(),
});

// GET /api/preferences
router.get('/', asyncHandler(async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
    select: {
      goal: true,
      interests: true,
      skillLevel: true,
      preferredStyle: true,
      availableTime: true,
      pausePersonalization: true,
      personalNote: true,
    },
  });

  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  res.json({
    preferences: {
      ...profile,
      interests: safeJsonParse(profile.interests, []),
    },
  });
}));

// PUT /api/preferences
router.put('/', asyncHandler(async (req, res) => {
  const validated = preferencesSchema.parse(req.body);

  const updateData = {};
  if (validated.goal !== undefined) updateData.goal = validated.goal;
  if (validated.interests !== undefined) updateData.interests = JSON.stringify(validated.interests);
  if (validated.skillLevel !== undefined) updateData.skillLevel = validated.skillLevel;
  if (validated.preferredStyle !== undefined) updateData.preferredStyle = validated.preferredStyle;
  if (validated.availableTime !== undefined) updateData.availableTime = validated.availableTime;
  if (validated.pausePersonalization !== undefined) updateData.pausePersonalization = validated.pausePersonalization;

  // Track the preference change as an interaction
  await prisma.interaction.create({
    data: {
      userId: req.user.id,
      eventType: 'PREFERENCE_CHANGE',
      metadata: JSON.stringify({ changes: Object.keys(validated) }),
    },
  });

  const profile = await prisma.userProfile.update({
    where: { userId: req.user.id },
    data: updateData,
  });

  res.json({
    message: 'Preferences updated',
    preferences: {
      ...profile,
      interests: safeJsonParse(profile.interests, []),
    },
  });
}));

// DELETE /api/preferences/history — reset activity history
router.delete('/history', asyncHandler(async (req, res) => {
  await prisma.interaction.deleteMany({ where: { userId: req.user.id } });
  await prisma.feedback.deleteMany({ where: { userId: req.user.id } });

  // Reset behavioral signals but keep preferences
  await prisma.userProfile.update({
    where: { userId: req.user.id },
    data: {
      likedCategories: '{}',
      dislikedCategories: '{}',
      completedItems: '[]',
      savedItems: '[]',
      skippedItems: '[]',
      engagementScore: 0,
      streak: 0,
      currentFocus: '',
      personalizationSummary: '',
    },
  });

  res.json({ message: 'Activity history cleared successfully' });
}));

// POST /api/preferences/reset — full personalization reset
router.post('/reset', asyncHandler(async (req, res) => {
  await prisma.interaction.deleteMany({ where: { userId: req.user.id } });
  await prisma.feedback.deleteMany({ where: { userId: req.user.id } });
  await prisma.aiInsight.deleteMany({ where: { userId: req.user.id } });

  await prisma.userProfile.update({
    where: { userId: req.user.id },
    data: {
      likedCategories: '{}',
      dislikedCategories: '{}',
      completedItems: '[]',
      savedItems: '[]',
      skippedItems: '[]',
      engagementScore: 0,
      streak: 0,
      currentFocus: '',
      personalizationSummary: '',
      pausePersonalization: false,
    },
  });

  res.json({ message: 'Personalization reset successfully. Your experience will rebuild from scratch.' });
}));

module.exports = router;
