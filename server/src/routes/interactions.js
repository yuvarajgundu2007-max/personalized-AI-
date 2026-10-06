const express = require('express');
const { z } = require('zod');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { updateProfileFromInteraction } = require('../personalization/engine');

const router = express.Router();
router.use(authenticate);

const interactionSchema = z.object({
  contentId: z.string().optional(),
  eventType: z.enum(['VIEW', 'CLICK', 'SAVE', 'COMPLETE', 'SKIP', 'DISLIKE', 'LIKE', 'SEARCH', 'CHAT', 'PREFERENCE_CHANGE']),
  metadata: z.record(z.unknown()).optional().default({}),
});

// POST /api/interactions
router.post('/', asyncHandler(async (req, res) => {
  const validated = interactionSchema.parse(req.body);

  // If contentId provided, verify ownership isn't needed (public content)
  // but verify content exists
  if (validated.contentId) {
    const content = await prisma.content.findUnique({ where: { id: validated.contentId } });
    if (!content) return res.status(404).json({ error: 'Content not found' });
  }

  await prisma.interaction.create({
    data: {
      userId: req.user.id,
      contentId: validated.contentId || null,
      eventType: validated.eventType,
      metadata: JSON.stringify(validated.metadata),
    },
  });

  // Update profile signals for behavioral learning
  if (validated.contentId) {
    await updateProfileFromInteraction(req.user.id, validated.eventType, validated.contentId, validated.metadata);
  }

  res.json({ message: 'Interaction recorded', eventType: validated.eventType });
}));

// GET /api/interactions — recent interactions for the user
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 50, eventType } = req.query;

  const interactions = await prisma.interaction.findMany({
    where: {
      userId: req.user.id,
      ...(eventType && { eventType }),
    },
    include: {
      content: {
        select: { id: true, title: true, category: true, type: true, difficulty: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: Math.min(parseInt(limit), 100),
  });

  res.json({ interactions });
}));

module.exports = router;
