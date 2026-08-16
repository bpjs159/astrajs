import { defineConfig } from 'vitest/config';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

export default defineConfig({
  resolve: {
    conditions: ['development'],
    alias: [
      { find: '@bpjs159/core/jsx-dev-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-dev-runtime.ts') },
      { find: '@bpjs159/core/jsx-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-runtime.ts') },
      { find: '@bpjs159/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
      { find: '@bpjs159/compiler/css', replacement: path.resolve(root, 'packages/compiler/src/css.ts') },
    ],
  },
});
