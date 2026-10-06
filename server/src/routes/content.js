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
  // NOTE: search is applied in JS below so it is case-insensitive on both
  // SQLite (local dev) and PostgreSQL (production)

  const allMatching = await prisma.content.findMany({
    where: whereClause,
    take: 500,
    orderBy: { createdAt: 'desc' },
  });

  const searchTerm = (search || '').trim().toLowerCase();
  const filtered = searchTerm
    ? allMatching.filter(c =>
        c.title.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm) ||
        safeJsonParse(c.tags, []).some(t => t.toLowerCase().includes(searchTerm))
      )
    : allMatching;

  const start = parseInt(offset);
  const end = start + Math.min(parseInt(limit), 50);
  const content = filtered.slice(start, end).map(c => ({
    ...c,
    tags: safeJsonParse(c.tags, []),
    goalTags: safeJsonParse(c.goalTags, []),
  }));

  res.json({
    content,
    total: filtered.length,
    limit: parseInt(limit),
    offset: start,
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
