import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      'astrajs.dev/core': path.resolve(__dirname, 'src'),
      'astrajs.dev/router': path.resolve(__dirname, '../router/src'),
      'astrajs.dev/server': path.resolve(__dirname, '../server/src'),
      'astrajs.dev/ssr': path.resolve(__dirname, '../ssr/src'),
      'astrajs.dev/compiler': path.resolve(__dirname, '../compiler/src'),
    },
  },
});
