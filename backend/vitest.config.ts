import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/**/*.test.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
      'src/contexts/owner/tests/**/*.ts'
    ],
    globals: true
  }
});