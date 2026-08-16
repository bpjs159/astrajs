import { defineConfig } from 'vitest/config';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Safety: fail fast if a reactive loop hangs instead of freezing the editor
    testTimeout: 2000,
    hookTimeout: 2000,
  },
  resolve: {
    conditions: ['development'],
    alias: [
      { find: '@bpjs159/core/jsx-dev-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-dev-runtime.ts') },
      { find: '@bpjs159/core/jsx-runtime', replacement: path.resolve(root, 'packages/core/src/jsx-runtime.ts') },
      { find: '@bpjs159/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
      { find: '@bpjs159/compiler/css', replacement: path.resolve(root, 'packages/compiler/src/css.ts') },
      { find: '@bpjs159/form', replacement: path.resolve(root, 'packages/form/src/index.ts') },
      { find: '@bpjs159/validation', replacement: path.resolve(root, 'packages/validation/src/index.ts') },
      { find: '@bpjs159/server', replacement: path.resolve(root, 'packages/server/src/index.ts') },
      { find: '@bpjs159/ssr', replacement: path.resolve(root, 'packages/ssr/src/index.ts') },
      { find: '@bpjs159/router', replacement: path.resolve(root, 'packages/router/src/index.ts') },
    ],
  },
});
