const express = require('express');
const prisma = require('../database/client');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { safeJsonParse } = require('../ai/aiService');

const router = express.Router();
router.use(authenticate);

// GET /api/content — browse all content with filters
router.get('/', asyncHandler(async (req, res) => {
  const { category, difficulty, type, search, limit = 20, offset = 0 } = req.query;

  const whereClause = {};
  if (category) whereClause.category = category;
  if (difficulty) whereClause.difficulty = difficulty;
  if (type) whereClause.type = type;
  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [content, total] = await Promise.all([
    prisma.content.findMany({
      where: whereClause,
      take: Math.min(parseInt(limit), 50),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.content.count({ where: whereClause }),
  ]);

  res.json({
    content: content.map(c => ({
      ...c,
      tags: safeJsonParse(c.tags, []),
      goalTags: safeJsonParse(c.goalTags, []),
    })),
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
}));

// GET /api/content/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const content = await prisma.content.findUnique({ where: { id: req.params.id } });
  if (!content) return res.status(404).json({ error: 'Content not found' });

  res.json({
    content: {
      ...content,
      tags: safeJsonParse(content.tags, []),
      goalTags: safeJsonParse(content.goalTags, []),
    },
  });
}));

module.exports = router;
