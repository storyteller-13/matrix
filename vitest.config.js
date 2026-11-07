import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['core/**/*.js', 'applications/**/*.js', 'api/**/*.js'],
      reporter: ['text', 'text-summary'],
    },
  },
});
