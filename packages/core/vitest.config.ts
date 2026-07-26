import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@astrajs/core': path.resolve(__dirname, 'src'),
      '@astrajs/router': path.resolve(__dirname, '../router/src'),
      '@astrajs/server': path.resolve(__dirname, '../server/src'),
      '@astrajs/ssr': path.resolve(__dirname, '../ssr/src'),
      '@astrajs/compiler': path.resolve(__dirname, '../compiler/src'),
    },
  },
});
