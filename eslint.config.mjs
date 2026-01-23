import node from '@zaiusinc/eslint-config-presets/node.mjs';
import vitest from '@zaiusinc/eslint-config-presets/vitest.mjs';

export default [
  ...node,
  ...vitest,
  {
    files: ['**/*.test.ts'],

    rules: {
      '@typescript-eslint/unbound-method': 'off'
    },
  }];