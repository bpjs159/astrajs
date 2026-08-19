import { defineConfig } from 'vite';
import astra from 'astrajs.dev/compiler';
import path from 'path';

export default defineConfig({
  plugins: [
    astra({
      apiPrefix: '/api/astra',
    }),
  ],
  resolve: {
    alias: {
      'astrajs.dev/core': path.resolve(__dirname, '../packages/core/src'),
      'astrajs.dev/core/jsx-runtime': path.resolve(__dirname, '../packages/core/src/jsx-runtime'),
      'astrajs.dev/core/jsx-dev-runtime': path.resolve(__dirname, '../packages/core/src/jsx-dev-runtime'),
      'astrajs.dev/compiler/css': path.resolve(__dirname, '../packages/compiler/src/css'),
      'astrajs.dev/compiler': path.resolve(__dirname, '../packages/compiler/src'),
      'astrajs.dev/server': path.resolve(__dirname, '../packages/server/src'),
      'astrajs.dev/ssr': path.resolve(__dirname, '../packages/ssr/src'),
      'astrajs.dev/schema': path.resolve(__dirname, '../packages/schema/src'),
      'astrajs.dev/ai': path.resolve(__dirname, '../packages/ai/src'),
      'astrajs.dev/ai/rag': path.resolve(__dirname, '../packages/ai/src/rag'),
    },
  },
});
