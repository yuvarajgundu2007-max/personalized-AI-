const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../database/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { parsePersonalNote } = require('../ai/aiService');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const validated = registerSchema.parse(req.body);

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email: validated.email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(validated.password, salt);

  // Create user + initial profile
  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      password: hashedPassword,
      profile: {
        create: {
          goal: 'general',
          interests: '[]',
          skillLevel: 'beginner',
          preferredStyle: 'short',
          availableTime: '30min',
          onboardingComplete: false,
        },
      },
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const token = generateToken(user.id);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: { id: user.id, email: user.email, name: user.name },
    onboardingRequired: true,
  });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const validated = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: validated.email },
    include: { profile: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordValid = await bcrypt.compare(validated.password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, name: user.name },
    onboardingRequired: !user.profile?.onboardingComplete,
  });
}));

// GET /api/auth/me
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          goal: true,
          interests: true,
          skillLevel: true,
          preferredStyle: true,
          availableTime: true,
          currentFocus: true,
          engagementScore: true,
          streak: true,
          onboardingComplete: true,
        },
      },
    },
  });
  res.json({ user });
}));

module.exports = router;
