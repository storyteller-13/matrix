import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    // Browser tests run under Playwright (npm run test:e2e), not Vitest.
    exclude: ['**/node_modules/**', 'tests/e2e/**'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['core/**/*.js', 'applications/**/*.js', 'api/**/*.js'],
      reporter: ['text', 'text-summary'],
      // Set a little below the current numbers, so routine changes pass but coverage cannot quietly slide.
      thresholds: {
        statements: 94,
        branches: 90,
        functions: 94,
        lines: 95,
      },
    },
  },
});
