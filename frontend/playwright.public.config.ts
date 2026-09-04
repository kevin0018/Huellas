import { defineConfig } from '@playwright/test';
import config, { frontendServer } from './playwright.config';

// Public-page checks can run without database or API infrastructure.
export default defineConfig({ ...config, testMatch: ['public-pages.spec.ts', 'password-fields.spec.ts'], webServer: frontendServer });
