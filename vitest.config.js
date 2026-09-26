import { mkdirSync, promises as fsPromises } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// istanbul 1.6 crashes if coverage/.tmp is missing mid-run (concurrent
// vitest, or a failed run leaving the dir half-cleaned). Recreate it and
// ignore ENOENT on coverage temp files.
const coverageTmp = /[/\\]coverage[/\\].tmp/;
const coverageChunk = /[/\\]coverage[/\\].+coverage-\d+\.json$/;
const writeFile = fsPromises.writeFile.bind(fsPromises);
const readFile = fsPromises.readFile.bind(fsPromises);
const rm = fsPromises.rm.bind(fsPromises);
fsPromises.writeFile = (file, data, options) => {
  if (typeof file === 'string' && coverageChunk.test(file)) {
    mkdirSync(path.dirname(file), { recursive: true });
  }
  return writeFile(file, data, options);
};
fsPromises.readFile = async (file, options) => {
  try {
    return await readFile(file, options);
  } catch (err) {
    if (err?.code === 'ENOENT' && typeof file === 'string' && coverageChunk.test(file)) {
      return '{}';
    }
    throw err;
  }
};
fsPromises.rm = (file, options = {}) => {
  if (typeof file === 'string' && coverageTmp.test(file)) {
    return rm(file, { ...options, force: true, recursive: true });
  }
  return rm(file, options);
};

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    coverage: {
      provider: 'istanbul',
      enabled: true,
      include: ['core/**/*.js', 'applications/**/*.js', 'api/**/*.js'],
      exclude: ['tests/**', '**/*.test.js', 'node_modules/**'],
      reporter: ['text', 'text-summary'],
    },
  },
});

