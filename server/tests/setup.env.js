/**
 * Jest setup — runs BEFORE test modules are loaded.
 * Isolates the test environment: separate SQLite DB, test JWT secret,
 * and an empty Gemini key so the deterministic AI fallback path is exercised.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret-for-ci-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.GEMINI_API_KEY = '';
process.env.PORT = '0';
