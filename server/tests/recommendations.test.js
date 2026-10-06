/**
 * Recommendations API tests: ranking, ownership, validation, explanations.
 */
const { request, app, createUser, createContent, prisma } = require('./helpers');

describe('GET /api/recommendations', () => {
  test('requires authentication (401)', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.status).toBe(401);
  });

  test('returns ranked recommendations with breakdown and match reasons', async () => {
    const { token } = await createUser();
    await createContent({ category: 'ai', difficulty: 'beginner' });
    await createContent({ category: 'ai', difficulty: 'beginner' });

    const res = await request(app)
      .get('/api/recommendations?limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.personalized).toBe(true);
    const recs = res.body.recommendations;
    expect(recs.length).toBeGreaterThan(0);

    const scores = recs.map((r) => r.personalizationScore);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted); // ranked descending

    for (const rec of recs) {
      expect(rec.breakdown).toBeDefined();
      expect(rec.matchReasons).toBeDefined();
    }
  });

  test('different users with different profiles get different rankings', async () => {
    // Clean the catalog for deterministic ranking in this test
    await prisma.interaction.deleteMany({});
    await prisma.feedback.deleteMany({});
    await prisma.content.deleteMany({});

    const userA = await createUser({
      name: 'Beginner AI',
      profileOverrides: {
        goal: 'learn-ai',
        interests: ['ai'],
        skillLevel: 'beginner',
        preferredStyle: 'short',
        availableTime: '15min',
      },
    });
    const userB = await createUser({
      name: 'Advanced Startup',
      profileOverrides: {
        goal: 'build-startup',
        interests: ['business', 'ai'],
        skillLevel: 'advanced',
        preferredStyle: 'practical',
        availableTime: '2hr+',
      },
    });

    await createContent({ title: 'Intro AI basics', category: 'ai', difficulty: 'beginner', type: 'article', duration: '15min' });
    await createContent({ title: 'Advanced startup architecture', category: 'business', difficulty: 'advanced', type: 'project', duration: '2hr+' });

    const [resA, resB] = await Promise.all([
      request(app).get('/api/recommendations?limit=20').set('Authorization', `Bearer ${userA.token}`),
      request(app).get('/api/recommendations?limit=20').set('Authorization', `Bearer ${userB.token}`),
    ]);

    expect(resA.body.recommendations.length).toBeGreaterThan(0);
    expect(resB.body.recommendations.length).toBeGreaterThan(0);

    const rankOf = (recs, title) =>
      recs.findIndex((r) => r.title === title) === -1
        ? Infinity
        : recs.findIndex((r) => r.title === title);

    // User A (beginner + AI) must rank the beginner AI item above the advanced startup one…
    const rankA_forIntro = rankOf(resA.body.recommendations, 'Intro AI basics');
    const rankA_forAdvanced = rankOf(resA.body.recommendations, 'Advanced startup architecture');
    expect(rankA_forIntro).toBeLessThan(rankA_forAdvanced);

    // …and User B (advanced + startup) the opposite — the experience genuinely differs.
    const rankB_forIntro = rankOf(resB.body.recommendations, 'Intro AI basics');
    const rankB_forAdvanced = rankOf(resB.body.recommendations, 'Advanced startup architecture');
    expect(rankB_forAdvanced).toBeLessThan(rankB_forIntro);
  });
});

describe('POST /api/recommendations/:id/feedback', () => {
  test('records feedback and returns 200', async () => {
    const { token } = await createUser();
    const content = await createContent();

    const res = await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'like' });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe('like');
  });

  test('rejects invalid action values (400)', async () => {
    const { token } = await createUser();
    const content = await createContent();

    const res = await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'superlike' });
    expect(res.status).toBe(400);
  });

  test('rejects feedback for non-existent content (404)', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/recommendations/nonexistent-id/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'like' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/recommendations/:id/explain', () => {
  test('returns a personalized explanation with score breakdown', async () => {
    const { token } = await createUser();
    const content = await createContent({ category: 'ai', difficulty: 'beginner' });

    const res = await request(app)
      .get(`/api/recommendations/${content.id}/explain`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.breakdown).toBeDefined();
    expect(res.body.explanation).toBeDefined();
    expect(typeof res.body.explanation).toBe('string');
    expect(res.body.aiGenerated).toBe(false); // no API key in test env → deterministic explanation
  });

  test('rejects explanation for non-existent content (404)', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get('/api/recommendations/does-not-exist/explain')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
