/**
 * Shared test helpers: app instance, prisma, user factory, content factory.
 */
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/database/client');

let counter = 0;

async function createUser({
  name = 'Test User',
  onboarded = true,
  profileOverrides = {},
} = {}) {
  counter += 1;
  const email = `user-${Date.now()}-${counter}@test.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'password123' });

  if (res.status !== 201) {
    throw new Error(`User registration failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const { token, user } = res.body;

  if (onboarded) {
    await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goal: 'learn-ai',
        interests: ['ai', 'webdev'],
        skillLevel: 'beginner',
        preferredStyle: 'short',
        availableTime: '30min',
        personalNote: '',
        ...profileOverrides,
      });
  }

  return { token, user, email };
}

async function createContent(overrides = {}) {
  counter += 1;
  const defaults = {
    title: `Test Content ${counter}`,
    description: 'A test content item used by the automated test suite.',
    category: 'ai',
    type: 'article',
    difficulty: 'beginner',
    duration: '15min',
    tags: JSON.stringify(['ai', 'test']),
    goalTags: JSON.stringify(['learn-ai']),
  };
  const data = { ...defaults, ...overrides };
  return prisma.content.create({ data });
}

module.exports = { request, app, prisma, createUser, createContent };
