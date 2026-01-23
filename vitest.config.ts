import { defineConfig } from 'vitest/config';

process.env.ZAIUS_ENV = 'test';

// Load test environment variables
import('dotenv').then(dotenv => {
  dotenv.config({ path: '.env.test' });
});

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/test/**/*', 'src/**/index.ts'],
    },
    globals: true,
  },
});