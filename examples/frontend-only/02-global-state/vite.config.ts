import { defineConfig } from 'vitest/config';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

export default defineConfig({
  resolve: {
    conditions: ['development'],
    alias: [
      { find: 'astrajs.dev/core/jsx-dev-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-dev-runtime.ts') },
      { find: 'astrajs.dev/core/jsx-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-runtime.ts') },
      { find: 'astrajs.dev/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
      { find: 'astrajs.dev/compiler/css', replacement: path.resolve(root, 'packages/compiler/src/css.ts') },
    ],
  },
});
