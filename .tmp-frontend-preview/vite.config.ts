import { defineConfig } from 'vite';
import astra from 'astrajs.dev/compiler';
import path from 'path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  plugins: [
    astra({
      apiPrefix: '/api/astra',
    }),
  ],
  server: {
    port: 5051,
  },
  resolve: {
    alias: {
      'astrajs.dev/core': path.join(root, 'packages/core/src'),
      'astrajs.dev/core/jsx-runtime': path.join(root, 'packages/core/src/jsx-runtime'),
      'astrajs.dev/core/jsx-dev-runtime': path.join(root, 'packages/core/src/jsx-dev-runtime'),
      'astrajs.dev/router': path.join(root, 'packages/router/src'),
    },
  },
});
