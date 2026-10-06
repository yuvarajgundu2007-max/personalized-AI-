module.exports = {
  testEnvironment: 'node',
  globalSetup: './tests/globalSetup.js',
  setupFiles: ['./tests/setup.env.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  clearMocks: true,
};
