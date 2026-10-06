/**
 * AI service tests — deterministic fallback must work without any API key.
 * This guarantees the app stays functional when the AI provider is unavailable.
 */
const { request, app, createUser, createContent } = require('./helpers');
const {
  generateChatResponse,
  generatePersonalizationInsights,
  generateFallbackChatResponse,
  safeJsonParse,
} = require('../src/ai/aiService');

describe('AI service fallbacks (no API key configured)', () => {
  const profile = {
    user: { name: 'Test' },
    goal: 'learn-ai',
    interests: JSON.stringify(['ai', 'webdev']),
    skillLevel: 'beginner',
    preferredStyle: 'short',
    availableTime: '15min',
    currentFocus: 'ai',
    engagementScore: 42,
    streak: 3,
    personalNote: '',
    likedCategories: JSON.stringify({ ai: 5 }),
    dislikedCategories: JSON.stringify({}),
    completedItems: JSON.stringify([]),
  };

  test('chat falls back to a personalized deterministic response', async () => {
    const res = await generateChatResponse('What should I focus on today?', profile, []);
    expect(res.message).toBeDefined();
    expect(res.message.length).toBeGreaterThan(20);
    expect(res.message).toContain('learn-ai'); // personalization present
    expect(res.aiGenerated).toBe(false);
  });

  test('insights fall back to deterministic behavioral summary', async () => {
    const res = await generatePersonalizationInsights(profile, []);
    expect(res.behavioralSummary).toBeDefined();
    expect(res.currentFocusSuggestion).toBeDefined();
    expect(res.personalizationConfidence).toBeDefined();
    expect(res.aiGenerated).toBe(false);
  });

  test('fallback chat mentions the user goal for focus questions', () => {
    const res = generateFallbackChatResponse('What should I do today?', profile);
    expect(res.message).toContain('learn-ai');
  });
});

describe('safeJsonParse', () => {
  test('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });
  test('returns fallback on invalid JSON without throwing', () => {
    expect(safeJsonParse('not-json', [])).toEqual([]);
    expect(safeJsonParse(null, null)).toBeNull();
  });
});

describe('POST /api/ai/chat (integration)', () => {
  test('returns a personalized response without an AI key', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Give me something useful to do today', history: [] });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    expect(res.body.aiGenerated).toBe(false);
  });

  test('rejects empty message (400)', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: '' });
    expect(res.status).toBe(400);
  });

  test('rejects over-long messages (400)', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'x'.repeat(2500) });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/personalization/insights (integration)', () => {
  test('returns insights and caches them in valid JSON', async () => {
    const { token, user } = await createUser();
    await createContent();

    const first = await request(app)
      .get('/api/personalization/insights')
      .set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.insights.behavioralSummary).toBeDefined();

    // Second call should hit the cache (marked cached: true)
    const second = await request(app)
      .get('/api/personalization/insights')
      .set('Authorization', `Bearer ${token}`);
    expect(second.body.insights.cached).toBe(true);
    expect(second.body.insights.behavioralSummary).toBeDefined();

    // The stored cache entry must be valid JSON (regression test)
    const { prisma } = require('./helpers');
    const stored = await prisma.aiInsight.findFirst({
      where: { userId: user.id, type: 'behavioral_summary' },
      orderBy: { createdAt: 'desc' },
    });
    expect(() => JSON.parse(stored.content)).not.toThrow();
  });
});
