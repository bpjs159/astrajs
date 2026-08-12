import { defineConfig } from 'vitest/config';
import path from 'path';

const root = path.resolve(__dirname, '../..');

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    conditions: ['development'],
    alias: [
      { find: '@astrajs/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
    ],
  },
});
