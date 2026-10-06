/**
 * Content browsing, interactions, preferences & personalization controls tests.
 */
const { request, app, prisma, createUser, createContent } = require('./helpers');

describe('GET /api/content', () => {
  test('requires authentication', async () => {
    const res = await request(app).get('/api/content');
    expect(res.status).toBe(401);
  });

  test('returns catalog with parsed tags', async () => {
    const { token } = await createUser();
    await createContent({ tags: JSON.stringify(['react', 'frontend']) });

    const res = await request(app).get('/api/content').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.content)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('search is case-insensitive (title, description, tags)', async () => {
    const { token } = await createUser();
    await createContent({ title: 'Learning ReactHooks', tags: JSON.stringify(['react']) });

    const res = await request(app)
      .get('/api/content?search=reacthooks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  test('category filter narrows results', async () => {
    const { token } = await createUser();
    await createContent({ category: 'design' });
    await createContent({ category: 'finance' });

    const res = await request(app)
      .get('/api/content?category=design')
      .set('Authorization', `Bearer ${token}`);
    for (const item of res.body.content) {
      expect(item.category).toBe('design');
    }
  });
});

describe('POST /api/interactions', () => {
  test('records a valid interaction', async () => {
    const { token } = await createUser();
    const content = await createContent();

    const res = await request(app)
      .post('/api/interactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentId: content.id, eventType: 'VIEW', metadata: { dwellMs: 4200 } });

    expect(res.status).toBe(200);

    const stored = await prisma.interaction.findFirst({
      where: { userId: res.body.userId || undefined, eventType: 'VIEW' },
      orderBy: { timestamp: 'desc' },
    });
    expect(stored).not.toBeNull();
  });

  test('rejects unknown event types (400)', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/interactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ eventType: 'NOT_A_REAL_EVENT' });
    expect(res.status).toBe(400);
  });

  test('rejects interactions referencing non-existent content (404)', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/interactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentId: 'missing-content-id', eventType: 'VIEW' });
    expect(res.status).toBe(404);
  });

  test('GET /api/interactions returns only the caller’s history', async () => {
    const userA = await createUser();
    const userB = await createUser();
    const content = await createContent();

    await request(app)
      .post('/api/interactions')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ contentId: content.id, eventType: 'CLICK' });

    const res = await request(app)
      .get('/api/interactions')
      .set('Authorization', `Bearer ${userB.token}`);

    for (const interaction of res.body.interactions) {
      expect(interaction.userId).not.toBe(userA.user.id);
    }
  });
});

describe('Personalization controls (user agency)', () => {
  test('clear history wipes interactions + behavioral signals', async () => {
    const { token, user } = await createUser();
    const content = await createContent();

    await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'like' });

    const res = await request(app)
      .delete('/api/preferences/history')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const interactions = await prisma.interaction.count({ where: { userId: user.id } });
    const feedback = await prisma.feedback.count({ where: { userId: user.id } });
    expect(interactions).toBe(0);
    expect(feedback).toBe(0);

    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    expect(JSON.parse(profile.likedCategories)).toEqual({});
    expect(profile.engagementScore).toBe(0);
  });

  test('full reset wipes AI insights too', async () => {
    const { token, user } = await createUser();

    await request(app)
      .get('/api/personalization/insights')
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .post('/api/preferences/reset')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);

    const insights = await prisma.aiInsight.count({ where: { userId: user.id } });
    expect(insights).toBe(0);
  });

  test('GET /api/personalization/profile exposes behavioral summary', async () => {
    const { token } = await createUser();
    const content = await createContent({ category: 'ai' });

    await request(app)
      .post(`/api/recommendations/${content.id}/feedback`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'complete' });

    const res = await request(app)
      .get('/api/personalization/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.profile.goal).toBe('learn-ai');
    expect(res.body.behavioral.topCategories.length).toBeGreaterThan(0);
    expect(res.body.behavioral.eventCounts.COMPLETE).toBe(1);
  });
});
