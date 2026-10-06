require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const preferencesRoutes = require('./routes/preferences');
const recommendationsRoutes = require('./routes/recommendations');
const interactionsRoutes = require('./routes/interactions');
const personalizationRoutes = require('./routes/personalization');
const aiRoutes = require('./routes/ai');
const contentRoutes = require('./routes/content');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Fail fast on missing JWT secret in production; safe dev fallback otherwise.
// Never commit real secrets — this guard exists so a fresh clone cannot
// silently sign tokens with an empty secret.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SECRET not set — using an insecure development default. Set JWT_SECRET in server/.env before deploying.');
  process.env.JWT_SECRET = 'dev-only-insecure-default-do-not-use-in-production';
}

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/content', contentRoutes);

// Optional single-service mode: serve the built client from the same server
// (used for demo previews and simple Render/Railway deployments)
const fs = require('fs');
const path = require('path');
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (process.env.NODE_ENV !== 'test' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA history fallback — must precede the API 404 handler below
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 AdaptiveAI Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
