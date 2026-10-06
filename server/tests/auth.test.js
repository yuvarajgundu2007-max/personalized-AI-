/**
 * Authentication tests: registration, validation, login, protected routes.
 */
const { request, app, prisma, createUser } = require('./helpers');

describe('POST /api/auth/register', () => {
  test('creates an account and returns a JWT + onboarding flag', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', email: `jane-${Date.now()}@test.com`, password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toContain('@test.com');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.onboardingRequired).toBe(true);
  });

  test('stores the password hashed (never plaintext)', async () => {
    const email = `hash-${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hash Test', email, password: 'password123' });

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
    expect(dbUser.password).not.toBe('password123');
    expect(dbUser.password.startsWith('$2')).toBe(true); // bcrypt hash format
  });

  test('rejects invalid email (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('rejects short password (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'X', email: `x-${Date.now()}@test.com`, password: '123' });
    expect(res.status).toBe(400);
  });

  test('rejects duplicate email (409)', async () => {
    const email = `dup-${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'First', email, password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Second', email, password: 'password123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  test('logs in with valid credentials', async () => {
    const { email } = await createUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.onboardingRequired).toBe(false);
  });

  test('rejects wrong password (401) without revealing which field failed', async () => {
    const { email } = await createUser();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('rejects non-existent user (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: `ghost-${Date.now()}@test.com`, password: 'whatever123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me (protected)', () => {
  test('returns the authenticated user with profile', async () => {
    const { token, user } = await createUser();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body.user.profile).toBeDefined();
    expect(res.body.user.profile.goal).toBe('learn-ai');
  });

  test('rejects missing token (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('rejects tampered token (401)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer tampered.token.value');
    expect(res.status).toBe(401);
  });
});
