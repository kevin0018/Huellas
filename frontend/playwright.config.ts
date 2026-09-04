import { defineConfig, devices } from '@playwright/test';

const databaseUrl = new URL(process.env.E2E_DATABASE_URL ?? 'mysql://root:e2e@127.0.0.1:33306/huellas_e2e');
if (databaseUrl.protocol !== 'mysql:' || databaseUrl.pathname !== '/huellas_e2e') {
  throw new Error('E2E_DATABASE_URL must target the dedicated huellas_e2e MySQL database');
}

export const frontendServer = {
  command: 'pnpm build && pnpm preview --host 127.0.0.1 --port 4173 --strictPort',
  url: 'http://127.0.0.1:4173',
  env: { VITE_API_URL: '/api', API_PROXY_TARGET: 'http://127.0.0.1:3001' },
  reuseExistingServer: false,
  timeout: 120_000,
  stdout: 'pipe' as const,
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --dir ../backend start:e2e',
      url: 'http://127.0.0.1:3001/db-check',
      reuseExistingServer: false,
      stdout: 'pipe',
      timeout: 120_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
      env: {
        NODE_ENV: 'test', PORT: '3001', FRONTEND_PORT: '4173',
        CORS_ORIGINS: 'http://127.0.0.1:4173',
        DATABASE_URL: databaseUrl.href,
        DB_HOST: databaseUrl.hostname, DB_PORT: databaseUrl.port || '3306',
        DB_USER: decodeURIComponent(databaseUrl.username), DB_PASSWORD: decodeURIComponent(databaseUrl.password),
        DB_NAME: 'huellas_e2e',
        REDIS_URL: process.env.E2E_REDIS_URL ?? 'redis://127.0.0.1:36379/15',
        JWT_SECRET: 'huellas-e2e-only-secret',
      },
    },
    frontendServer,
  ],
});
