import { defineConfig } from 'vitest/config';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

export default defineConfig({
  test: { environment: 'jsdom' },
  resolve: {
    conditions: ['development'],
    alias: [
      { find: '@astrajs/core/jsx-dev-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-dev-runtime.ts') },
      { find: '@astrajs/core/jsx-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-runtime.ts') },
      { find: '@astrajs/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
      { find: '@astrajs/compiler/css', replacement: path.resolve(root, 'packages/compiler/src/css.ts') },
    ],
  },
});