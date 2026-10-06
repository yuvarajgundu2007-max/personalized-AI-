/**
 * Jest global setup — pushes the Prisma schema to the isolated test DB.
 * Runs once before all test suites.
 */
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  const serverDir = path.join(__dirname, '..');
  const env = {
    ...process.env,
    DATABASE_URL: 'file:./test.db',
    NODE_ENV: 'test',
  };
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: serverDir,
    env,
    stdio: 'inherit',
  });
};
