import { defineConfig } from '@playwright/test';
import config from './playwright.config';

// Login limits live in the API process. Keep this suite isolated without changing them.
export default defineConfig({
  ...config,
  testIgnore: [],
  testMatch: 'password-profile.spec.ts',
  outputDir: 'test-results/passwords',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/passwords' }]],
});
