/**
 * Personalization engine tests — the heart of the product.
 * Unit tests for scoring + integration tests for the behavior → profile → re-rank loop.
 */
const { request, app, prisma, createUser, createContent } = require('./helpers');
const {
  calculatePersonalizationScore,
} = require('../src/personalization/engine');

const makeProfile = (overrides = {}) => ({
  goal: 'learn-ai',
  interests: JSON.stringify(['ai', 'data-science']),
  skillLevel: 'beginner',
  preferredStyle: 'short',
  availableTime: '15min',
  likedCategories: JSON.stringify({}),
  dislikedCategories: JSON.stringify({}),
  completedItems: JSON.stringify([]),
  skippedItems: JSON.stringify([]),
  ...overrides,
});

const makeContent = (overrides = {}) => ({
  id: 'content-1',
  category: 'ai',
  type: 'article',
  difficulty: 'beginner',
  duration: '15min',
  tags: JSON.stringify(['ai', 'ml']),
  goalTags: JSON.stringify(['learn-ai']),
  ...overrides,
});

describe('calculatePersonalizationScore (unit)', () => {
  test('scores a perfect match near 1.0', () => {
    const profile = makeProfile();
    const content = makeContent();
    const { score, breakdown } = calculatePersonalizationScore(content, profile, {});
    expect(score).toBeGreaterThan(0.8);
    expect(breakdown.goalMatch).toBeGreaterThan(0.6);
    expect(breakdown.skillMatch).toBe(1);
  });

  test('scores mismatched difficulty lower', () => {
    const profile = makeProfile();
    const advanced = makeContent({ difficulty: 'advanced' });
    const perfect = makeContent({ difficulty: 'beginner' });
    const { score: sAdvanced } = calculatePersonalizationScore(advanced, profile, {});
    const { score: sPerfect } = calculatePersonalizationScore(perfect, profile, {});
    expect(sAdvanced).toBeLessThan(sPerfect);
  });

  test('penalizes disliked categories via behavior signal', () => {
    const profile = makeProfile({
      dislikedCategories: JSON.stringify({ business: 5 }),
    });
    const business = makeContent({ category: 'business', goalTags: JSON.stringify([]) });
    const ai = makeContent({ category: 'ai' });
    const { score: sBusiness } = calculatePersonalizationScore(business, profile, {});
    const { score: sAi } = calculatePersonalizationScore(ai, profile, {});
    expect(sBusiness).toBeLessThan(sAi);
  });

  test('penalizes already-completed and skipped items', () => {
    const content = makeContent();
    const fresh = makeProfile({ completedItems: JSON.stringify([]) });
    const done = makeProfile({ completedItems: JSON.stringify([content.id]) });
    const { score: sFresh } = calculatePersonalizationScore(content, fresh, {});
    const { score: sDone } = calculatePersonalizationScore(content, done, {});
    expect(sDone).toBeLessThan(sFresh);
  });

  test('negative explicit feedback lowers the score', () => {
    const content = makeContent();
    const profile = makeProfile();
    const { score: neutral } = calculatePersonalizationScore(content, profile, {});
    const { score: disliked } = calculatePersonalizationScore(content, profile, {
      [content.id]: 'dislike',
    });
    expect(disliked).toBeLessThan(neutral);
  });
});

describe('behavior → profile → re-rank loop (integration)', () => {
  test(' liking AI content raises AI affinity and engagement in the profile', async () => {
    const { token } = await createUser();
    const content = await createContent({ category: 'ai' });

    const before = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    const engagementBefore = before.body.profile.engagementScore;

    await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'like' });

    const after = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    expect(after.body.profile.engagementScore).toBeGreaterThan(engagementBefore);
    expect(after.body.profile.likedCategories.ai).toBeGreaterThan(0);
  });

  test('disliked content is suppressed in subsequent recommendations', async () => {
    const { token } = await createUser();
    const content = await createContent({ category: 'webdev', difficulty: 'beginner' });

    await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'dislike' });

    const res = await request(app)
      .get('/api/recommendations?limit=50')
      .set('Authorization', `Bearer ${token}`);
    const item = res.body.recommendations.find((r) => r.id === content.id);
    if (item) {
      // If still present, its score must have been reduced — not recomputed the same
      expect(item.feedbackStatus).toBe('dislike');
      expect(item.personalizationScore).toBeLessThan(0.6);
    }
  });

  test('completed content is recorded and engagement increases', async () => {
    const { token } = await createUser();
    const content = await createContent({ category: 'ai' });

    await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'complete' });

    const profile = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    expect(profile.body.profile.completedItems).toContain(content.id);
    expect(profile.body.profile.engagementScore).toBeGreaterThanOrEqual(10);
  });

  test('pausePersonalization stops behavioral learning', async () => {
    const { token } = await createUser();
    // Pause personalization
    await request(app)
      .put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ pausePersonalization: true });

    const content = await createContent({ category: 'ai' });
    await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'like' });

    const profile = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    expect(profile.body.profile.likedCategories.ai).toBeUndefined();
  });

  test('streak increments on first activity of the day', async () => {
    const { token } = await createUser();
    const content = await createContent();

    await request(app)
      .post('/api/interactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentId: content.id, eventType: 'VIEW' });

    const profile = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    expect(profile.body.profile.streak).toBeGreaterThanOrEqual(1);
  });
});
