import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@bpjs159/core': path.resolve(__dirname, 'src'),
      '@bpjs159/router': path.resolve(__dirname, '../router/src'),
      '@bpjs159/server': path.resolve(__dirname, '../server/src'),
      '@bpjs159/ssr': path.resolve(__dirname, '../ssr/src'),
      '@bpjs159/compiler': path.resolve(__dirname, '../compiler/src'),
    },
  },
});
