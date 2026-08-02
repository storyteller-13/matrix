import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    coverage: {
      provider: 'istanbul',
      include: ['core/**/*.js', 'applications/**/*.js', 'api/**/*.js'],
      exclude: ['tests/**', '**/*.test.js', 'node_modules/**'],
      reporter: ['text', 'text-summary'],
    },
  },
});

