const express = require('express');
const { z } = require('zod');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { safeJsonParse } = require('../ai/aiService');
const { parsePersonalNote } = require('../ai/aiService');

const router = express.Router();
router.use(authenticate);

const onboardingSchema = z.object({
  goal: z.enum(['learn-ai', 'learn-programming', 'improve-career', 'prepare-interviews', 'build-startup', 'improve-productivity', 'improve-communication', 'general']),
  interests: z.array(z.string()).min(1).max(10),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredStyle: z.enum(['short', 'detailed', 'visual', 'practical', 'challenge']),
  availableTime: z.enum(['15min', '30min', '1hr', '2hr+']),
  personalNote: z.string().max(500).optional().default(''),
});

// GET /api/profile
router.get('/', asyncHandler(async (req, res) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  res.json({
    profile: {
      ...profile,
      interests: safeJsonParse(profile.interests, []),
      completedItems: safeJsonParse(profile.completedItems, []),
      savedItems: safeJsonParse(profile.savedItems, []),
      skippedItems: safeJsonParse(profile.skippedItems, []),
      likedCategories: safeJsonParse(profile.likedCategories, {}),
      dislikedCategories: safeJsonParse(profile.dislikedCategories, {}),
      behavioralSignals: safeJsonParse(profile.behavioralSignals, {}),
    },
  });
}));

// PUT /api/profile (onboarding + updates)
router.put('/', asyncHandler(async (req, res) => {
  const validated = onboardingSchema.parse(req.body);

  // Parse personal note with AI if provided
  let parsedNote = {};
  if (validated.personalNote) {
    const result = await parsePersonalNote(validated.personalNote, {
      goal: validated.goal,
      interests: validated.interests,
    });
    parsedNote = result.parsedAttributes || {};
  }

  // Merge additional interests detected from note
  let finalInterests = validated.interests;
  if (parsedNote.additionalInterests?.length) {
    const combined = new Set([...finalInterests, ...parsedNote.additionalInterests]);
    finalInterests = Array.from(combined).slice(0, 10);
  }

  const profile = await prisma.userProfile.update({
    where: { userId: req.user.id },
    data: {
      goal: validated.goal,
      interests: JSON.stringify(finalInterests),
      skillLevel: validated.skillLevel,
      preferredStyle: validated.preferredStyle,
      availableTime: validated.availableTime,
      personalNote: validated.personalNote || '',
      onboardingComplete: true,
      behavioralSignals: JSON.stringify(parsedNote),
      currentFocus: finalInterests[0] || validated.goal,
    },
    include: { user: { select: { name: true } } },
  });

  res.json({
    message: 'Profile updated successfully',
    profile: {
      ...profile,
      interests: safeJsonParse(profile.interests, []),
    },
  });
}));

module.exports = router;
